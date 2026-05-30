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
    create: async (name) => {
        return await database.execute('INSERT INTO clinics (name) VALUES (?)', [name]);
    },
    update: async (id, name, status) => {
        return await database.execute('UPDATE clinics SET name = ?, status = ? WHERE id = ?', [name, status, id]);
    },
    delete: async (id) => {
        return await database.execute('DELETE FROM clinics WHERE id = ?', [id]);
    }
};

module.exports = Clinic;