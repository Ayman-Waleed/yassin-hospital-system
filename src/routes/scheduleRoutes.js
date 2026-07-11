const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const requireAdmin = require('../middleware/authMiddleware');

// ===== مسارات عامة (للزوار) =====
// كل الدوام مع أسماء الأطباء والعيادات (لصفحة مواعيد العيادات)
router.get('/', scheduleController.getAllSchedules);
// جدول دوام طبيب معيّن
router.get('/doctor/:doctorId', scheduleController.getDoctorSchedule);
// الأوقات المتاحة لطبيب في تاريخ معيّن ?date=YYYY-MM-DD (لصفحات الحجز)
router.get('/available/:doctorId', scheduleController.getAvailableSlots);

// ===== مسارات إدارية (تتطلب جلسة دخول) =====
// إضافة/حذف فترة دوام
router.post('/add', requireAdmin, scheduleController.addSchedule);
router.post('/delete', requireAdmin, scheduleController.deleteSchedule);

module.exports = router;
