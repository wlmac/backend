const jwt = require('jsonwebtoken');
const config = require('../config.json');

module.exports.name = "user/tokenrefresh";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    let refeshAuth = req.body.token;
    if (refeshAuth) {
        jwt.verify(refeshAuth, config.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ status: 403, error: "Invalid or expired refresh token" });
            }
            else {
                const accessToken = jwt.sign(user.accesstokendata, config.TOKEN_SECRET, { expiresIn: '20m' });
                res.json({
                    accessToken
                });
            }
        });
    }
    else {
        res.status(400).json({ status: 400, error: 'No refresh token in body' });
    }
}
