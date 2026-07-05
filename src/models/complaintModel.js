const database = require('../config/database');

const Complaint = {
    create: async (patientName, patientPhone, subject, complaintText) => {
        // subject: نوع الرسالة من فورم موقع الزوار (شكوى / استفسار / شكر وتقدير...)
        return await database.execute(
            'INSERT INTO complaints (patient_name, patient_phone, subject, complaint_text) VALUES (?, ?, ?, ?)',
            [patientName, patientPhone, subject, complaintText]
        );
    },
    getByPhone: async (phone) => {
        const [rows] = await database.execute(
            'SELECT id, subject, complaint_text, admin_reply, status, created_at FROM complaints WHERE patient_phone = ? ORDER BY created_at DESC', [phone]
        );
        return rows;
    },
    getAll: async () => {
        const [rows] = await database.execute('SELECT * FROM complaints ORDER BY created_at DESC');
        return rows;
    },
    reply: async (id, replyText) => {
        return await database.execute(
            'UPDATE complaints SET admin_reply = ?, status = "replied" WHERE id = ?',
            [replyText, id]
        );
    }
};

module.exports = Complaint;