// اتصال قاعدة البيانات MySQL باستخدام Pool
// البيانات تُقرأ من ملف .env (انظر .env.example) بدل كتابتها هنا مباشرة
require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nasser_hospital',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4', // دعم كامل للعربية
    // إعادة التواريخ كنصوص "YYYY-MM-DD HH:MM:SS" كما هي في القاعدة
    // (بدل كائنات Date التي تنحرف حسب المنطقة الزمنية عند تحويلها JSON)
    dateStrings: true
});

module.exports = pool.promise();
