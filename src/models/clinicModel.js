const database = require('../config/database');

const Clinic = {
    getAll: async () => {
        const [rows] = await database.execute('SELECT * FROM clinics');
        return rows;
    },
    getById: async (id) => {
        const [rows] = await database.execute('SELECT * FROM clinics WHERE id = ?', [id]);
        return rows[0];
    },
    // code / floor / head_name: حقول لوحة الإدارة الجديدة
    create: async (name, code, floor, headName, imageUrl) => {
        const sql = 'INSERT INTO clinics (name, code, floor, head_name, image_url) VALUES (?, ?, ?, ?, ?)';
        return await database.execute(sql, [name, code, floor, headName, imageUrl]);
    },
    // COALESCE: إذا لم تُرسل صورة جديدة (null) تبقى الصورة القديمة كما هي
    update: async (id, name, code, floor, headName, status, imageUrl) => {
        const sql = `
            UPDATE clinics
            SET name = ?, code = ?, floor = ?, head_name = ?, status = ?,
                image_url = COALESCE(?, image_url)
            WHERE id = ?`;
        return await database.execute(sql, [name, code, floor, headName, status, imageUrl, id]);
    },
    delete: async (id) => {
        return await database.execute('DELETE FROM clinics WHERE id = ?', [id]);
    }
};

module.exports = Clinic;
