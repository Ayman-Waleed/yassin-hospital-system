const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const doctorController = require('../controllers/doctorController');
const requireAdmin = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// العرض عام (موقع الزوار)، والتعديلات للإدارة فقط
router.get('/', doctorController.getDoctors);
router.get('/by-clinic/:clinicId', doctorController.getDoctorsByClinic);
// ملاحظة: مسار by-clinic يجب أن يبقى قبل /:id حتى لا يلتقط الراوتر "by-clinic" كأنه id
router.get('/:id', doctorController.getDoctorById);
router.post('/add', requireAdmin, upload.single('image'), doctorController.addDoctor);
router.post('/delete', requireAdmin, doctorController.deleteDoctor);
router.put('/:id', requireAdmin, upload.single('image'), doctorController.updateDoctor);

module.exports = router;
