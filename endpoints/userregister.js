const sql = require('../lib/db');
const helper = require('../lib/helper');
const bcrypt = require('bcrypt');
const nanoid = require('nanoid');
const tokens = require('../data/tokens');
const mailjet = require('node-mailjet').connect(tokens.mail.username, tokens.mail.password);

module.exports.name = "user/register";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    for (const prop in req.body) {
        req.body[prop] = String(req.body[prop]);
    }
    if (!req.body.password || !req.body.firstname || !req.body.lastname || !req.body.email) {
        res.status(400).json({ status: 400, error: "Missing required fields" });
    }

    let password = req.body.password;
    let email = req.body.email.trim().toLowerCase();
    let firstname = req.body.firstname.trim();
    let lastname = req.body.lastname.trim();
    let gradyear = parseInt(req.body.gradyear);
    if (!helper.validateEmail(email)) {
        return res.status(400).json({ status: 400, error: 'Invalid email' });
    }
    if (!helper.validatePassword(password)) {
        return res.status(400).json({ status: 400, error: 'Password must be minimum eight characters, at least one uppercase letter, one lowercase letter, and one number' }).end();
    }
    if (firstname == "" || lastname == "") {
        return res.status(400).json({ status: 400, error: 'Empty firstname or lastname' });
    }
    if (isNaN(gradyear) || gradyear <= 2020) {
        return res.status(400).json({ status: 400, error: 'Invalid graduation year' });
    }
    sql.dbRun(`SELECT * FROM users WHERE email = ?`, [email], 'get').then(row => {
        if (row) {
            return res.status(400).json({ status: 400, error: 'Email is in use' });
        }
        let id = nanoid.nanoid();
        bcrypt.hash(password, 10, function (err, hash) {
            if (err) {
                return res.status(500).json({ status: 500, error: "Internal server error" });
            }
            sql.dbRun(`INSERT INTO users(userid, firstname, lastname, email, password, gradyear) VALUES(?, ?, ?, ?, ?, ?)`, [id, firstname, lastname, email, hash, gradyear], 'run').then(() => {
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
        })
    }).catch(err => res.status(500).json({ status: 500, error: "Internal server error" }));
}
