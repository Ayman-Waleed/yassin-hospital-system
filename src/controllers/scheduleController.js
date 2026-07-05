const Schedule = require('../models/scheduleModel');

// أسماء الأيام بالعربي حسب ترقيم getDay (0=الأحد)
const DAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// تحويل "09:00:00" إلى دقائق منذ منتصف الليل (لتسهيل توليد الفترات)
function timeToMinutes(time) {
    const [h, m] = String(time).split(':').map(Number);
    return h * 60 + m;
}

// تحويل دقائق إلى صيغة "HH:MM"
function minutesToTime(minutes) {
    const h = String(Math.floor(minutes / 60)).padStart(2, '0');
    const m = String(minutes % 60).padStart(2, '0');
    return `${h}:${m}`;
}

// توليد كل الأوقات الممكنة من فترات دوام اليوم
// مثال: (09:00 → 11:00، كل 30 دقيقة) ينتج 09:00, 09:30, 10:00, 10:30
function generateSlots(periods) {
    const slots = [];
    for (const p of periods) {
        const start = timeToMinutes(p.start_time);
        const end = timeToMinutes(p.end_time);
        const step = p.slot_minutes || 30;
        for (let t = start; t + step <= end; t += step) {
            slots.push(minutesToTime(t));
        }
    }
    return slots;
}

// كل الدوام مع أسماء الأطباء والعيادات (لجدول مواعيد العيادات في موقع الزوار)
exports.getAllSchedules = async (req, res) => {
    try {
        const rows = await Schedule.getAllWithDoctors();
        const data = rows.map(r => ({ ...r, day_name: DAY_NAMES[r.day_of_week] }));
        res.json({ success: true, message: 'تم جلب جدول الدوام الكامل', data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب جدول الدوام', data: null });
    }
};

// جلب دوام طبيب كاملاً (لواجهة إدارة الدوام)
exports.getDoctorSchedule = async (req, res) => {
    try {
        const rows = await Schedule.getByDoctorId(req.params.doctorId);
        // نضيف اسم اليوم بالعربي لتسهيل العرض في الواجهة
        const data = rows.map(r => ({ ...r, day_name: DAY_NAMES[r.day_of_week] }));
        res.json({ success: true, message: 'تم جلب جدول الدوام', data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب جدول الدوام', data: null });
    }
};

// إضافة فترة دوام جديدة لطبيب
exports.addSchedule = async (req, res) => {
    try {
        const { doctor_id, day_of_week, start_time, end_time, slot_minutes } = req.body;

        // التحقق من المدخلات قبل الإدخال
        if (!doctor_id || day_of_week === undefined || !start_time || !end_time) {
            return res.status(400).json({ success: false, message: 'يرجى تعبئة كل حقول الدوام المطلوبة', data: null });
        }
        const day = Number(day_of_week);
        if (isNaN(day) || day < 0 || day > 6) {
            return res.status(400).json({ success: false, message: 'يوم الأسبوع غير صالح (0-6)', data: null });
        }
        if (timeToMinutes(end_time) <= timeToMinutes(start_time)) {
            return res.status(400).json({ success: false, message: 'وقت نهاية الدوام يجب أن يكون بعد وقت البداية', data: null });
        }

        await Schedule.create(doctor_id, day, start_time, end_time, slot_minutes || 30);
        res.json({ success: true, message: 'تمت إضافة فترة الدوام بنجاح', data: null });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ أثناء إضافة فترة الدوام', data: null });
    }
};

// حذف فترة دوام
exports.deleteSchedule = async (req, res) => {
    try {
        if (!req.body.id) {
            return res.status(400).json({ success: false, message: 'معرّف فترة الدوام مفقود', data: null });
        }
        await Schedule.delete(req.body.id);
        res.json({ success: true, message: 'تم حذف فترة الدوام', data: null });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ أثناء حذف فترة الدوام', data: null });
    }
};

// الأوقات المتاحة لطبيب في تاريخ معيّن:
//   1) نحدد يوم الأسبوع للتاريخ المطلوب
//   2) نجلب فترات دوام الطبيب في هذا اليوم ونولّد منها كل الأوقات
//   3) نستبعد الأوقات المحجوزة مسبقاً
// GET /api/schedules/available/:doctorId?date=YYYY-MM-DD
exports.getAvailableSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        // تحقق من صيغة التاريخ YYYY-MM-DD
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ success: false, message: 'يرجى تحديد تاريخ صالح بصيغة YYYY-MM-DD', data: null });
        }

        // T00:00:00 حتى يُفسَّر التاريخ بالتوقيت المحلي وليس UTC
        const dayOfWeek = new Date(`${date}T00:00:00`).getDay();

        const periods = await Schedule.getByDoctorAndDay(doctorId, dayOfWeek);
        if (periods.length === 0) {
            return res.json({
                success: true,
                message: `لا يوجد دوام للطبيب يوم ${DAY_NAMES[dayOfWeek]}`,
                data: { date, day_name: DAY_NAMES[dayOfWeek], slots: [] }
            });
        }

        const allSlots = generateSlots(periods);
        const booked = await Schedule.getBookedTimes(doctorId, date);
        // المحجوز يأتي بصيغة HH:MM:SS فنقارن بأول 5 محارف (HH:MM)
        const bookedSet = new Set(booked.map(t => String(t).substring(0, 5)));
        const available = allSlots.filter(slot => !bookedSet.has(slot));

        res.json({
            success: true,
            message: 'تم جلب الأوقات المتاحة',
            data: { date, day_name: DAY_NAMES[dayOfWeek], slots: available }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في حساب الأوقات المتاحة', data: null });
    }
};

// دالة مساعدة تُصدَّر لاستخدامها في تحقق الحجز داخل appointmentController
exports.isSlotValid = async (doctorId, dateStr, timeStr) => {
    const dayOfWeek = new Date(`${dateStr}T00:00:00`).getDay();
    const periods = await Schedule.getByDoctorAndDay(doctorId, dayOfWeek);
    if (periods.length === 0) return false;
    return generateSlots(periods).includes(timeStr);
};
