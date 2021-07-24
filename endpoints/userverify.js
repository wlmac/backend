const sql = require('../lib/db');

module.exports.name = "user/verify";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    /*
    format: 
    {
        "code": "blah"
    }
    */
    if (!req.body.code) {
        return res.status(400).json({ status: 400, error: "Missing code field in request body" });
    }
    sql.dbRun(`SELECT * FROM verify WHERE code = ?`, [req.body.code], 'get').then(row => {
        if (!row) {
            return res.status(401).json({ status: 401, error: "Invalid verification code" });
        }
        sql.dbRun(`DELETE FROM verify WHERE code = ?`, [req.body.code], 'run').then(() => {
            if (Date.now() - row.issueat < 1000 * 60 * 60 * 24) { //1 day
                sql.dbRun(`UPDATE users SET generalaccesslevel = 1 WHERE userid = ?`, [row.userid], 'run').then(() => {
                    res.status(200).json({ status: 200, message: "You are verified!" });
                }).catch(err => res.status(500).json({ status: 500, error: "Internal server error" }));
            }
            else {
                res.status(401).json({ status: 401, error: "Expired verification code" });
            }
        }).catch(err => res.status(500).json({ status: 500, error: "Internal server error" }));
    }).catch(err => res.status(500).json({ status: 500, error: "Internal server error" }));
}
