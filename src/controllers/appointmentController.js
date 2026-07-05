const Appointment = require('../models/appointmentModel');
const { isSlotValid } = require('./scheduleController');

// تحويل الحالات العربية القادمة من الواجهات إلى قيم قاعدة البيانات
// pending = انتظار | Confirmed = مؤكد | Rejected = ملغى | Done = تم الفحص
const STATUS_MAP = {
    'انتظار': 'pending', 'pending': 'pending',
    'مؤكد': 'Confirmed', 'مقبول': 'Confirmed', 'confirmed': 'Confirmed', 'Confirmed': 'Confirmed',
    'ملغى': 'Rejected', 'مرفوض': 'Rejected', 'rejected': 'Rejected', 'Rejected': 'Rejected',
    'تم الفحص': 'Done', 'Done': 'Done'
};

exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.getAll();
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// حجز موعد جديد من موقع الزوار
// يتحقق السيرفر بنفسه أن الوقت داخل دوام الطبيب وغير محجوز (وليس الواجهة فقط)
exports.bookAppointment = async (req, res) => {
    try {
        const { patient_name, patient_phone, national_id, case_description, doctor_id, appointment_date } = req.body;

        // 1) التحقق من المدخلات الأساسية
        if (!patient_name || !doctor_id || !appointment_date) {
            return res.status(400).json({ success: false, message: 'يرجى تعبئة الاسم واختيار الطبيب والموعد', data: null });
        }

        // 2) فصل التاريخ والوقت للتحقق من الدوام (الصيغة: YYYY-MM-DD HH:MM)
        const normalized = String(appointment_date).replace('T', ' ');
        const [datePart, timePartRaw] = normalized.split(' ');
        const timePart = (timePartRaw || '').substring(0, 5);
        if (!datePart || !timePart) {
            return res.status(400).json({ success: false, message: 'صيغة الموعد غير صحيحة', data: null });
        }

        // 3) التحقق أن الوقت المطلوب ضمن جدول دوام الطبيب فعلاً
        const valid = await isSlotValid(doctor_id, datePart, timePart);
        if (!valid) {
            return res.status(400).json({ success: false, message: 'هذا الوقت خارج دوام الطبيب، يرجى اختيار وقت من الأوقات المتاحة', data: null });
        }

        // 4) الإدخال — الفهرس الفريد في القاعدة يمنع حجز نفس الوقت مرتين
        const result = await Appointment.create(
            patient_name,
            patient_phone || null,
            national_id || null,
            case_description || null,
            doctor_id,
            `${datePart} ${timePart}:00`
        );

        // رقم التذكرة الذي تعرضه بطاقة التأكيد هو معرف الحجز نفسه
        res.json({
            success: true,
            message: 'تم تأكيد الحجز بنجاح',
            data: { ticket_number: result.insertId, date: datePart, time: timePart }
        });
    } catch (err) {
        // خطأ التكرار: شخص آخر حجز نفس الوقت قبل لحظات
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'عذراً، هذا الوقت حُجز للتو من مريض آخر. اختر وقتاً آخر', data: null });
        }
        res.status(500).json({ success: false, message: 'خطأ في السيرفر أثناء الحجز', data: null });
    }
};

// مواعيد مريض معيّن بهاتفه
exports.getPatientAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.getByPhone(req.params.phone);
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// تحديث حالة الموعد فقط (انتظار / مؤكد / ملغى / تم الفحص)
exports.updateStatus = async (req, res) => {
    const { id, status } = req.body;

    if (!id || !status) {
        return res.status(400).json({ success: false, error: 'المعرف id أو الحالة status مفقودة' });
    }

    const dbStatus = STATUS_MAP[status];
    if (!dbStatus) {
        return res.status(400).json({ success: false, error: 'قيمة الحالة غير معروفة' });
    }

    try {
        const result = await Appointment.updateStatus(id, dbStatus);
        if (result.affectedRows > 0) {
            return res.json({ success: true, message: 'تم تحديث حالة الحجز بنجاح' });
        }
        return res.status(404).json({ success: false, error: 'لم يتم العثور على الموعد المطلوب' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// تعديل موعد كامل من لوحة الإدارة (مودال التعديل)
exports.updateAppointment = async (req, res) => {
    try {
        const { id, patient_name, doctor_id, appointment_date, status } = req.body;
        if (!id || !patient_name || !doctor_id || !appointment_date || !status) {
            return res.status(400).json({ success: false, message: 'يرجى تعبئة كل حقول الموعد', data: null });
        }
        const dbStatus = STATUS_MAP[status];
        if (!dbStatus) {
            return res.status(400).json({ success: false, message: 'قيمة الحالة غير معروفة', data: null });
        }
        const normalized = String(appointment_date).replace('T', ' ');
        const result = await Appointment.update(id, patient_name, doctor_id, normalized, dbStatus);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'الموعد غير موجود', data: null });
        }
        res.json({ success: true, message: 'تم تحديث الموعد بنجاح', data: null });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ أثناء تعديل الموعد', data: null });
    }
};

// أرقام كروت الإحصائيات في لوحة التحكم
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
