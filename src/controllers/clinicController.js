const Clinic = require('../models/clinicModel');

exports.getClinics = async (req, res) => {
    try {
        const clinics = await Clinic.getAll();
        res.json(clinics);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getClinicById = async (req, res) => {
    try {
        const clinic = await Clinic.getById(req.params.id);
        if (!clinic) {
            return res.status(404).json({ success: false, message: 'العيادة غير موجودة' });
        }
        res.json(clinic);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addClinic = async (req, res) => {
    try {
        const { name, code, floor, head_name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'اسم العيادة مطلوب' });
        }
        await Clinic.create(name, code || null, floor || null, head_name || null);
        res.json({ success: true, message: 'تمت إضافة العيادة بنجاح' });
    } catch (err) {
        // كود العيادة UNIQUE في القاعدة
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'كود العيادة مستخدم مسبقاً' });
        }
        res.status(500).json({ success: false, message: 'خطأ أثناء إضافة العيادة' });
    }
};

exports.updateClinic = async (req, res) => {
    try {
        const { id, name, code, floor, head_name, status } = req.body;
        if (!id || !name) {
            return res.status(400).json({ success: false, message: 'المعرف واسم العيادة مطلوبان' });
        }
        await Clinic.update(id, name, code || null, floor || null, head_name || null, status || 'active');
        res.json({ success: true, message: 'تم تحديث بيانات العيادة بنجاح' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'كود العيادة مستخدم مسبقاً' });
        }
        res.status(500).json({ success: false, message: 'خطأ أثناء تحديث العيادة' });
    }
};

exports.deleteClinic = async (req, res) => {
    try {
        await Clinic.delete(req.body.id);
        res.json({ success: true, message: 'تم حذف العيادة' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ أثناء حذف العيادة' });
    }
};
