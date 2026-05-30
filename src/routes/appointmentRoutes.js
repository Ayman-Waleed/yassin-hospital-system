const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// مسار جلب جميع المواعيد للجدول
router.get('/', appointmentController.getAppointments);

// مسار حجز موعد جديد من قبل المريض
router.post('/book', appointmentController.bookAppointment);

// مسار تحديث حالة الموعد (مقبول / مرفوض)
router.post('/update-status', appointmentController.updateStatus);

// مسار حذف موعد نهائياً
router.post('/delete', appointmentController.deleteAppointment);

// مسار جلب الأرقام الحية لكروت الإحصائيات في لوحة التحكم
router.get('/stats', appointmentController.getDashboardStats);

module.exports = router;