const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');

router.get('/', announcementController.getAnnouncements);
router.post('/add', announcementController.addAnnouncement);
router.post('/delete', announcementController.deleteAnnouncement);

module.exports = router;