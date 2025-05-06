// backend/financeController.js
const db = require('../db');

// 建立新費用項目
exports.createFee = async (req, res) => {
  const { name, amount, deadline, target, members } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO fees (name, amount, deadline, target) VALUES (?, ?, ?, ?)`,
      [name, amount, deadline, target]
    );
    const feeId = result.insertId;

    if (target === 'partial' && members?.length) {
      const values = members.map(mid => [feeId, mid]);
      await conn.query(`INSERT INTO fee_assignments (fee_id, student_id) VALUES ?`, [values]);
    }

    await conn.commit();
    res.status(201).json({ message: '費用建立成功' });
  } catch (err) {
    await conn.rollback();
    console.error('建立費用失敗：', err.message);
    res.status(500).json({ message: '費用建立失敗' });
  } finally {
    conn.release();
  }
};

// 取得費用總覽
exports.getAllFees = async (req, res) => {
    const { clubId } = req.query;
    try {
      const [fees] = await db.query(`
        SELECT
          f.id,
          f.name,
          f.amount,
          f.deadline,
          f.target,
          f.created_at,
  
          -- 應繳人數
          CASE
            WHEN f.target = 'all' THEN (
              SELECT COUNT(*) FROM clubmember cm
              WHERE cm.club_id = ?
            )
            ELSE (
              SELECT COUNT(*) FROM fee_assignments fa
              WHERE fa.fee_id = f.id
            )
          END AS total_people,
  
          -- 已繳人數
          (
            SELECT COUNT(*) FROM payments p
            WHERE p.fee_id = f.id AND p.status = '已繳'
          ) AS paid_people
  
        FROM fees f
        ORDER BY f.created_at DESC
      `, [clubId]);
  
      // 計算未繳人數和總金額
      const enrichedFees = fees.map(f => ({
        ...f,
        unpaid_people: f.total_people - f.paid_people,
        total_amount: f.amount * f.total_people
      }));
  
      res.json(enrichedFees);
    } catch (err) {
      console.error('讀取費用總覽失敗：', err.message);
      res.status(500).json({ message: '讀取失敗' });
    }
  };

// 提供簡化費用項目清單 (給 dropdown 使用)
exports.getSimpleFees = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT id, name FROM fees`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '讀取簡化費用列表失敗' });
  }
};

// 登記繳費紀錄
exports.addPayment = async (req, res) => {
  const { student_id, fee_id, method, date } = req.body;
  try {
    await db.query(
      `INSERT INTO payments (student_id, fee_id, method, date, status)
       VALUES (?, ?, ?, ?, '已繳')`,
      [student_id, fee_id, method, date]
    );
    res.status(201).json({ message: '繳費紀錄新增成功' });
  } catch (err) {
    res.status(500).json({ message: '繳費紀錄新增失敗' });
  }
};

// 查詢個人繳費紀錄
exports.getPersonalPayments = async (req, res) => {
  const student_id = req.params.studentId;
  try {
    const [rows] = await db.query(`
      SELECT f.name AS fee_name, f.amount, p.method, p.date, p.status
      FROM payments p
      JOIN fees f ON f.id = p.fee_id
      WHERE p.student_id = ?
    `, [student_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '查詢失敗' });
  }
};

// 查詢指定費用的繳費狀態
exports.getPaymentStatus = async (req, res) => {
  const feeId = req.params.feeId;
  try {
    const [rows] = await db.query(`
      SELECT m.student_id, m.name, IFNULL(p.status, '未繳') AS status
      FROM Member m
      LEFT JOIN payments p ON m.student_id = p.student_id AND p.fee_id = ?
      WHERE ? IN (
        SELECT fee_id FROM fees WHERE target = 'all'
        UNION
        SELECT fee_id FROM fee_assignments WHERE student_id = m.student_id
      )
    `, [feeId, feeId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '查詢繳費狀態失敗' });
  }
};
