const jwt = require('jsonwebtoken');
const config = require('../config.json');
const sql = require('../lib/db');

module.exports.name = "user/tokenrefresh";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    let refeshAuth = req.body.token;
    if (!refeshAuth) {
        res.status(400).json({ status: 400, error: 'No refresh token in body' });
    }
    jwt.verify(refeshAuth, config.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ status: 401, error: "Invalid or expired refresh token" });
        }
        else {
            sql.dbRun(`SELECT * FROM refresh WHERE userid = ?`, [user.userid], 'get').then(ref => {
                if (!ref || ref.sessionid !== user.accesstokendata.sessionid) {
                    return res.status(401).json({ status: 401, error: "Invalid or expired refresh token" });
                }
                else {
                    const accessToken = jwt.sign(user.accesstokendata, config.TOKEN_SECRET, { expiresIn: '20m' });
                    res.json({
                        accessToken
                    });
                }
            }).catch(err => res.status(500).json({ status: 500, error: "Internal server error" }));
        }
    });
}
