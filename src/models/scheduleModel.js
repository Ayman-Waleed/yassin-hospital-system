const database = require('../config/database');

// موديل دوام الأطباء (جدول doctor_schedules)
// day_of_week: 0=الأحد ... 6=السبت (نفس ترقيم JavaScript getDay)
const Schedule = {
    // كل الدوام مع اسم الطبيب وعيادته (لصفحة مواعيد العيادات في موقع الزوار)
    getAllWithDoctors: async () => {
        const sql = `
            SELECT ds.id, ds.doctor_id, ds.day_of_week, ds.start_time, ds.end_time, ds.slot_minutes,
                   d.name AS doctor_name, c.id AS clinic_id, c.name AS clinic_name
            FROM doctor_schedules ds
            JOIN doctors d ON ds.doctor_id = d.id
            LEFT JOIN clinics c ON d.clinic_id = c.id
            ORDER BY c.id, ds.doctor_id, ds.day_of_week, ds.start_time`;
        const [rows] = await database.execute(sql);
        return rows;
    },

    // كل صفوف دوام طبيب معيّن مرتبة حسب اليوم ثم وقت البداية
    getByDoctorId: async (doctorId) => {
        const sql = `
            SELECT id, doctor_id, day_of_week, start_time, end_time, slot_minutes
            FROM doctor_schedules
            WHERE doctor_id = ?
            ORDER BY day_of_week, start_time`;
        const [rows] = await database.execute(sql, [doctorId]);
        return rows;
    },

    // صفوف دوام طبيب في يوم أسبوع محدد (تُستخدم لحساب الأوقات المتاحة)
    getByDoctorAndDay: async (doctorId, dayOfWeek) => {
        const sql = `
            SELECT start_time, end_time, slot_minutes
            FROM doctor_schedules
            WHERE doctor_id = ? AND day_of_week = ?`;
        const [rows] = await database.execute(sql, [doctorId, dayOfWeek]);
        return rows;
    },

    create: async (doctorId, dayOfWeek, startTime, endTime, slotMinutes) => {
        const sql = `
            INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_minutes)
            VALUES (?, ?, ?, ?, ?)`;
        return await database.execute(sql, [doctorId, dayOfWeek, startTime, endTime, slotMinutes]);
    },

    delete: async (id) => {
        return await database.execute('DELETE FROM doctor_schedules WHERE id = ?', [id]);
    },

    // المواعيد المحجوزة لطبيب في يوم معيّن (لاستبعادها من الأوقات المتاحة)
    // نستبعد كل الحجوزات بغض النظر عن حالتها لأن قاعدة البيانات تمنع
    // تكرار نفس (طبيب + وقت) بفهرس فريد أصلاً
    getBookedTimes: async (doctorId, date) => {
        const sql = `
            SELECT TIME(appointment_date) AS booked_time
            FROM appointments
            WHERE doctor_id = ? AND DATE(appointment_date) = ?`;
        const [rows] = await database.execute(sql, [doctorId, date]);
        return rows.map(r => r.booked_time);
    }
};

module.exports = Schedule;
