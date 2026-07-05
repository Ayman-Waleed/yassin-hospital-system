const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// إدارة مستخدمي النظام (بنفس نمط POST /add و /update و /delete المتبع في المشروع)
router.get('/', userController.getUsers);
router.post('/add', userController.addUser);
router.post('/update', userController.updateUser);
router.post('/delete', userController.deleteUser);

module.exports = router;
