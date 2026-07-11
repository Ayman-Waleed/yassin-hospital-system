const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const requireAdmin = require('../middleware/authMiddleware');

// عرض الإعلانات عام (موقع الزوار)، والإضافة والحذف للإدارة فقط
router.get('/', announcementController.getAnnouncements);
router.post('/add', requireAdmin, announcementController.addAnnouncement);
router.post('/delete', requireAdmin, announcementController.deleteAnnouncement);

module.exports = router;
