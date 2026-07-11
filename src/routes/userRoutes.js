const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const requireAdmin = require('../middleware/authMiddleware');

// إدارة مستخدمي النظام — كل المسارات إدارية بلا استثناء
router.use(requireAdmin);

router.get('/', userController.getUsers);
router.post('/add', userController.addUser);
router.post('/update', userController.updateUser);
router.post('/delete', userController.deleteUser);

module.exports = router;
