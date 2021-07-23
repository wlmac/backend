const sql = require('../lib/db');
const helper = require('../lib/helper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nanoid = require('nanoid');
const config = require('../config.json');

module.exports.name = "user/login";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    for (const prop in req.body) {
        req.body[prop] = String(req.body[prop]).trim();
    }
    if (!req.body.password && !req.body.email) {
        return res.status(400).json({ status: 400, error: 'Missing required fields' });
    }
    let password = req.body.password;
    let email = req.body.email.toLowerCase();
    if (email == "") {
        return res.status(400).json({ status: 400, error: 'Empty fields' });
    }
    if (!helper.validateEmail(email)) {
        return res.status(400).json({ status: 400, error: 'Invalid email' });
    }
    if (!helper.validatePassword(password)) {
        return res.status(400).json({ status: 400, error: 'Invalid password' });
    }
    sql.dbRun(`SELECT * FROM users WHERE email = ?`, [email], 'get').then(row => {
        if (!row) {
            return res.status(401).json({ status: 401, error: 'Email or password is incorrect' });
        }
        bcrypt.compare(password, row.password, function (err, result) {
            if (err) {
                return res.status(500).json({ status: 500, error: "Internal server error" });
            }
            if (!result) {
                return res.status(401).json({ status: 401, error: 'Email or password is incorrect' });
            }
            // Either user unverified or account suspended
            if (row.generalAccessLevel <= 0) {
                return res.status(403).json({ status: 403, error: `Login denied. ${row.generalAccessLevel == 0 ? "Verification needed" : "Account suspended"}` });
            }
            let sessionid = nanoid.nanoid();
            let obj = row;
            delete obj.password;
            let accessToken = jwt.sign(obj, config.TOKEN_SECRET, { expiresIn: "20m" });
            let refreshToken = jwt.sign({ userid: obj.userid, sessionid: sessionid, accesstokendata: obj }, config.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
            sql.dbRun(`DELETE FROM refresh WHERE userid = ?`, [obj.userid], 'run').then(() => {
                sql.dbRun(`INSERT INTO refresh (issueat, sessionid, userid) VALUES(?, ?, ?)`, [Date.now(), sessionid, obj.userid], 'run').then(() => {
                    res.json({
                        accessToken,
                        refreshToken
                    });
                }).catch(err => res.status(500).json({ status: 500, error: "Internal server error" }));
            }).catch(err => res.status(500).json({ status: 500, error: "Internal server error" }));
        });
    }).catch(err => res.status(500).json({ status: 500, error: "Internal server error" }));
}
