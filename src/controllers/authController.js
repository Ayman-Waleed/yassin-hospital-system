const bcrypt = require('bcryptjs');
const database = require('../config/database');

// تسجيل دخول الإدارة — تحقق حقيقي من جدول users بكلمات مرور مشفرة bcrypt
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'اسم المستخدم وكلمة المرور مطلوبان', data: null });
        }

        const [rows] = await database.execute(
            'SELECT id, username, password, role, status FROM users WHERE username = ?', [username]);
        const user = rows[0];

        // رسالة واحدة عامة سواء كان الاسم أو كلمة المرور خاطئة (لا نساعد المخمّن)
        const invalid = { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة', data: null };
        if (!user || user.status !== 'نشط') {
            return res.status(401).json(invalid);
        }
        const passwordOk = await bcrypt.compare(password, user.password);
        if (!passwordOk) {
            return res.status(401).json(invalid);
        }

        // إنشاء الجلسة وتحديث آخر دخول
        req.session.user = { id: user.id, username: user.username, role: user.role };
        await database.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        res.json({ success: true, message: 'تم تسجيل الدخول بنجاح', data: { username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في السيرفر أثناء تسجيل الدخول', data: null });
    }
};

// تسجيل الخروج — إتلاف الجلسة على السيرفر
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true, message: 'تم تسجيل الخروج', data: null });
    });
};

// المستخدم الحالي (تستخدمه الواجهة للتحقق من صلاحية الجلسة)
exports.me = (req, res) => {
    if (req.session && req.session.user) {
        return res.json({ success: true, message: 'جلسة صالحة', data: req.session.user });
    }
    res.status(401).json({ success: false, message: 'لا توجد جلسة دخول', data: null });
};
