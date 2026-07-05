const database = require('../config/database');

// موديل مستخدمي النظام (تديره صفحة users.html في لوحة الإدارة)
// ملاحظة: كلمة المرور لا تُعاد أبداً في استعلامات الجلب
const User = {
    getAll: async () => {
        const sql = `
            SELECT id, username, role, status, last_login, created_at
            FROM users
            ORDER BY created_at`;
        const [rows] = await database.execute(sql);
        return rows;
    },
    create: async (username, password, role) => {
        const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        return await database.execute(sql, [username, password, role]);
    },
    // التعديل من اللوحة: الصلاحية دائماً، وكلمة المرور فقط إذا أُرسلت قيمة جديدة
    update: async (id, role, password) => {
        if (password) {
            const [result] = await database.execute(
                'UPDATE users SET role = ?, password = ? WHERE id = ?', [role, password, id]);
            return result;
        }
        const [result] = await database.execute(
            'UPDATE users SET role = ? WHERE id = ?', [role, id]);
        return result;
    },
    delete: async (id) => {
        return await database.execute('DELETE FROM users WHERE id = ?', [id]);
    }
};

module.exports = User;
