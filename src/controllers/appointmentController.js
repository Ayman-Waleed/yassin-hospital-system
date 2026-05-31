const Appointment = require('../models/appointmentModel');
const database = require('../config/database');

exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.getAll();
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.bookAppointment = async (req, res) => {
    try {
        const { patient_name, doctor_id, appointment_date } = req.body;
        await Appointment.create(patient_name, doctor_id, appointment_date);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// تحديث حالة الموعد (مقبول / مرفوض) عبر الـ Model
exports.updateStatus = async (req, res) => {
    let { id, status } = req.body;

    if (!id || !status) {
        return res.status(400).json({ success: false, error: "المعرف id أو الحالة status مفقودة" });
    }

    try {
        // تحويل الكلمات القادمة من الـ Frontend إلى ما تفهمه الداتابيز
        if (status === 'مقبول' || status === 'confirmed') status = 'Confirmed';
        if (status === 'مرفوض' || status === 'rejected') status = 'Rejected';

        // الاستدعاء عبر الـ Model المربوط بالداتابيز لتغيير الحالة فوراً
        const result = await Appointment.updateStatus(id, status);

        if (result.affectedRows > 0) {
            return res.json({ success: true, message: `تم تحديث حالة الحجز بنجاح` });
        } else {
            return res.status(404).json({ success: false, error: "لم يتم العثور على الموعد المطلوب" });
        }
    } catch (err) {
        console.error("خطأ سيرفر داخلي أثناء تحديث الحالة:", err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
};

// الدالة المفقودة لجلب الإحصائيات الحية للكروت في لوحة التحكم
exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await Appointment.getStats();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        await Appointment.delete(req.body.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};