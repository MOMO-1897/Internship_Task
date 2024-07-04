
const mysql = require('mysql2');

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'internship_task',
});
conn.connect(function(err, connection) {
    if (err) {
        console.log('database connection Failed');
        return;
    }
    });

module.exports = conn;
