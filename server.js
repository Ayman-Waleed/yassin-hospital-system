// نقطة دخول السيرفر — مستشفى الياسين الطبي
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./src/config/database');

// استدعاء ملفات الـ Routes
const clinicRoutes = require('./src/routes/clinicRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const announcementRoutes = require('./src/routes/announcementRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// تقديم ملفات الواجهة الأمامية:
//   /site  → موقع الزوار          /admin → لوحة الإدارة
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// الصفحة الرئيسية للمشروع هي موقع الزوار
app.get('/', (req, res) => {
    res.redirect('/site/index.html');
});

// فحص الاتصال بقاعدة البيانات
app.get('/check-db', async (req, res) => {
    try {
        const [rows] = await database.execute('SELECT 1 + 1 AS result');
        res.json({ message: 'الاتصال بالداتابيز ناجح!', data: rows });
    } catch (err) {
        res.status(500).json({ message: 'تأكد من تشغيل الـ MySQL في XAMPP', error: err.message });
    }
});

// استخدام الـ Routes
app.use('/api/clinics', clinicRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
