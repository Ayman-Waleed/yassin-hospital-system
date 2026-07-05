const Doctor = require('../models/doctorModel');

exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.getAll();
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// جلب طبيب واحد بمعرّفه (لصفحة البروفايل)
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.getById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'الطبيب غير موجود' });
        }
        res.json(doctor);
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
        const { name, specialization, phone, clinic_id } = req.body;
        if (!name || !specialization) {
            return res.status(400).json({ success: false, message: 'اسم الطبيب والتخصص مطلوبان' });
        }
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        await Doctor.create(name, specialization, phone || null, clinic_id || null, imageUrl);
        res.json({ success: true, message: 'تمت إضافة الطبيب بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ أثناء إضافة الطبيب' });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        await Doctor.delete(req.body.id);
        res.json({ success: true, message: 'تم حذف الطبيب' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ أثناء حذف الطبيب' });
    }
};

// تعديل بيانات الطبيب (يدعم رفع صورة جديدة اختيارياً عبر multer)
exports.updateDoctor = async (req, res) => {
    const { id } = req.params;
    const { name, specialization, phone, clinic_id } = req.body;
    let image_url = req.body.image_url || null;

    // إذا رُفعت صورة جديدة نحدّث المسار
    if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
    }

    try {
        const result = await Doctor.update(id, name, specialization, phone || null, clinic_id || null, image_url);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'الطبيب غير موجود!' });
        }
        res.json({ success: true, message: 'تم تحديث بيانات الطبيب بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ داخلي في السيرفر أثناء التحديث' });
    }
};
