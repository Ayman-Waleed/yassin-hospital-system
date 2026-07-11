const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const clinicController = require('../controllers/clinicController');
const requireAdmin = require('../middleware/authMiddleware');

// رفع صورة العيادة — نفس آلية تخزين صور الأطباء (مجلد uploads باسم فريد)
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// العرض عام (موقع الزوار)، والتعديلات للإدارة فقط
router.get('/', clinicController.getClinics);
router.get('/:id', clinicController.getClinicById);
router.post('/add', requireAdmin, upload.single('image'), clinicController.addClinic);
router.post('/update', requireAdmin, upload.single('image'), clinicController.updateClinic);
router.post('/delete', requireAdmin, clinicController.deleteClinic);

module.exports = router;
