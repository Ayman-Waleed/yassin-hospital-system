const database = require('../config/database');

const Doctor = {
    getAll: async () => {
        const sql = `
            SELECT doctors.id, doctors.name, doctors.specialization, doctors.phone,
                   doctors.clinic_id, doctors.image_url, clinics.name AS clinic_name
            FROM doctors
            LEFT JOIN clinics ON doctors.clinic_id = clinics.id`;
        const [rows] = await database.execute(sql);
        return rows;
    },
    // جلب طبيب واحد بمعرّفه مع اسم عيادته (لصفحة بروفايل الطبيب)
    getById: async (id) => {
        const sql = `
            SELECT doctors.id, doctors.name, doctors.specialization, doctors.phone,
                   doctors.clinic_id, doctors.image_url, clinics.name AS clinic_name
            FROM doctors
            LEFT JOIN clinics ON doctors.clinic_id = clinics.id
            WHERE doctors.id = ?`;
        const [rows] = await database.execute(sql, [id]);
        return rows[0];
    },
    getByClinicId: async (clinicId) => {
        const [rows] = await database.execute('SELECT id, name FROM doctors WHERE clinic_id = ?', [clinicId]);
        return rows;
    },
    create: async (name, specialization, phone, clinicId, imageUrl) => {
        const sql = 'INSERT INTO doctors (name, specialization, phone, clinic_id, image_url) VALUES (?, ?, ?, ?, ?)';
        return await database.execute(sql, [name, specialization, phone, clinicId, imageUrl]);
    },
    // تعديل بيانات طبيب
    // COALESCE: إذا لم تُرسل صورة جديدة (null) تبقى الصورة القديمة كما هي
    update: async (id, name, specialization, phone, clinicId, imageUrl) => {
        const sql = `
            UPDATE doctors
            SET name = ?, specialization = ?, phone = ?, clinic_id = ?,
                image_url = COALESCE(?, image_url)
            WHERE id = ?`;
        const [result] = await database.execute(sql, [name, specialization, phone, clinicId, imageUrl, id]);
        return result;
    },
    delete: async (id) => {
        return await database.execute('DELETE FROM doctors WHERE id = ?', [id]);
    }
};

module.exports = Doctor;