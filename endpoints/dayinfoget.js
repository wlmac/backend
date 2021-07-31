const helper = require('../lib/helper');
const config = require('../config.json');
const term = require('../data/term');

function newLocalDate(dateString) {
    // Hacky but what can I do?
    return new Date(`${dateString}T00:00:00`);
}

function isDateWithinDateRange(rangeStart, rangeEnd, date) {
    let startDate = newLocalDate(rangeStart);
    let endDate = newLocalDate(rangeEnd);

    return startDate <= date && date < endDate;
}

function getEvents(date) {
    return term.events.filter(dayEvent => isDateWithinDateRange(dayEvent.startDate, dayEvent.endDate, date));
}

function getDayStatus(date) {
    const dayEvents = getEvents(date);
    let result = {isHoliday: false, isEarlyDismissal: false, reason: null};

    if (!isDateWithinDateRange(term.startDate, term.endDate, date)) {
        result.isHoliday = true;
        result.reason = "No ongoing term";

        return result;
    }

    for (const dayEvent of dayEvents) {
        if (dayEvent.isHoliday) {
            result.isHoliday = true;
            result.reason = dayEvent.name;
        } else if (dayEvent.isEarlyDismissal) {
            result.isEarlyDismissal = true;
            if (!result.isHoliday || result.reason == null) {
                result.reason = dayEvent.name;
            }
        } else if (result.reason == null) {
            result.reason = dayEvent.name;
        }
    }

    if (date.getDay() % 6 == 0) {
        if (!result.isHoliday || result.reason == null) {
            result.reason = "Weekend";
        }

        result.isHoliday = true;
    }

    return result;
}

function getDayNumber(date) {
    if (!isDateWithinDateRange(term.startDate, term.endDate, date)) {
        return null;
    }

    let dayNum = 0;
    let currentDay = newLocalDate(term.startDate);

    if (getDayStatus(date).isHoliday) {
        return null;
    }

    while (currentDay < date) {
        if (!getDayStatus(currentDay).isHoliday) {
            dayNum += 1;
        }

        currentDay.setDate(currentDay.getDate() + 1);
    }

    return dayNum % term.days + 1;
}

module.exports.name = "dayinfo/get";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    if (!req.body.date) {
        return res.status(400).json({status: 400, error: "Missing required field"});
    }

    let result = {day: null, status: null, description: null};
    let date = newLocalDate(req.body.date);
    
    if (isNaN(date)) {
        return res.status(400).json({status: 400, error: "Invalid date format"});
    }

    result.day = getDayNumber(date);
    result.status = getDayStatus(date);

    if (result.day === null) {
        result.description = `No School - ${result.status.reason}`;
    } else if (result.status.isEarlyDismissal) {
        result.description = `Day ${result.day} - Early Dismissal - ${result.status.reason}`;
    } else if (result.status.reason != null) {
        result.description = `Day ${result.day} - ${result.status.reason}`;
    } else {
        result.description = `Day ${result.day}`;
    }

    return res.status(200).json(result);
}
