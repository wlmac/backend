const sql = require('../lib/db');
const jwt = require('jsonwebtoken');
const config = require('../config.json');

module.exports.name = "user/logout";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    let refreshAuth = req.body.token;
    if (!refreshAuth) {
        return res.status(401).json({ status: 401, error: "Missing token field in body" });
    }
    jwt.verify(refreshAuth, config.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ status: 401, error: "Invalid or expired refresh token" });
        }
        sql.dbRun(`SELECT * FROM refresh WHERE userid = ?`, [user.userid], 'get').then(ref => {
            if (!ref) {
                return res.status(401).json({ status: 401, error: "Invalid or expired refresh token" });
            }
            else if (ref.sessionid === user.accesstokendata.sessionid) {
                sql.dbRun(`DELETE FROM refresh WHERE userid = ?`, [ref.userid], 'run').then(() => {
                    res.status(200).json({ message: 'Logout success' });
                }).catch(err => res.status(500).json({ status: 500, error: "Internal server error" }));
            } else {
                return res.status(401).json({ status: 401, error: "Invalid or expired refresh token" });
            }
        }).catch(err => res.status(500).json({ status: 500, error: "Internal server error" }));
    });
}
