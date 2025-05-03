const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const path = require('path'); // ✅ 新增
const app = express();
const PORT = 3001;

app.use(express.json());

// ✅ 新增這一行：讓 Express 提供 public 裡的 HTML、CSS、JS 等檔案
app.use(express.static(path.join(__dirname, '../public')));

// 資料庫連線
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Tiffany20041102',
  database: 'dbms-project',
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ Database connected!');
});

// 登入 API
app.post('/api/login', (req, res) => {
  const { student_id, password } = req.body;

  if (!student_id || !password) {
    return res.status(400).json({ message: '請輸入帳號與密碼' });
  }

  db.query('SELECT * FROM Member WHERE student_id = ?', [student_id], (err, results) => {
    if (err) return res.status(500).json({ message: '資料庫查詢失敗' });
    if (results.length === 0) {
      return res.status(401).json({ message: '帳號錯誤' });
    }

    const user = results[0];
    if (password !== user.password) {
      return res.status(401).json({ message: '密碼錯誤' });
    }

    const token = jwt.sign(
      { student_id: user.student_id, name: user.name },
      'your_jwt_secret_key',
      { expiresIn: '1h' }
    );

    res.json({ token });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
