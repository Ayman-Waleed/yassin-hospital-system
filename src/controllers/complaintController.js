const Complaint = require('../models/complaintModel');

exports.addComplaint = async (req, res) => {
    try {
        const { patient_name, patient_phone, subject, complaint_text } = req.body;
        if (!patient_name || !complaint_text) {
            return res.status(400).json({ success: false, message: 'الاسم ونص الرسالة مطلوبان' });
        }
        await Complaint.create(patient_name, patient_phone || null, subject || null, complaint_text);
        res.json({ success: true, message: 'تم استلام رسالتك بنجاح، سيتم الرد عليها قريباً' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ أثناء إرسال الرسالة' });
    }
};

exports.getPatientComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.getByPhone(req.params.phone);
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.getAll();
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.replyToComplaint = async (req, res) => {
    try {
        const { id, reply } = req.body;
        await Complaint.reply(id, reply);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};