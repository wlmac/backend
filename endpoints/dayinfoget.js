const helper = require('../lib/helper');
const config = require('../config.json');
const term = require('../data/term');

function newDate(dateString) {
    // Hacky but what can I do?
    return new Date(`${dateString}T00:00:00`);
}

function isEventWithinDateRange(rangeStart, rangeEnd, eventDate) {
    let startDate = newDate(rangeStart);
    let endDate = newDate(rangeEnd);

    return startDate <= eventDate && eventDate < endDate;
}

function getEvents(date) {
    return term.events.filter(dayEvent => isEventWithinDateRange(dayEvent.startDate, dayEvent.endDate, date));
}

function getDayStatus(date) {
    const dayEvents = getEvents(date);
    let result = {isHoliday: false, isEarlyDismissal: false, reason: null};

    if (!isEventWithinDateRange(term.startDate, term.endDate, date)) {
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
    if (!isEventWithinDateRange(term.startDate, term.endDate, date)) return null;

    let dayNum = 0;
    let currentDay = newDate(term.startDate);

    if (getDayStatus(date).isHoliday) return null;

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

    try {
        let result = {day: null, status: null, description: null};
        let date = newDate(req.body.date);

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
    } catch (err) {
        console.log(err);
        return res.status(500).json({status: 500, error: "Internal server error"});
    }
}
