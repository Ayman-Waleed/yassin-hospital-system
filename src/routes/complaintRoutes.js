const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');

router.post('/add', complaintController.addComplaint);
router.get('/patient/:phone', complaintController.getPatientComplaints);
router.get('/', complaintController.getAllComplaints);
router.post('/reply', complaintController.replyToComplaint);

module.exports = router;