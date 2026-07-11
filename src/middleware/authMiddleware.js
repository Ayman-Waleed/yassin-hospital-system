// حارس جلسة الإدارة — يُركَّب على كل مسار إداري
// بدون جلسة دخول صالحة على السيرفر يُرفض الطلب مهما كانت واجهة المتصفح
module.exports = function requireAdmin(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.status(401).json({
        success: false,
        message: 'يجب تسجيل الدخول للوحة الإدارة أولاً',
        data: null
    });
};
