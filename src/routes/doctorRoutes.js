const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const doctorController = require('../controllers/doctorController');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/', doctorController.getDoctors);
router.get('/by-clinic/:clinicId', doctorController.getDoctorsByClinic);
router.post('/add', upload.single('image'), doctorController.addDoctor);
router.post('/delete', doctorController.deleteDoctor);

module.exports = router;