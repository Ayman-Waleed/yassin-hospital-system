const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');

router.get('/', clinicController.getClinics);
router.get('/:id', clinicController.getClinicById);
router.post('/add', clinicController.addClinic);
router.post('/update', clinicController.updateClinic);
router.post('/delete', clinicController.deleteClinic);

module.exports = router;