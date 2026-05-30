const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./src/config/database');

const clinicRoutes = require('./src/routes/clinicRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const appointmentController = require('./src/controllers/appointmentController');

const app = express();
app.use(cors());
app.use(express.json());

// تشغيل وتقديم ملفات الواجهة الأمامية (HTML, CSS, JS) تلقائياً
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// فحص الاتصال بقاعدة البيانات عند بدء السيرفر
app.get('/check-db', async (req, res) => {
    try {
        const [rows] = await database.execute('SELECT 1 + 1 AS result');
        res.json({ message: 'الاتصال بالداتابيز ناجح عبر نظام MVC!', data: rows });
    } catch (err) {
        res.status(500).json({ message: 'تأكد من تشغيل الـ MySQL في XAMPP', error: err.message });
    }
});

app.get('/api/dashboard/stats', appointmentController.getDashboardStats);

// استخدام الـ Routes
app.use('/api/clinics', clinicRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

