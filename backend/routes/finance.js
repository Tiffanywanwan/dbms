const express = require('express');
const router = express.Router();
const finance = require('../controllers/financeController');
const db = require('../db');
const requireFinance = require('../middleware/requireFinance');


/* 社團社員清單 */
router.get('/members', async (req, res) => {
    const { club_id } = req.query;
    try {
        const [rows] = await db.query(
            `SELECT m.student_id,m.name
         FROM clubmember c
         JOIN member m ON m.student_id=c.student_id
        WHERE c.club_id=?`,
            [club_id]);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/* 費用 */
router.post('/fees', finance.upsertFee);
router.put('/fees/:feeId', finance.upsertFee);
router.delete('/fees/:feeId', finance.deleteFee);
router.get('/fees', finance.getAllFees);
router.get('/fees/:feeId/status', finance.getPaymentStatus);

/* 繳費 */
router.post('/payments', finance.addPayment);
router.get('/members/:studentId/payments', finance.getPersonalPayments);

module.exports = router;
