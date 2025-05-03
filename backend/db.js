const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', //請輸自己的密碼
  password: '你的密碼', //請輸自己的密碼
  database: 'dbms-project',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
