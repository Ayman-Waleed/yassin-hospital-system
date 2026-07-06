-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 06, 2026 at 02:13 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nasser_hospital`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `message`, `created_at`) VALUES
(1, 'إضافة جهاز تصوير طبي حديث', 'تم تركيب جهاز تصوير بالرنين المغناطيسي بأحدث المواصفات لخدمة مرضى العيادات الخارجية وتقليل فترات الانتظار.', '2026-07-05 09:50:22'),
(2, 'تحسين خدمات الاستقبال', 'تم افتتاح نظام الحجز الإلكتروني الجديد وتوسعة صالة الانتظار الرئيسية لتقديم خدمة أسرع وأكثر راحة.', '2026-07-05 09:50:22'),
(3, 'تطوير قسم المختبرات', 'تمت إضافة أجهزة تحاليل جديدة تتيح ظهور نتائج الفحوصات خلال وقت قياسي.', '2026-07-05 09:50:22'),
(4, 'صيانة شاملة لقاعات الانتظار', 'تخضع قاعات الانتظار في الطابق الثاني لأعمال صيانة وتجديد حتى نهاية الشهر الجاري.', '2026-07-05 09:50:22');

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `patient_name` varchar(150) NOT NULL,
  `patient_phone` varchar(20) DEFAULT NULL,
  `national_id` varchar(20) DEFAULT NULL,
  `case_description` text DEFAULT NULL,
  `doctor_id` int(11) NOT NULL,
  `appointment_date` datetime NOT NULL,
  `status` enum('pending','Confirmed','Rejected','Done') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `patient_name`, `patient_phone`, `national_id`, `case_description`, `doctor_id`, `appointment_date`, `status`, `created_at`) VALUES
(1, 'ياسر محمود', '0591234567', '400123456', 'ألم متكرر في المعدة بعد الوجبات.', 1, '2026-07-05 08:30:00', 'Done', '2026-07-05 09:50:22'),
(2, 'منى كمال', '0599876543', '400234567', 'متابعة ضغط الدم.', 7, '2026-07-05 12:20:00', 'Rejected', '2026-07-05 09:50:22'),
(3, 'يوسف أحمد', '0567112233', '400345678', 'فحص نظر دوري.', 5, '2026-07-06 08:20:00', 'pending', '2026-07-05 09:50:22'),
(4, 'هناء محمد', '0595556677', '400456789', 'كشف أسنان وتنظيف.', 11, '2026-07-06 12:30:00', 'Confirmed', '2026-07-05 09:50:22'),
(25, 'أحمد محمد', NULL, '123546789', 'آلام في الصدر', 2, '2026-07-08 09:30:00', 'pending', '2026-07-05 19:01:59');

-- --------------------------------------------------------

--
-- Table structure for table `clinics`
--

CREATE TABLE `clinics` (
  `id` int(11) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `floor` varchar(50) DEFAULT NULL,
  `head_name` varchar(150) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clinics`
--

INSERT INTO `clinics` (`id`, `code`, `name`, `floor`, `head_name`, `image_url`, `status`) VALUES
(1, 'INT-01', 'عيادة الباطنة', 'الأول', 'د. أحمد مرتجى', NULL, 'active'),
(2, 'CHST-02', 'عيادة الصدرية', 'الأول', 'د. محمد صقر', NULL, 'active'),
(3, 'ENT-03', 'عيادة الاذن والانف والحنجرة', 'الثاني', 'د. إيهاب أحمد', NULL, 'active'),
(4, 'ORTH-04', 'عيادة العظام', 'الثاني', 'د. أحمد محمد', NULL, 'active'),
(5, 'EYE-05', 'عيادة العيون', 'الثالث', 'د. غسان أنور', NULL, 'active'),
(6, 'PED-06', 'عيادة الاطفال', 'الأرضي', 'د. أنور مرتجى', NULL, 'active'),
(7, 'CARD-07', 'عيادة القلب', 'الثالث', 'د. نور مرتضى', NULL, 'active'),
(8, 'DERM-08', 'عيادة الجلدية', 'الثاني', 'د. ياسين محمد', NULL, 'active'),
(9, 'ENDO-09', 'عيادة الغدد', 'الأول', 'د. أحمد راضي', NULL, 'active'),
(10, 'URO-10', 'عيادة المسالك البولية', 'الثالث', 'د. سامر خليل', NULL, 'active'),
(11, 'DENT-11', 'عيادة الاسنان', 'الأرضي', 'د. ليلى حمدان', NULL, 'active'),
(12, 'PHYS-12', 'عيادة العلاج الطبيعي', 'الأرضي', 'د. رنا أبو شادي', NULL, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `id` int(11) NOT NULL,
  `patient_name` varchar(150) NOT NULL,
  `patient_phone` varchar(20) DEFAULT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `complaint_text` text NOT NULL,
  `admin_reply` text DEFAULT NULL,
  `status` enum('pending','replied') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `complaints`
--

INSERT INTO `complaints` (`id`, `patient_name`, `patient_phone`, `subject`, `complaint_text`, `admin_reply`, `status`, `created_at`) VALUES
(1, 'علي ناصر', '0591112223', 'شكوى', 'أواجه مشكلة منذ يومين عند محاولة حجز موعد في عيادة الأسنان، حيث تظهر لي رسالة خطأ تفيد بأن المواعيد غير متاحة بالرغم من وجود خانات فارغة. أرجو حل المشكلة سريعاً وتأكيد موعد لي في أقرب وقت.', 'نعتذر منكم، قام الدعم الفني بحل هذه المشكلة. قم بحجز موعدك الآن.', 'replied', '2026-07-05 09:50:22'),
(2, 'هناء محمد', '0595556677', 'شكر وتقدير', 'أود أن أتقدم بخالص الشكر والتقدير لطاقم التمريض في قسم الأطفال على حسن معاملتهم واحترافيتهم العالية ورعايتهم الفائقة لطفلي أثناء إقامته في المستشفى.', 'يسعدنا جداً سماع ذلك! تم نقل رسالتكم الكريمة لطاقم التمريض وسيتم تكريمهم في اجتماع القسم المقبل. نتمنى لكم ولطفلكم دوام الصحة والعافية.', 'replied', '2026-07-05 09:50:22'),
(4, 'أيمن وليد', '0598777022', 'تواصل عام', 'شكرا لخدماتكم', NULL, 'pending', '2026-07-05 10:52:08');

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `specialization` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `clinic_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`id`, `name`, `specialization`, `phone`, `clinic_id`, `image_url`) VALUES
(1, 'د. أحمد مرتجى', 'أخصائي باطنة', '0599111001', 1, NULL),
(2, 'د. محمد صقر', 'أخصائي أمراض صدرية', '0599111002', 2, NULL),
(3, 'د. إيهاب أحمد', 'أخصائي أنف وأذن وحنجرة', '0599111003', 3, NULL),
(4, 'د. أحمد محمد', 'أخصائي جراحة عظام', '0599111004', 4, NULL),
(5, 'د. غسان أنور', 'أخصائي طب وجراحة العيون', '0599111005', 5, NULL),
(6, 'د. أنور مرتجى', 'أخصائي طب أطفال', '0599111006', 6, NULL),
(7, 'د. نور مرتضى', 'أخصائي أمراض قلب', '0599111007', 7, NULL),
(8, 'د. ياسين محمد', 'أخصائي جلدية', '0599111008', 8, NULL),
(9, 'د. أحمد راضي', 'أخصائي غدد صماء', '0599111009', 9, NULL),
(10, 'د. سامر خليل', 'أخصائي مسالك بولية', '0599111010', 10, NULL),
(11, 'د. ليلى حمدان', 'طبيبة أسنان', '0599111011', 11, NULL),
(12, 'د. رنا أبو شادي', 'أخصائية علاج طبيعي', '0599111012', 12, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `doctor_schedules`
--

CREATE TABLE `doctor_schedules` (
  `id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `day_of_week` tinyint(4) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `slot_minutes` int(11) NOT NULL DEFAULT 30
) ;

--
-- Dumping data for table `doctor_schedules`
--

INSERT INTO `doctor_schedules` (`id`, `doctor_id`, `day_of_week`, `start_time`, `end_time`, `slot_minutes`) VALUES
(1, 1, 0, '08:00:00', '12:00:00', 30),
(2, 1, 2, '08:00:00', '12:00:00', 30),
(3, 1, 4, '08:00:00', '12:00:00', 30),
(4, 2, 1, '08:00:00', '12:00:00', 30),
(5, 2, 3, '08:00:00', '12:00:00', 30),
(6, 2, 6, '08:00:00', '12:00:00', 30),
(7, 3, 0, '12:00:00', '16:00:00', 30),
(8, 3, 2, '12:00:00', '16:00:00', 30),
(9, 3, 4, '12:00:00', '16:00:00', 30),
(10, 4, 1, '12:00:00', '16:00:00', 30),
(11, 4, 3, '12:00:00', '16:00:00', 30),
(12, 4, 6, '12:00:00', '16:00:00', 30),
(13, 5, 0, '08:00:00', '12:00:00', 20),
(14, 5, 3, '08:00:00', '12:00:00', 20),
(15, 6, 1, '08:00:00', '12:00:00', 20),
(16, 6, 2, '08:00:00', '12:00:00', 20),
(17, 6, 4, '08:00:00', '12:00:00', 20),
(18, 7, 0, '12:00:00', '16:00:00', 20),
(19, 7, 2, '12:00:00', '16:00:00', 20),
(20, 8, 1, '08:00:00', '12:00:00', 30),
(21, 8, 4, '08:00:00', '12:00:00', 30),
(22, 9, 3, '08:00:00', '12:00:00', 30),
(23, 9, 6, '08:00:00', '12:00:00', 30),
(24, 10, 0, '08:00:00', '12:00:00', 30),
(25, 10, 2, '08:00:00', '12:00:00', 30),
(26, 11, 1, '12:00:00', '16:00:00', 30),
(27, 11, 3, '12:00:00', '16:00:00', 30),
(28, 11, 6, '12:00:00', '16:00:00', 30),
(29, 12, 0, '12:00:00', '16:00:00', 30),
(30, 12, 4, '12:00:00', '16:00:00', 30);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'موظف استقبال',
  `status` varchar(20) NOT NULL DEFAULT 'نشط',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `status`, `last_login`, `created_at`) VALUES
(1, 'admin', '123', 'مدير نظام', 'نشط', '2026-07-05 12:50:22', '2026-07-05 09:50:22'),
(2, 'reception_1', '123456', 'موظف استقبال', 'نشط', '2026-07-05 12:50:22', '2026-07-05 09:50:22');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_doctor_slot` (`doctor_id`,`appointment_date`);

--
-- Indexes for table `clinics`
--
ALTER TABLE `clinics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_doctor_clinic` (`clinic_id`);

--
-- Indexes for table `doctor_schedules`
--
ALTER TABLE `doctor_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_schedule_doctor` (`doctor_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `clinics`
--
ALTER TABLE `clinics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `doctors`
--
ALTER TABLE `doctors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `doctor_schedules`
--
ALTER TABLE `doctor_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `fk_appointment_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `doctors`
--
ALTER TABLE `doctors`
  ADD CONSTRAINT `fk_doctor_clinic` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `doctor_schedules`
--
ALTER TABLE `doctor_schedules`
  ADD CONSTRAINT `fk_schedule_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
