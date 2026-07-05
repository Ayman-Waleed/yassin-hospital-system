const database = require('../config/database');

const Announcement = {
    getAll: async () => {
        const [rows] = await database.execute('SELECT * FROM announcements ORDER BY created_at DESC');
        return rows;
    },
    create: async (title, message) => {
        // title اختياري: بطاقات موقع الزوار تعرض عنواناً ونصاً
        return await database.execute('INSERT INTO announcements (title, message) VALUES (?, ?)', [title, message]);
    },
    delete: async (id) => {
        return await database.execute('DELETE FROM announcements WHERE id = ?', [id]);
    }
};

module.exports = Announcement;