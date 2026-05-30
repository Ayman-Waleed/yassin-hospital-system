const database = require('../config/database');

const Doctor = {
    getAll: async () => {
        const sql = `
            SELECT doctors.id, doctors.name, doctors.specialization, doctors.image_url, clinics.name AS clinic_name
            FROM doctors
            LEFT JOIN clinics ON doctors.clinic_id = clinics.id`;
        const [rows] = await database.execute(sql);
        return rows;
    },
    getByClinicId: async (clinicId) => {
        const [rows] = await database.execute('SELECT id, name FROM doctors WHERE clinic_id = ?', [clinicId]);
        return rows;
    },
    create: async (name, specialization, clinicId, imageUrl) => {
        const sql = 'INSERT INTO doctors (name, specialization, clinic_id, image_url) VALUES (?, ?, ?, ?)';
        return await database.execute(sql, [name, specialization, clinicId, imageUrl]);
    },
    delete: async (id) => {
        return await database.execute('DELETE FROM doctors WHERE id = ?', [id]);
    }
};

module.exports = Doctor;