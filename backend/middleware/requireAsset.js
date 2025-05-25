const db = require('../db');

/**
 * 檢查資產管理權限
 * 前端每個 request 會自動加兩個 header：
 *   X-Student-Id : <目前登入者 student_id>
 *   X-Club-Id    : <目前社團 club_id>
 * 
 * 權限規則：
 * - can_manage_asset=1: 可以管理社產（新增、編輯、刪除）和借用社產
 * - can_manage_asset=0: 只能借用社產
 */
module.exports = async function requireAsset (req, res, next) {
  try {
    const sid    = req.headers['x-student-id'];
    const clubId = req.headers['x-club-id'];
    if (!sid || !clubId)
      return res.status(401).json({ error: 'No auth info' });

    const [[row]] = await db.query(`
      SELECT p.can_manage_asset
        FROM clubmember cm
        JOIN permission p USING (club_id, role_id)
       WHERE cm.student_id = ?
         AND cm.club_id    = ?`,
      [sid, clubId]
    );

    // 如果是借用社產的請求，所有人都可以
    if (req.path.includes('/borrow') || req.path.includes('/return')) {
      return next();
    }

    // 如果是管理社產的請求，需要 can_manage_asset=1
    if (row && row.can_manage_asset) return next();
    return res.status(403).json({ error: 'Asset management permission required' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}; 