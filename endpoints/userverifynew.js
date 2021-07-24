const sql = require('../lib/db');
const helper = require('../lib/helper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nanoid = require('nanoid');
const config = require('../config.json');
const tokens = require('../data/tokens');
const mailjet = require('node-mailjet').connect(tokens.mail.username, tokens.mail.password);

module.exports.name = "user/verify/new";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    if (!req.body.userid) {
        return res.status(400).json({ status: 400, error: 'Missing user id field' });
    }
    sql.dbRun(`SELECT * FROM users WHERE userid = ?`, [req.body.userid.trim()], 'get').then(row => {
        if (!row) {
            return res.status(404).json({ status: 404, error: 'Unknown user' });
        }
        else if (row.generalaccesslevel == 0) {
            sql.dbRun(`DELETE FROM verify WHERE userid = ?`, [row.userid], 'run').then(() => {
                let verify = nanoid.nanoid(36);
                sql.dbRun(`INSERT INTO verify (code, issueat, userid) VALUES(?, ?, ?)`, [verify, Date.now(), row.userid], 'run').then(() => {
                    const request = mailjet.post("send", { 'version': 'v3.1' })
                        .request({
                            "Messages": [{
                                "From": { "Email": tokens.mail.originEmail, "Name": tokens.mail.name },
                                "To": [{ "Email": `${row.email}`, "Name": `${row.firstname} ${row.lastname}` }],
                                "Subject": "Verification Email",
                                "HTMLPart": `<h3>Hello ${row.firstname} ${row.lastname} and welcome to maclyonsden!</h3>Here is your verification code <b>${verify}</b> <br>:)<br><br>- SAC Website Devs<br><br>P.S. If you didn't sign up at the WLMAC SAC website, someone else may be using your email!`
                            }
                            ]
                        })
                    request.then((result) => {
                        //at this point the client should redirect to a verification page to prompt verification code
                        res.status(200).json({ status: 200, message: 'New email sent' });
                    }).catch((err) => {
                        res.status(500).json({ status: 500, error: "Internal server error" });
                    })
                }).catch(err => res.status(500).json({ status: 500, error: "Internal server error" }));
            }).catch(err => res.status(500).json({ status: 500, error: "Internal server error" }));
        }
        else {
            res.status(403).json({ status: 403, error: "No permission to access this endpoint" });
        }
    }).catch(err => res.status(500).json({ status: 500, error: "Internal server error" }));
}
