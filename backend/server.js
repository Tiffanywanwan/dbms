const express = require('express');
const cors = require('cors');
const db = require('./db');
const path = require('path');
const financeRoutes = require('./routes/financeRoutes');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use("/api", financeRoutes); // ← 所有財務功能用 /api 開頭


// 根目錄測試
app.get('/', (req, res) => {
  res.send('會員管理 API 正常運作中');
});

// 查詢所有會員資料
app.get('/members', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Member');
    res.json(rows);
  } catch (err) {
    console.error('查詢所有會員失敗：', err.message);
    res.status(500).send('資料庫錯誤');
  }
});

// 查詢單一會員資料
app.get('/members/:student_id', async (req, res) => {
  const studentId = req.params.student_id;
  try {
    const [rows] = await db.query('SELECT * FROM Member WHERE student_id = ?', [studentId]);
    if (rows.length === 0) return res.status(404).json({ message: '找不到此會員' });
    res.json(rows[0]);
  } catch (err) {
    console.error('查詢會員失敗：', err.message);
    res.status(500).send('資料庫錯誤');
  }
});

// 新增會員資料
app.post('/members', async (req, res) => {
  const { student_id, name, department, grade, phone, email, role, join_date } = req.body;
  try {
    await db.query(
      `INSERT INTO Member (student_id, name, department, grade, phone, email, role, join_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, name, department, grade, phone, email, role, join_date]
    );
    res.status(201).json({ message: '會員新增成功' });
  } catch (err) {
    console.error('新增會員失敗：', err.message);
    res.status(500).send('新增會員失敗');
  }
});

// 編輯會員資料
app.put('/members/:student_id', async (req, res) => {
  const studentId = req.params.student_id;
  const { name, department, grade, phone, email, role, join_date } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE Member SET name=?, department=?, grade=?, phone=?, email=?, role=?, join_date=? WHERE student_id=?`,
      [name, department, grade, phone, email, role, join_date, studentId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: '找不到此會員' });
    res.json({ message: '會員更新成功' });
  } catch (err) {
    console.error('更新會員失敗：', err.message);
    res.status(500).send('更新會員失敗');
  }
});

// 刪除會員資料
app.delete('/members/:student_id', async (req, res) => {
  const studentId = req.params.student_id;
  try {
    const [result] = await db.query('DELETE FROM Member WHERE student_id = ?', [studentId]);
    if (result.affectedRows === 0) return res.status(404).json({ message: '找不到此會員' });
    res.json({ message: '會員已刪除' });
  } catch (err) {
    console.error('刪除會員失敗：', err.message);
    res.status(500).send('刪除會員失敗');
  }
});

// 登入 API
app.post('/api/login', async (req, res) => {
  const { student_id, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT * FROM Member WHERE student_id = ? AND password = ?',
      [student_id, password]
    );
    if (rows.length === 0) return res.status(401).json({ message: '帳號或密碼錯誤' });

    const user = rows[0];
    res.json({
      message: '登入成功',
      student_id: user.student_id,
      name: user.name,
      role: user.role
    });
  } catch (err) {
    console.error('登入錯誤：', err.message);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 取得使用者加入過的所有學期（不重複）
app.get('/api/members/:studentId/semesters', async (req, res) => {
  const studentId = req.params.studentId;
  const sql = `
    SELECT DISTINCT join_semester
    FROM ClubMember
    WHERE student_id = ?
    ORDER BY join_semester DESC
  `;
  try {
    const [results] = await db.query(sql, [studentId]);
    const semesters = results.map(r => r.join_semester);
    res.json(semesters);
  } catch (err) {
    console.error('學期查詢錯誤：', err.message);
    res.status(500).json({ message: '資料庫錯誤' });
  }
});

// 根據學生與學期查詢該學期加入的社團
app.get('/api/members/:studentId/clubs', async (req, res) => {
  const studentId = req.params.studentId;
  const semester = req.query.semester;

  let sql = `
    SELECT Club.club_id, Club.club_name
    FROM ClubMember
    JOIN Club ON Club.club_id = ClubMember.club_id
    WHERE ClubMember.student_id = ?
  `;
  const params = [studentId];

  if (semester) {
    sql += ' AND ClubMember.join_semester = ?';
    params.push(semester);
  }

  try {
    const [results] = await db.query(sql, params);
    res.json(results);
  } catch (err) {
    console.error('社團查詢失敗:', err.message);
    res.status(500).json({ message: '社團查詢錯誤' });
  }
});

// 根據 clubId 查社團名稱（顯示用）
app.get('/api/clubs/:clubId', async (req, res) => {
  const clubId = req.params.clubId;
  try {
    const [rows] = await db.query('SELECT * FROM Club WHERE club_id = ?', [clubId]);
    if (rows.length === 0) return res.status(404).json({ message: '找不到社團' });
    res.json(rows[0]);
  } catch (err) {
    console.error('查詢社團失敗：', err.message);
    res.status(500).json({ message: '資料庫錯誤' });
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
