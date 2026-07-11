// نقطة دخول السيرفر — مستشفى الياسين الطبي
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const database = require('./src/config/database');
const fs = require('fs');

// استدعاء ملفات الـ Routes
const clinicRoutes = require('./src/routes/clinicRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const announcementRoutes = require('./src/routes/announcementRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// ===== الحماية للنشر العام =====
// خلف بروكسي الاستضافة (مثل Render) حتى تعمل الكوكيز الآمنة بشكل صحيح
app.set('trust proxy', 1);

// جلسات دخول الإدارة — الكوكي HttpOnly ولا يُرسل إلا لنفس الموقع
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        // على الاستضافة (HTTPS) اضبط NODE_ENV=production ليصبح الكوكي آمناً
        secure: process.env.NODE_ENV === 'production',
        maxAge: 8 * 60 * 60 * 1000 // 8 ساعات
    }
}));

// حد محاولات تسجيل الدخول: 10 محاولات كل ربع ساعة لكل IP (ضد التخمين)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'محاولات دخول كثيرة، حاول مجدداً بعد ربع ساعة', data: null }
});
app.use('/api/auth/login', loginLimiter);

// حد الكتابة العامة (حجز/شكوى): 30 طلباً في الساعة لكل IP (ضد السبام)
const publicWriteLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'طلبات كثيرة من جهازك، حاول لاحقاً', data: null }
});
app.use('/api/appointments/book', publicWriteLimiter);
app.use('/api/complaints/add', publicWriteLimiter);

// ===== مطابقة أسماء الملفات بغض النظر عن حالة الأحرف (Linux vs Windows) =====
// محلياً (Windows) لا يفرّق النظام بين about.html وAbout.html، لكن على
// Render (Linux) يفرّق. هذا الـ middleware يفحص كل جزء من المسار المطلوب
// ويطابقه مع الاسم الفعلي للملف/المجلد على القرص بغض النظر عن حالة الأحرف،
// ويحوّل الطلب (rewrite) للمسار الصحيح قبل أن يصل إلى express.static.
function resolveCaseInsensitivePath(rootDir, requestPath) {
    const parts = requestPath.split('/').filter(Boolean);
    let currentDir = rootDir;
    const resolvedParts = [];

    for (let i = 0; i < parts.length; i++) {
        const wanted = parts[i];
        let entries;
        try {
            entries = fs.readdirSync(currentDir);
        } catch {
            return null; // المجلد الحالي غير موجود
        }

        // تطابق تام أولاً (أسرع وأدق)، وإلا تطابق بغض النظر عن حالة الأحرف
        let match = entries.find(e => e === wanted);
        if (!match) {
            match = entries.find(e => e.toLowerCase() === wanted.toLowerCase());
        }
        if (!match) return null; // ما في تطابق حتى بتجاهل حالة الأحرف

        resolvedParts.push(match);
        currentDir = path.join(currentDir, match);
    }

    return '/' + resolvedParts.join('/');
}

app.use((req, res, next) => {
    // نتجاهل مسارات الـ API لأنها تُعالج بكود منفصل وليست ملفات ثابتة
    if (req.path.startsWith('/api/')) return next();

    const publicDir = path.join(__dirname, 'public');
    const fullDiskPath = path.join(publicDir, decodeURIComponent(req.path));

    // إن كان المسار المطلوب موجوداً تماماً كما هو، لا داعي لأي معالجة
    if (fs.existsSync(fullDiskPath)) return next();

    const corrected = resolveCaseInsensitivePath(publicDir, decodeURIComponent(req.path));
    if (corrected && corrected !== req.path) {
        req.url = corrected + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
    }
    next();
});

// تقديم ملفات الواجهة الأمامية:
//   /site  → موقع الزوار          /admin → لوحة الإدارة
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== نظام الصور البديلة (متعدد الصيغ) =====
// الصفحات تطلب صوراً مثل pictures/عيادة القلب.jpg — إن وُجد الملف بنفس
// الاسم والصيغة يقدّمه express.static أعلاه (الأولوية له). وإن لم يوجد،
// نجرب هنا نفس الاسم بالصيغ الشائعة بالترتيب: jpg ← jpeg ← png ← webp
// ← وأخيراً البديل الاحترافي svg. بهذا يكفي وضع الصورة الحقيقية بأي
// صيغة شائعة وبنفس الاسم لتظهر فوراً دون تعديل أي كود.
// وإن لم يوجد أي ملف نمرّر للـ 404 حتى يعمل onerror ويعرض الافتراضية.
const PICTURE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'svg'];
app.use((req, res, next) => {
    const match = req.path.match(/^\/site\/pictures\/(.+)\.(jpg|jpeg|png|webp|svg)$/i);
    if (!match) return next();
    let base;
    try { base = decodeURIComponent(match[1]); } catch { return next(); }

    const dir = path.join(__dirname, 'public', 'site', 'pictures');
    for (const ext of PICTURE_EXTENSIONS) {
        if (ext === match[2].toLowerCase()) continue; // الصيغة المطلوبة فحصها static وهي مفقودة
        const candidate = path.join(dir, `${base}.${ext}`);
        if (fs.existsSync(candidate)) {
            return res.sendFile(candidate); // sendFile يضبط Content-Type حسب الامتداد
        }
    }
    next();
});

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
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
