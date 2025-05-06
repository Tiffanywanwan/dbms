const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
<<<<<<< HEAD
  user: 'root', //請輸自己的密碼
  password: '你的密碼', //請輸自己的密碼
=======
  user: 'root', //請輸自己的帳號
  password: 'erica1029', //請輸自己的密碼
>>>>>>> 116f9c6 (Initial commit)
  database: 'dbms-project',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
