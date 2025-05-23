const db = require('../db');

/* 1️⃣ 新增或更新費用 ----------------------------------------------------- */
exports.upsertFee = async (req, res) => {
    const { fee_id, club_id, name, amount, deadline, target, members = [] } = req.body;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        let id = fee_id;

        if (!fee_id) {
            const [r] = await conn.query(
                `INSERT INTO fees (club_id, name, amount, deadline, target)
         VALUES (?, ?, ?, ?, ?)`,
                [club_id, name, amount, deadline, target]
            );
            id = r.insertId;
        } else {
            await conn.query(
                `UPDATE fees
            SET name = ?, amount = ?, deadline = ?, target = ?
          WHERE fee_id = ?`,
                [name, amount, deadline, target, fee_id]
            );
            /* 刪舊指派 */
            await conn.query(`DELETE FROM fee_assignments WHERE fee_id = ?`, [fee_id]);
        }

        /* 只有部分社員才需要 fee_assignments */
        if (target === 'partial' && Array.isArray(members) && members.length) {
            const values = members.map(sid => [id, sid]);
            await conn.query(
                `INSERT INTO fee_assignments (fee_id, student_id) VALUES ?`,
                [values]
            );
        }

        await conn.commit();
        res.json({ success: true, fee_id: id });
    } catch (e) {
        await conn.rollback();
        res.status(500).json({ error: e.message });
    } finally {
        conn.release();
    }
};

/* 2️⃣ 刪除費用 ----------------------------------------------------------- */
exports.deleteFee = async (req, res) => {
    try {
        await db.query(`DELETE FROM fees WHERE fee_id = ?`, [req.params.feeId]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

/* 3️⃣ 取得費用總覽 ------------------------------------------------------- */
exports.getAllFees = async (req, res) => {
    const { club_id, id } = req.query;
    try {
        let sql = `
      SELECT f.*,
             (CASE WHEN f.target = 'all'
                   THEN (SELECT COUNT(*) FROM clubmember WHERE club_id = f.club_id)
                   ELSE (SELECT COUNT(*) FROM fee_assignments WHERE fee_id = f.fee_id)
              END) AS should_pay,
             (SELECT COUNT(*) FROM payments WHERE fee_id = f.fee_id) AS paid
        FROM fees f
       WHERE f.club_id = ?`;
        const params = [club_id];
        if (id) { sql += ' AND f.fee_id = ?'; params.push(id); }

        const [fees] = await db.query(sql, params);

        res.json(
            fees.map(r => ({
                ...r,
                unpaid: r.should_pay - r.paid,
                total_amount: r.should_pay * r.amount,
            }))
        );
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

/* 4️⃣ 取得單筆費用之繳費狀態 ------------------------------------------- */
exports.getPaymentStatus = async (req, res) => {
    const feeId = req.params.feeId;
    try {
        const [[fee]] = await db.query(
            `SELECT club_id, target, deadline FROM fees WHERE fee_id = ?`,
            [feeId]
        );
        if (!fee) return res.status(404).json({ error: 'fee not found' });

        let targets;
        if (fee.target === 'partial') {
            [targets] = await db.query(
                `SELECT m.student_id, m.name, m.department
           FROM fee_assignments fa
           JOIN member m ON m.student_id = fa.student_id
          WHERE fa.fee_id = ?`,
                [feeId]
            );
        } else {
            [targets] = await db.query(
                `SELECT m.student_id, m.name, m.department
           FROM clubmember c
           JOIN member m ON m.student_id = c.student_id
          WHERE c.club_id = ?`,
                [fee.club_id]
            );
        }

        const [records] = await db.query(
            `SELECT student_id FROM payments WHERE fee_id = ?`,
            [feeId]
        );
        const paidSet = new Set(records.map(r => r.student_id));
        const today = new Date();
        const deadline = new Date(fee.deadline);

        res.json(
            targets.map(t => ({
                student_id: t.student_id,
                name: t.name,
                department: t.department,
                status: paidSet.has(t.student_id)
                    ? '已繳'
                    : today > deadline ? '逾期' : '未繳'
            }))
        );
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

/* 5️⃣ 新增繳費紀錄（一次多筆） ----------------------------------------- */
exports.addPayment = async (req, res) => {
    const { fee_id, student_ids, amount } = req.body;
    try {
        const values = student_ids.map(sid => [fee_id, sid, amount]);
        await db.query(
            `INSERT INTO payments (fee_id, student_id, amount) VALUES ?`,
            [values]
        );
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

/* 6️⃣ 個人繳費紀錄（限指定社團） -------------------------------------- */
exports.getPersonalPayments = async (req, res) => {
    const sid = req.params.studentId;
    const club_id = req.query.club_id;          // ★ 新增：指定社團
    if (!club_id) return res.status(400).json({ error: 'club_id required' });

    try {
        const [rows] = await db.query(
            `SELECT DISTINCT
              f.name,
              f.amount,
              f.deadline,
              CASE
                WHEN p.payment_id IS NOT NULL               THEN '已繳'
                WHEN f.deadline < CURRENT_DATE()            THEN '逾期'
                ELSE '未繳'
              END AS status
         FROM fees f
         /* 判斷是否指派 */
         LEFT JOIN fee_assignments fa
           ON fa.fee_id     = f.fee_id
          AND fa.student_id = ?
         /* 判斷是否已繳 */
         LEFT JOIN payments p
           ON p.fee_id      = f.fee_id
          AND p.student_id  = ?
         /* 確認已加入該社團（for target = 'all'） */
         LEFT JOIN clubmember cm
           ON cm.club_id    = f.club_id
          AND cm.student_id = ?
        WHERE f.club_id = ?                              -- ★ 僅此社團
          AND (
                (f.target = 'all'     AND cm.student_id IS NOT NULL)
             OR (f.target = 'partial' AND fa.student_id IS NOT NULL)
              )
        ORDER BY f.deadline DESC`,
            [sid, sid, sid, club_id]            // 對應 ? 參數
        );
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
