const sql = require('../lib/db');
const helper = require('../lib/helper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nanoid = require('nanoid');
const config = require('../config.json');

module.exports.name = "user/get";
module.exports.verify = function (req, res) {
    let authHeader = req.headers.authorization;
    if (authHeader) {
        let token = authHeader.split(' ')[1];
        jwt.verify(token, config.TOKEN_SECRET, (err, user) => {
            if (err || user.generalaccesslevel <= 0) {
                return false;
            }
            else {
                return true;
            }
        })
    }
    else {
        return false;
    }
}

module.exports.execute = function (req, res) {
    if (req.body.userid) {
        sql.dbRun('SELECT * FROM users WHERE userid = ?', [req.body.userid], 'get').then(row => {
            if (row) {
                delete row.password;
                delete row.email;
                res.status(200).json(row);
            }
            else {
                res.status(404).json({ status: 400, error: 'User not found' });
            }
        }).catch(err => {
            res.status(500).json({ status: 500, error: "Internal server error" });
        })
    }
    else {
        res.status(400).json({ status: 400, error: 'Missing userid argument' });
    }
}
