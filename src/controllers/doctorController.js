const Doctor = require('../models/doctorModel');

exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.getAll();
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDoctorsByClinic = async (req, res) => {
    try {
        const doctors = await Doctor.getByClinicId(req.params.clinicId);
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addDoctor = async (req, res) => {
    try {
        const { name, specialization, clinic_id } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        await Doctor.create(name, specialization, clinic_id, imageUrl);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        await Doctor.delete(req.body.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// دالة تعديل بيانات الطبيب
exports.updateDoctor = async (req, res) => {
    const { id } = req.params;

    // الأدوية والنصوص تأتي هنا بأمان بعد تفكيك multer لها
    const { name, specialization, clinic_id } = req.body;
    let image_url = req.body.image_url;

    // إذا رفع المستخدم صورة جديدة نحدث المسار
    if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
    }

    try {
        // نستخدم هنا اسم المتغير 'database' كما هو مستدعى بملف server.js
        const query = `
            UPDATE doctors 
            SET name = ?, specialization = ?, clinic_id = ?, image_url = ? 
            WHERE id = ?
        `;

        // استدعاء ملف الاتصال المباشر بقاعدة البيانات
        const database = require('../config/database');
        const [result] = await database.execute(query, [name, specialization, clinic_id, image_url, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "الطبيب غير موجود!" });
        }

        res.json({ success: true, message: "تم تحديث بيانات الطبيب بنجاح! ✏️" });
    } catch (err) {
        console.error("خطأ التحديث في السيرفر:", err);
        res.status(500).json({ success: false, message: "خطأ داخلي في السيرفر", error: err.message });
    }
};