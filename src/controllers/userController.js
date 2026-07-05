const User = require('../models/userModel');

// إدارة مستخدمي النظام — CRUD لصفحة users.html في لوحة الإدارة
// ملاحظة: تسجيل الدخول نفسه ما زال مبسطاً على جهة الواجهة (تحسين مستقبلي)

exports.getUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json({ success: true, message: 'تم جلب المستخدمين', data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب المستخدمين', data: null });
    }
};

exports.addUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password || !role) {
            return res.status(400).json({ success: false, message: 'اسم المستخدم وكلمة المرور والصلاحية مطلوبة', data: null });
        }
        await User.create(username, password, role);
        res.json({ success: true, message: 'تمت إضافة المستخدم بنجاح', data: null });
    } catch (err) {
        // اسم المستخدم UNIQUE في القاعدة
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'اسم المستخدم موجود مسبقاً', data: null });
        }
        res.status(500).json({ success: false, message: 'خطأ أثناء إضافة المستخدم', data: null });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id, role, password } = req.body;
        if (!id || !role) {
            return res.status(400).json({ success: false, message: 'المعرف والصلاحية مطلوبان', data: null });
        }
        const result = await User.update(id, role, password || null);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'المستخدم غير موجود', data: null });
        }
        res.json({ success: true, message: 'تم تحديث بيانات المستخدم', data: null });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ أثناء تحديث المستخدم', data: null });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        if (!req.body.id) {
            return res.status(400).json({ success: false, message: 'معرّف المستخدم مفقود', data: null });
        }
        await User.delete(req.body.id);
        res.json({ success: true, message: 'تم حذف المستخدم', data: null });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ أثناء حذف المستخدم', data: null });
    }
};
