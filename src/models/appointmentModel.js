const database = require('../config/database');

const Appointment = {
    getAll: async () => {
        const sql = `
            SELECT appointments.id, appointments.patient_name, appointments.patient_phone,
                   appointments.national_id, appointments.case_description,
                   appointments.doctor_id, doctors.name AS doctor_name,
                   clinics.name AS clinic_name,
                   appointments.appointment_date, appointments.status, appointments.created_at
            FROM appointments
            LEFT JOIN doctors ON appointments.doctor_id = doctors.id
            LEFT JOIN clinics ON doctors.clinic_id = clinics.id
            ORDER BY appointments.appointment_date DESC`;
        const [rows] = await database.execute(sql);
        return rows;
    },
    create: async (patientName, patientPhone, nationalId, caseDescription, doctorId, appointmentDate) => {
        // patient_phone / national_id يعرّفان المريض، case_description من فورم الحجز الجديد
        const sql = `
            INSERT INTO appointments
                (patient_name, patient_phone, national_id, case_description, doctor_id, appointment_date, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')`;
        const [result] = await database.execute(sql,
            [patientName, patientPhone, nationalId, caseDescription, doctorId, appointmentDate]);
        return result; // insertId يُستخدم كرقم التذكرة
    },
    // مواعيد مريض معيّن بهاتفه أو رقم هويته
    getByPhone: async (phone) => {
        const sql = `
            SELECT appointments.id, appointments.patient_name, doctors.name AS doctor_name,
                   appointments.appointment_date, appointments.status
            FROM appointments
            LEFT JOIN doctors ON appointments.doctor_id = doctors.id
            WHERE appointments.patient_phone = ?
            ORDER BY appointments.appointment_date DESC`;
        const [rows] = await database.execute(sql, [phone]);
        return rows;
    },
    updateStatus: async (id, status) => {
        const [result] = await database.execute('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
        return result;
    },
    // تعديل موعد كامل من لوحة الإدارة (مريض/طبيب/تاريخ/حالة)
    update: async (id, patientName, doctorId, appointmentDate, status) => {
        const sql = `
            UPDATE appointments
            SET patient_name = ?, doctor_id = ?, appointment_date = ?, status = ?
            WHERE id = ?`;
        const [result] = await database.execute(sql, [patientName, doctorId, appointmentDate, status, id]);
        return result;
    },
    delete: async (id) => {
        return await database.execute('DELETE FROM appointments WHERE id = ?', [id]);
    },
    // أرقام كروت لوحة التحكم — بدلالات الكروت نفسها:
    //   appointments = مواعيد اليوم فقط، complaints = الشكاوى غير المُجاب عليها
    getStats: async () => {
        const [clinics] = await database.execute('SELECT COUNT(*) AS total FROM clinics');
        const [doctors] = await database.execute('SELECT COUNT(*) AS total FROM doctors');
        const [appointments] = await database.execute(
            'SELECT COUNT(*) AS total FROM appointments WHERE DATE(appointment_date) = CURDATE()');
        const [complaints] = await database.execute(
            "SELECT COUNT(*) AS total FROM complaints WHERE status = 'pending'");
        return {
            clinics: clinics[0].total,
            doctors: doctors[0].total,
            appointments: appointments[0].total,
            complaints: complaints[0].total
        };
    }
};

module.exports = Appointment;
