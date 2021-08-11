const sql = require('../lib/db');
const helper = require('../lib/helper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nanoid = require('nanoid');
const config = require('../config.json');

module.exports.name = "user/edit";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    let authHeader = req.headers.authorization;
    if (!authHeader && authHeader.split(' ').length >= 2) {
        return false;
    }

    let token = authHeader.split(' ')[1];
    try {
        let user = jwt.verify(token, config.TOKEN_SECRET);
        return user && user.generalaccesslevel > 0;
    }
    catch {
        return false;
    }
}

module.exports.execute = function (req, res) {
    if (!req.body.userid) {
        return res.status(400).json({ status: 400, error: 'Missing userid argument' });
    }
    let user = jwt.decode(authHeader.split(' ')[1]);
    sql.dbRun('SELECT * FROM users WHERE userid = ?', [req.body.userid], 'get').then(row => {
        if (!row) {
            return res.status(404).json({ status: 404, error: 'User not found' });
        }
        else if (user.userid === req.body.userid || (row.generalaccesslevel < user.generalaccesslevel && user.generalaccesslevel >= 3)) {
            
            //self editing. Can change: password, gradyear, and profilepicture
            //Admin editing. Can change basically everything except for userid. Also cannot give permissions equal or above perm level/usertype
            //this is just a general idea
        }
        else {
            return res.status(403).json({ status: 403, error: 'Insufficient permissions' });
        }
    }).catch(err => {
        res.status(500).json({ status: 500, error: "Internal server error" });
    })
}
