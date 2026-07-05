const Announcement = require('../models/announcementModel');

exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.getAll();
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addAnnouncement = async (req, res) => {
    try {
        const { title, message } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: 'نص الإعلان مطلوب' });
        }
        await Announcement.create(title || null, message);
        res.json({ success: true, message: 'تم نشر الإعلان بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ أثناء نشر الإعلان' });
    }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        await Announcement.delete(req.body.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};