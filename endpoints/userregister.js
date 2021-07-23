const sql = require('../lib/db');
const helper = require('../lib/helper');
const bcrypt = require('bcrypt');
const nanoid = require('nanoid');
const tokens = require('../data/tokens');
const mailjet = require('node-mailjet').connect(tokens.mail.username, tokens.mail.password);

module.exports.name = "user/register";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    for (const prop in req.body) {
        req.body[prop] = String(req.body[prop]);
    }
    if (req.body.password && req.body.firstname && req.body.lastname && req.body.email) {
        let password = req.body.password.trim();
        let email = req.body.email.trim();
        let firstname = req.body.firstname.trim();
        let lastname = req.body.lastname.trim();
        if (!helper.validateEmail(email)) {
            res.status(400).json({ status: 400, error: 'Invalid email' });
        }
        else if (!helper.validatePassword(password)) {
            res.status(400).json({ status: 400, error: 'Password must be minimum eight characters, at least one uppercase letter, one lowercase letter, and one number' }).end();
        }
        else if (firstname == "" || lastname == "") {
            res.status(400).json({ status: 400, error: 'Empty firstname or lastname' });
        }
        else {
            sql.dbRun(`SELECT * FROM users WHERE email = ?`, [email], 'get').then(row => {
                if (row) {
                    res.status(400).json({ status: 400, error: 'Email is in use' });
                }
                else {
                    let id = nanoid.nanoid();
                    bcrypt.hash(password, 10, function (err, hash) {
                        if (err) {
                            res.status(500).json({ status: 500, error: "Internal server error" });
                        }
                        else {
                            sql.dbRun(`INSERT INTO users(userid, firstname, lastname, email, password) VALUES(?, ?, ?, ?, ?)`, [id, firstname, lastname, email, hash], 'run').then(() => {
                                let verify = nanoid.nanoid(36);
                                sql.dbRun(`INSERT INTO verify (code, issueat, userid) VALUES(?, ?, ?)`, [verify, Date.now(), id], 'run').then(() => {
                                    const request = mailjet.post("send", { 'version': 'v3.1' })
                                        .request({
                                            "Messages": [{
                                                "From": { "Email": tokens.mail.originEmail, "Name": tokens.mail.name },
                                                "To": [{ "Email": `${email}`, "Name": `${firstname} ${lastname}` }],
                                                "Subject": "Verification Email",
                                                "HTMLPart": `<h3>Hello ${firstname} ${lastname} and welcome to maclyonsden!</h3>Here is your verification code <b>${verify}</b>. <br>:)<br><br>- SAC Website Devs<br><br>P.S. If you didn't sign up at the WLMAC SAC website, someone else may be using your email!`
                                            }
                                            ]
                                        })
                                    request.then((result) => {
                                        //at this point the client should redirect to a verification page to prompt verification code
                                        res.status(200).json({ id });
                                    }).catch((err) => {
                                        res.status(500).json({ status: 500, error: "Internal server error" });
                                    })
                                }).catch(err => res.status(500).json({ status: 500, error: "Internal server error" }));
                            }).catch(err => res.status(500).json({ status: 500, error: "Internal server error" }));
                        }
                    })
                }
            }).catch(err => res.status(500).json({ status: 500, error: "Internal server error" }));
        }
    }
    else {
        res.status(400).json({ status: 400, error: "Missing required fields" });
    }
}
