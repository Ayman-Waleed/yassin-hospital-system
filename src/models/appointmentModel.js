const database = require('../config/database');

const Appointment = {
    getAll: async () => {
        const sql = `
            SELECT appointments.id, appointments.patient_name, doctors.name AS doctor_name, appointments.appointment_date, appointments.status
            FROM appointments
            LEFT JOIN doctors ON appointments.doctor_id = doctors.id
            ORDER BY appointments.appointment_date DESC`;
        const [rows] = await database.execute(sql);
        return rows;
    },
    create: async (patientName, doctorId, appointmentDate) => {
        const sql = 'INSERT INTO appointments (patient_name, doctor_id, appointment_date, status) VALUES (?, ?, ?, "pending")';
        return await database.execute(sql, [patientName, doctorId, appointmentDate]);
    },
    updateStatus: async (id, status) => {
        const [result] = await database.execute('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
        return result;
    },
    delete: async (id) => {
        return await database.execute('DELETE FROM appointments WHERE id = ?', [id]);
    },
    getStats: async () => {
        const [clinics] = await database.execute('SELECT COUNT(*) AS total FROM clinics');
        const [doctors] = await database.execute('SELECT COUNT(*) AS total FROM doctors');
        const [appointments] = await database.execute('SELECT COUNT(*) AS total FROM appointments');
        return {
            clinics: clinics[0].total,
            doctors: doctors[0].total,
            appointments: appointments[0].total
        };
    }
};

module.exports = Appointment;