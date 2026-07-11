const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const requireAdmin = require('../middleware/authMiddleware');

// ===== مسارات عامة (للزوار) =====
// حجز موعد جديد من قبل المريض
router.post('/book', appointmentController.bookAppointment);
// جلب مواعيد مريض معيّن بهاتفه
router.get('/patient/:phone', appointmentController.getPatientAppointments);

// ===== مسارات إدارية (تتطلب جلسة دخول) =====
// جلب جميع المواعيد — بيانات شخصية، للإدارة فقط
router.get('/', requireAdmin, appointmentController.getAppointments);
// تحديث حالة الموعد (انتظار / مؤكد / ملغى / تم الفحص)
router.post('/update-status', requireAdmin, appointmentController.updateStatus);
// تعديل موعد كامل من لوحة الإدارة
router.post('/update', requireAdmin, appointmentController.updateAppointment);
// حذف موعد نهائياً
router.post('/delete', requireAdmin, appointmentController.deleteAppointment);
// الأرقام الحية لكروت الإحصائيات في لوحة التحكم
router.get('/stats', requireAdmin, appointmentController.getDashboardStats);

module.exports = router;
