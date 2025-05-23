const express = require('express');
const cors = require('cors');
const db = require('./db');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));


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
app.get('/members/:studentId', async (req, res) => {
  const studentId = req.params.studentId;
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
  const {
    studentId, name, department, grade,
    phone, email, password, emergency_contact_name,
    emergency_contact_phone, diet, join_date,
    clubId, roleId, operatorId // 來自前端登入者
  } = req.body;

  try {
    // 檢查 operator 是否有權限新增（只能是社長1或副社長2）
    const [[operator]] = await db.query(`
      SELECT role_id FROM ClubMember
      WHERE student_id = ? AND club_id = ?
    `, [operatorId, clubId]);

    if (!operator || ![1, 2].includes(operator.role_id)) {
      return res.status(403).json({ message: '您沒有權限新增會員' });
    }

    // 新增 member 資料
    await db.query(`
      INSERT INTO Member (
        student_id, name, department, grade, phone, email,
        password, emergency_contact_name, emergency_contact_phone, diet, join_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      studentId, name, department, grade, phone, email,
      password, emergency_contact_name, emergency_contact_phone, diet, join_date
    ]);

    // 同時加進 ClubMember 表
    await db.query(`
      INSERT INTO ClubMember (student_id, club_id, role_id, join_semester)
      VALUES (?, ?, ?, ?)
    `, [studentId, clubId, roleId, '113-2']);

    res.status(201).json({ message: '會員新增成功' });
  } catch (err) {
    console.error('新增會員失敗：', err.message);
    res.status(500).send('新增會員失敗');
  }
});


// 編輯會員資料
app.put('/members/:studentId', async (req, res) => {
  const studentId = req.params.studentId;
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
app.delete('/members/:studentId', async (req, res) => {
  const studentId = req.params.studentId;
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

// 個人資料頁面（含加入社團紀錄）
app.get('/api/member/profile/:studentId', async (req, res) => {
  const studentId = req.params.studentId;
  try {
    const [[member]] = await db.query('SELECT * FROM Member WHERE student_id = ?', [studentId]);
    const [clubs] = await db.query(`
      SELECT join_semester, Club.club_id, Club.club_name, Role.role_name
      FROM ClubMember
      JOIN Club ON ClubMember.club_id = Club.club_id
      JOIN Role ON ClubMember.role_id = Role.role_id
      WHERE student_id = ?
      ORDER BY join_semester DESC
    `, [studentId]);

    res.json({ member, clubs });
  } catch (err) {
    console.error('載入會員個人資料錯誤：', err.message);
    res.status(500).json({ message: '資料庫錯誤' });
  }
});

// 會員總覽頁面（管理者）
app.get('/api/member/list/:clubId', async (req, res) => {
  const clubId = req.params.clubId;
  try {
    const [rows] = await db.query(`
      SELECT member.student_id, member.name, member.department, member.grade, role.role_name
      FROM clubmember
      JOIN member ON clubmember.student_id = member.student_id
      JOIN role ON clubmember.role_id = role.role_id
      WHERE clubmember.club_id = ?
    `, [clubId]);
    res.json(rows);
  } catch (err) {
    console.error('載入社團會員列表錯誤：', err.message);
    res.status(500).json({ message: '資料庫錯誤' });
  }
});


// 會員詳細資料頁面（管理者）
  app.get('/api/member/detail/:studentId', async (req, res) => {
    const studentId = req.params.studentId;
    try {
      const [[member]] = await db.query('SELECT * FROM Member WHERE student_id = ?', [studentId]);
      res.json(member);
    } catch (err) {
      console.error('查詢會員詳細資料失敗：', err.message);
      res.status(500).json({ message: '資料庫錯誤' });
    }
  });

  //會員權限
  // ===== 權限管理 =====

  // ① 取得整個社團的成員＋權限   ← 放在最前面，比對最具體
  app.get('/api/role-management/:clubId/members', async (req, res) => {
    const { clubId } = req.params;
    try {
      const [rows] = await db.query(`
        SELECT 
          cm.student_id,
          m.name,
          cm.role_id,
          IFNULL(r.role_name, '未知')         AS role_name,
          COALESCE(p.can_manage_member, 0)   AS can_manage_member,
          COALESCE(p.can_manage_asset, 0)    AS can_manage_asset,
          COALESCE(p.can_manage_finance, 0)  AS can_manage_finance,
          COALESCE(p.can_manage_permission,0)AS can_manage_permission
        FROM clubmember cm
        LEFT JOIN member m      ON m.student_id = cm.student_id
        LEFT JOIN role   r      ON r.role_id    = cm.role_id
        LEFT JOIN permission p  ON p.club_id    = cm.club_id
                                AND p.role_id   = cm.role_id
        WHERE cm.club_id = ?
        ORDER BY cm.role_id, cm.student_id
      `, [clubId]);

      res.json(rows);
    } catch (err) {
      console.error('查詢成員權限失敗', err);
      res.status(500).json({ error: '資料庫錯誤' });
    }
  });

  // ② 查單一成員在社團中的角色
  app.get('/api/role-management/:clubId/:studentId', async (req, res) => {
    const { clubId, studentId } = req.params;
    try {
      const [[result]] = await db.query(
        'SELECT role_id FROM clubmember WHERE club_id = ? AND student_id = ?',
        [clubId, studentId]
      );
      if (!result) return res.status(404).json({ error: '找不到成員在該社團中的資料' });

      res.json(result);
    } catch (err) {
      console.error('查詢使用者角色失敗：', err);
      res.status(500).json({ error: '伺服器錯誤' });
    }
  });

  // 🛠 更新整個社團的某個職位對應的權限
  app.put('/api/role-management/:clubId/:roleId', async (req, res) => {
    const { clubId, roleId } = req.params;
    const {
      can_manage_member,
      can_manage_asset,
      can_manage_finance,
      can_manage_permission
    } = req.body;

    try {
      const [result] = await db.query(`
        UPDATE permission SET 
          can_manage_member = ?,
          can_manage_asset = ?,
          can_manage_finance = ?,
          can_manage_permission = ?
        WHERE club_id = ? AND role_id = ?
      `, [
        can_manage_member ? 1 : 0,
        can_manage_asset ? 1 : 0,
        can_manage_finance ? 1 : 0,
        can_manage_permission ? 1 : 0,
        clubId, roleId
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: '找不到權限設定' });
      }

      res.json({ message: '更新成功' });
    } catch (err) {
      console.error('更新權限失敗', err);
      res.status(500).json({ error: '伺服器錯誤' });
    }
  });


// 啟動伺服器
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
