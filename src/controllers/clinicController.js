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
        res.json(clinic);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addClinic = async (req, res) => {
    try {
        await Clinic.create(req.body.name);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateClinic = async (req, res) => {
    try {
        const { id, name, status } = req.body;
        await Clinic.update(id, name, status);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteClinic = async (req, res) => {
    try {
        await Clinic.delete(req.body.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};