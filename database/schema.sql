-- =====================================================================
--  مستشفى الياسين الطبي — مخطط قاعدة البيانات (Schema)
--  نظام العيادات الخارجية | Node.js + Express + MySQL
--
--  الترميز: utf8mb4 لدعم اللغة العربية بشكل كامل (نصوص + رموز)
--  ملاحظة: هذا الملف يُنشئ القاعدة والجداول من الصفر.
--  تشغيله يحذف القاعدة القديمة إن وُجدت، فانتبه على بيئة فيها بيانات حقيقية.
-- =====================================================================

DROP DATABASE IF EXISTS nasser_hospital;
CREATE DATABASE nasser_hospital
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE nasser_hospital;

-- ---------------------------------------------------------------------
-- 1) جدول العيادات / الأقسام (clinics)
--    code / floor / head_name: حقول تعرضها لوحة الإدارة الجديدة
--    status: حالة القسم (active = نشط / inactive = متوقف)
-- ---------------------------------------------------------------------
CREATE TABLE clinics (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    code      VARCHAR(20)  NULL UNIQUE,      -- كود العيادة، مثال: CARD-03
    name      VARCHAR(150) NOT NULL,
    floor     VARCHAR(50)  NULL,             -- الطابق، مثال: الأول
    head_name VARCHAR(150) NULL,             -- رئيس القسم
    image_url VARCHAR(255) NULL,             -- صورة العيادة المرفوعة من لوحة الإدارة
    status    VARCHAR(20)  NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2) جدول الأطباء (doctors)
--    phone: يعرضه جدول الأطباء في لوحة الإدارة الجديدة
--    عند حذف العيادة نجعل clinic_id فارغاً بدل حذف الطبيب
-- ---------------------------------------------------------------------
CREATE TABLE doctors (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    specialization VARCHAR(150) NOT NULL,
    phone          VARCHAR(20)  NULL,
    clinic_id      INT NULL,
    image_url      VARCHAR(255) NULL,
    CONSTRAINT fk_doctor_clinic
        FOREIGN KEY (clinic_id) REFERENCES clinics(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3) جدول دوام الأطباء (doctor_schedules)
--    دوام أسبوعي متكرر: لكل طبيب صف لكل يوم عمل.
--    day_of_week: رقم اليوم (0=الأحد ... 6=السبت) لتوافقه مع JS Date.getDay()
--    slot_minutes: مدة الموعد الواحد بالدقائق (تُستخدم لتوليد الأوقات المتاحة)
-- ---------------------------------------------------------------------
CREATE TABLE doctor_schedules (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id    INT NOT NULL,
    day_of_week  TINYINT NOT NULL,          -- 0..6
    start_time   TIME NOT NULL,             -- مثال 09:00:00
    end_time     TIME NOT NULL,             -- مثال 14:00:00
    slot_minutes INT NOT NULL DEFAULT 30,   -- طول الموعد
    CONSTRAINT fk_schedule_doctor
        FOREIGN KEY (doctor_id) REFERENCES doctors(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_day CHECK (day_of_week BETWEEN 0 AND 6),
    CONSTRAINT chk_slot CHECK (slot_minutes > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4) جدول المواعيد / الحجوزات (appointments)
--    national_id + case_description: من فورم الحجز في موقع الزوار الجديد
--    patient_phone: معرّف بديل للمريض (يبقى للتوافق)
--    رقم التذكرة الظاهر للمريض هو نفسه id
--    status:
--      pending   = انتظار
--      Confirmed = مؤكد
--      Rejected  = ملغى
--      Done      = تم الفحص   (حالة تعتمدها لوحة الإدارة الجديدة)
-- ---------------------------------------------------------------------
CREATE TABLE appointments (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    patient_name     VARCHAR(150) NOT NULL,
    patient_phone    VARCHAR(20)  NULL,
    national_id      VARCHAR(20)  NULL,
    case_description TEXT NULL,
    doctor_id        INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    status           ENUM('pending','Confirmed','Rejected','Done') NOT NULL DEFAULT 'pending',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appointment_doctor
        FOREIGN KEY (doctor_id) REFERENCES doctors(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- منع حجز نفس الطبيب في نفس اللحظة مرتين (سلامة بيانات الأوقات المتاحة)
CREATE UNIQUE INDEX uq_doctor_slot
    ON appointments (doctor_id, appointment_date);

-- ---------------------------------------------------------------------
-- 5) جدول الإعلانات (announcements)
--    title اختياري: بطاقات الإعلانات في موقع الزوار تعرض عنواناً ونصاً
-- ---------------------------------------------------------------------
CREATE TABLE announcements (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(200) NULL,
    message    TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6) جدول الشكاوى (complaints)
--    subject: نوع/موضوع الرسالة من فورم موقع الزوار (شكوى، استفسار، شكر...)
--    status: pending (بانتظار الرد) / replied (تم الرد)
-- ---------------------------------------------------------------------
CREATE TABLE complaints (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    patient_name   VARCHAR(150) NOT NULL,
    patient_phone  VARCHAR(20)  NULL,
    subject        VARCHAR(100) NULL,
    complaint_text TEXT NOT NULL,
    admin_reply    TEXT NULL,
    status         ENUM('pending','replied') NOT NULL DEFAULT 'pending',
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7) جدول مستخدمي النظام (users)
--    تديره صفحة users.html في لوحة الإدارة (عرض/إضافة/تعديل/حذف).
--    ملاحظة: تسجيل الدخول الفعلي ما زال مبسطاً على جهة الواجهة،
--    وكلمات المرور مخزنة كما هي — تحسين مستقبلي: تشفير bcrypt وربط الدخول.
--    role: مدير نظام / موظف استقبال / طبيب
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(50)  NOT NULL DEFAULT 'موظف استقبال',
    status     VARCHAR(20)  NOT NULL DEFAULT 'نشط',
    last_login DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
