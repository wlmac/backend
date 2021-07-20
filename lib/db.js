const sqlite3 = require('sqlite3');

module.exports.dbRun = function (statement, params, type) {
    //type needs to be 'run', 'all', or 'get'
    return new Promise((resolve, reject) => {
        let db = new sqlite3.Database('./data/data.db', (type === 'run') ? sqlite3.OPEN_READWRITE : sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                console.error(err.message);
                reject(`Error occurred on ${statement}`);
                return;
            }
        });
        db[type](statement, params, (err, rows) => {
            if (err) {
                console.error(err.message);
                reject(`Error occurred on ${statement}`);
                return;
            }
            else {
                db.close((err) => {
                    if (err) {
                        console.error(err.message);
                        reject(`Error occurred on ${statement}`);
                        return;
                    }
                    else {
                        if (type === 'run') {
                            resolve();
                        }
                        else {
                            resolve(rows);
                        }
                        return;
                    }
                })
            }
        })
    });
}
