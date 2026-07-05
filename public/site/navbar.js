// ===== أُضيف للربط مع الباك اند: تحويل تلقائي للبورت الصحيح =====
// إذا فُتحت الصفحة من خادم آخر مثل Live Server (بورت 5500) فطلبات /api
// ستفشل حتماً، لذا نحوّل فوراً لسيرفر Node على البورت 5000
// مع تصحيح المسار (Live Server يقدّم الملفات من /public/ وسيرفر Node من الجذر)
// والحفاظ على أي query string أو hash
(function portRedirect() {
    const { hostname, port, pathname, search, hash } = window.location;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isLocal || port === '5000') return;
    let path = pathname;
    const idx = path.indexOf('/public/');
    if (idx !== -1) path = path.substring(idx + '/public'.length);
    window.location.replace('http://localhost:5000' + path + search + hash);
})();

// ===== SHARED NAVBAR =====
// يحدد الصفحة النشطة تلقائياً حسب اسم الملف الحالي

const navbarHTML = `
<nav class="navbar">
  <div class="navbar-inner">
    <span class="navbar-brand-text">Mlidical AL yasin</span>
    <ul class="nav-links">
      <li><a href="index.html">الرئيسية</a></li>
      <li><a href="about.html">من نحن</a></li>
      <li><a href="clinics.html">العيادات</a></li>
      <li><a href="doctors.html">الاطباء</a></li>
      <li><a href="booking.html">حجز تذكرة</a></li>
      <li><a href="announcements.html">الاعلانات</a></li>
      <li><a href="complaints.html">الشكاوى</a></li>
    </ul>
    <a href="index.html" class="navbar-logo">
      <img src="pictures/لوجو الموقع.png" alt="لوجو">
    </a>
  </div>
</nav>
`;

// أدرج الناف بار في بداية الصفحة
document.body.insertAdjacentHTML('afterbegin', navbarHTML);

// حدد الصفحة النشطة تلقائياً
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const linkPage = link.getAttribute('href');
  if (linkPage === currentPage) {
    link.classList.add('active');
  }
});