// backend/middleware/requireFinance.js
const db = require('../db');

/**
 * 只有在 Permission.can_manage_finance = 1 時才放行
 * 前端每個 request 會自動加兩個 header：
 *   X-Student-Id : <目前登入者 student_id>
 *   X-Club-Id    : <目前社團 club_id>
 */
module.exports = async function requireFinance (req, res, next) {
  try {
    const sid    = req.headers['x-student-id'];
    const clubId = req.headers['x-club-id'];
    if (!sid || !clubId)
      return res.status(401).json({ error: 'No auth info' });

    const [[row]] = await db.query(`
      SELECT p.can_manage_finance
        FROM clubmember cm
        JOIN permission p USING (club_id, role_id)
       WHERE cm.student_id = ?
         AND cm.club_id    = ?`,
      [sid, clubId]
    );

    if (row && row.can_manage_finance) return next();    // ✅ 通過
    return res.status(403).json({ error: 'Finance permission required' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
