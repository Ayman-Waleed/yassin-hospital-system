const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// كل الدوام مع أسماء الأطباء والعيادات (لصفحة مواعيد العيادات)
router.get('/', scheduleController.getAllSchedules);

// جدول دوام طبيب معيّن (لواجهة إدارة الدوام)
router.get('/doctor/:doctorId', scheduleController.getDoctorSchedule);

// الأوقات المتاحة لطبيب في تاريخ معيّن ?date=YYYY-MM-DD (لصفحات الحجز)
router.get('/available/:doctorId', scheduleController.getAvailableSlots);

// إضافة/حذف فترة دوام (بنفس نمط POST /add و /delete المتبع في المشروع)
router.post('/add', scheduleController.addSchedule);
router.post('/delete', scheduleController.deleteSchedule);

module.exports = router;
