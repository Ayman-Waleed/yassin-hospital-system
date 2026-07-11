const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const requireAdmin = require('../middleware/authMiddleware');

// ===== مسارات عامة (للزوار) =====
// إرسال شكوى جديدة
router.post('/add', complaintController.addComplaint);
// متابعة المريض لرسائله وردود الإدارة بهاتفه
router.get('/patient/:phone', complaintController.getPatientComplaints);

// ===== مسارات إدارية (تتطلب جلسة دخول) =====
// كل الشكاوى ببيانات أصحابها — للإدارة فقط
router.get('/', requireAdmin, complaintController.getAllComplaints);
// الرد على شكوى
router.post('/reply', requireAdmin, complaintController.replyToComplaint);

module.exports = router;
