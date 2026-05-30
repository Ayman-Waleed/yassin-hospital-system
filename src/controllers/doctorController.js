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