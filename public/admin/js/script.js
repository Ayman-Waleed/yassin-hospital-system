const menuItems = [
    { name: "لوحة التحكم", link: "dashboard.html", icon: "📊" },
    { name: "إدارة الأطباء", link: "doctors.html", icon: "👨‍⚕️" },
    { name: "إدارة العيادات", link: "clinics.html", icon: "🏥" },
    { name: "المواعيد", link: "appointments.html", icon: "📅" },
    { name: "الشكاوى", link: "complaints.html", icon: "📧" },
    { name: "المستخدمين", link: "users.html", icon: "👥" },
    { name: "تسجيل خروج", link: "#", icon: "🚪", action: "logout" }
];

// ===== أُضيف للربط مع الباك اند: تحويل تلقائي للبورت الصحيح =====
// إذا فُتحت اللوحة من خادم آخر مثل Live Server (بورت 5500) فطلبات /api
// ستفشل حتماً، لذا نحوّل فوراً لسيرفر Node على البورت 5000
// مع تصحيح المسار (Live Server يقدّم الملفات من /public/ وسيرفر Node من الجذر)
(function portRedirect() {
    const { hostname, port, pathname, search, hash } = window.location;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isLocal || port === '5000') return;
    let path = pathname;
    const idx = path.indexOf('/public/');
    if (idx !== -1) path = path.substring(idx + '/public'.length);
    window.location.replace('http://localhost:5000' + path + search + hash);
})();

// ===== أُضيف للربط مع الباك اند: حارس الدخول =====
// أي صفحة إدارة غير صفحة الدخول تعيد التوجيه فوراً إذا لم يسجل الأدمن دخوله
(function adminGuard() {
    // إذا كان تحويل البورت أعلاه جارياً نتوقف هنا: الحارس سيُعاد تشغيله
    // على الصفحة الوجهة (بورت 5000) حيث علامة الدخول الصحيحة
    const { hostname, port } = window.location;
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && port !== '5000') return;

    const page = window.location.pathname.split("/").pop();
    const isLoginPage = page === "index.html" || page === "";
    if (!isLoginPage && localStorage.getItem("alyaseen_admin") !== "1") {
        window.location.replace("index.html");
    }
})();

// ===== أُضيف للربط مع الباك اند: أدوات مشتركة =====
// تحويل حالات المواعيد بين قيم قاعدة البيانات والعرض العربي
const STATUS_ARABIC = { pending: "انتظار", Confirmed: "مؤكد", Rejected: "ملغى", Done: "تم الفحص" };
const STATUS_CLASS  = { pending: "status-pending", Confirmed: "status-success", Rejected: "status-danger", Done: "status-success" };

// تنسيق "YYYY-MM-DD HH:MM:SS" لعرض عربي مثل "6/7/2026 - 10:30 ص"
function formatDateTime(dt) {
    if (!dt) return "-";
    const [datePart, timePart] = String(dt).split(" ");
    const [y, mo, d] = datePart.split("-").map(Number);
    if (!timePart) return `${d}/${mo}/${y}`;
    let [h, mi] = timePart.split(":").map(Number);
    const suffix = h >= 12 ? "م" : "ص";
    h = h % 12 || 12;
    return `${d}/${mo}/${y} - ${h}:${String(mi).padStart(2, "0")} ${suffix}`;
}

// عرض راية خطأ واضحة داخل الصفحة عند فشل الاتصال بالـ API
// (بدل الفشل الصامت وبقاء بيانات التصميم الثابتة — مثلاً عند فتح الصفحات من Live Server)
function showServerError(customMsg) {
    if (document.getElementById('server-error-banner')) return; // لا نكرر الراية
    const banner = document.createElement('div');
    banner.id = 'server-error-banner';
    banner.style.cssText = 'background:#fee2e2;color:#b91c1c;border:1px solid #fecaca;' +
        'padding:12px 20px;border-radius:10px;margin-bottom:18px;font-weight:bold;direction:rtl;';
    banner.innerText = customMsg ||
        '⚠ تعذر الاتصال بالسيرفر — تأكد أنك تفتح الموقع من http://localhost:5000 وأن سيرفر Node يعمل';
    const main = document.querySelector('.main-content');
    const header = main ? main.querySelector('header') : null;
    if (header) header.insertAdjacentElement('afterend', banner);
    else (main || document.body).prepend(banner);
}

// Global variable to keep track of the row currently being edited
let currentEditRow = null;

// كان هنا كائن شكاوى وهمي (complaintMessages) — أصبح يتعبأ من قاعدة البيانات
// في صفحة الشكاوى، ويبقى فارغاً في باقي الصفحات
let complaintMessages = {};

document.addEventListener("DOMContentLoaded", () => {
    // أُضيف للربط مع الباك اند: تحميل بيانات الصفحة الحالية من الـ API
    const pageName = window.location.pathname.split("/").pop();
    if (pageName === "dashboard.html") loadDashboardData();
    else if (pageName === "doctors.html") loadDoctorsPage();
    else if (pageName === "clinics.html") loadClinicsPage();
    else if (pageName === "appointments.html") loadAppointmentsPage();
    else if (pageName === "complaints.html") loadComplaintsPage();
    else if (pageName === "users.html") loadUsersPage();

    // 1. Sidebar rendering
    const navElement = document.getElementById("sidebar-nav");
    if (navElement) {
        let html = `<h3>الياسين الطبي</h3><ul>`;
        menuItems.forEach(item => {
            const currentPath = window.location.pathname.split("/").pop();
            const isActive = currentPath === item.link ? 'class="active"' : '';
            const onClick = item.action === "logout" ? 'onclick="logout()"' : '';
            html += `<li><a href="${item.link}" ${isActive} ${onClick}>${item.icon} ${item.name}</a></li>`;
        });
        html += `</ul>`;
        navElement.innerHTML = html;
    }

    // 2. Global Table Delete Action (Using Delegation for static and dynamic rows)
    // أُعيد ربطه بالباك اند: الحذف يتم من قاعدة البيانات فعلياً وليس من الشاشة فقط
    const DELETE_ENDPOINTS = {
        'doctors.html': '/api/doctors/delete',
        'clinics.html': '/api/clinics/delete',
        'appointments.html': '/api/appointments/delete',
        'users.html': '/api/users/delete'
    };
    document.addEventListener('click', async (e) => {
        if (e.target && (e.target.classList.contains('btn-delete') || e.target.closest('.btn-delete'))) {
            const btn = e.target.classList.contains('btn-delete') ? e.target : e.target.closest('.btn-delete');
            if (btn.closest('.modal-footer')) return; // أزرار "إلغاء" في المودالات تحمل نفس الكلاس
            const row = btn.closest('tr');
            if (!row) return;
            if (!confirm("هل أنت متأكد من حذف هذا السجل نهائياً؟")) return;

            const endpoint = DELETE_ENDPOINTS[window.location.pathname.split("/").pop()];
            const id = row.dataset.id;
            if (endpoint && id) {
                try {
                    const res = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id })
                    });
                    const result = await res.json();
                    if (!result.success) {
                        alert(result.message || 'تعذر حذف السجل');
                        return;
                    }
                } catch (err) {
                    console.error('فشل حذف السجل:', err);
                    showServerError();
                    return;
                }
            }
            row.style.transition = 'all 0.4s ease';
            row.style.opacity = '0';
            row.style.transform = 'translateX(-30px)';
            setTimeout(() => {
                row.remove();
                showTemporaryNotification("تم حذف السجل بنجاح!");
            }, 400);
        }
    });

    // 3. Global Table Edit Action (Delegated for static and dynamic rows)
    document.addEventListener('click', (e) => {
        if (e.target && (e.target.classList.contains('btn-edit') || e.target.closest('.btn-edit'))) {
            const btn = e.target.classList.contains('btn-edit') ? e.target : e.target.closest('.btn-edit');
            const row = btn.closest('tr');
            if (!row) return;
            
            currentEditRow = row;
            const currentPath = window.location.pathname.split("/").pop();
            
            if (currentPath === "doctors.html") {
                // columns: #, name, specialty, phone
                const name = row.cells[1].innerText;
                const specialty = row.cells[2].innerText;
                const phone = row.cells[3].innerText;

                document.getElementById('doc-name').value = name;
                document.getElementById('doc-specialty').value = specialty;
                document.getElementById('doc-phone').value = phone;
                // عيادة الطبيب الحالية مخزنة على الصف من قاعدة البيانات
                document.getElementById('doc-clinic').value = row.dataset.clinicId || '';

                const modal = document.getElementById('add-doctor-modal');
                modal.querySelector('.modal-header h3').innerText = "تعديل بيانات الطبيب";
                modal.querySelector('.btn-add').innerText = "تحديث البيانات";
                
                openModal('add-doctor-modal');
            }
            else if (currentPath === "clinics.html") {
                // columns: code, name, floor, head
                const code = row.cells[0].innerText;
                const name = row.cells[1].innerText;
                const floor = row.cells[2].innerText;
                const head = row.cells[3].innerText;
                
                document.getElementById('clinic-code').value = code;
                document.getElementById('clinic-name').value = name;
                document.getElementById('clinic-floor').value = floor;
                document.getElementById('clinic-head').value = head;
                
                document.getElementById('clinic-code').readOnly = true;
                
                const modal = document.getElementById('add-clinic-modal');
                modal.querySelector('.modal-header h3').innerText = "تعديل بيانات العيادة";
                modal.querySelector('.btn-add').innerText = "تحديث البيانات";
                
                openModal('add-clinic-modal');
            }
            else if (currentPath === "appointments.html") {
                // البيانات الدقيقة (المعرفات والتاريخ الكامل) مخزنة على الصف من قاعدة البيانات
                const patient = row.cells[0].innerText;
                const status = row.cells[3].innerText.trim();

                document.getElementById('appt-patient').value = patient;
                document.getElementById('appt-doctor').value = row.dataset.doctorId || '';

                // "YYYY-MM-DD HH:MM:SS" → "YYYY-MM-DDTHH:MM" (صيغة datetime-local)
                const dt = String(row.dataset.datetime || '').replace(' ', 'T').substring(0, 16);
                document.getElementById('appt-date').value = dt;
                document.getElementById('appt-status').value = status;

                const modal = document.getElementById('add-appointment-modal');
                modal.querySelector('.modal-header h3').innerText = "تعديل موعد";
                modal.querySelector('.btn-add').innerText = "تحديث البيانات";
                
                openModal('add-appointment-modal');
            }
            else if (currentPath === "users.html") {
                // columns: username, role, last_login, status
                const username = row.cells[0].innerText;
                const role = row.cells[1].innerText;
                
                document.getElementById('usr-name').value = username;
                document.getElementById('usr-role').value = role;
                
                document.getElementById('usr-password').required = false;
                document.getElementById('usr-password').placeholder = "اتركه فارغاً للاحتفاظ بكلمة المرور الحالية";
                document.getElementById('usr-name').readOnly = true;
                
                const modal = document.getElementById('add-user-modal');
                modal.querySelector('.modal-header h3').innerText = "تعديل مستخدم";
                modal.querySelector('.btn-add').innerText = "تحديث البيانات";
                
                openModal('add-user-modal');
            }
            else if (currentPath === "complaints.html") {
                // columns: sender, subject, date, status
                const sender = row.cells[0].innerText.trim();
                const subject = row.cells[1].innerText.trim();
                const date = row.cells[2].innerText.trim();
                const status = row.cells[3].innerText.trim();

                document.getElementById('comp-sender').value = sender;
                document.getElementById('comp-subject').value = subject;
                document.getElementById('comp-date').value = date;

                // نص الشكوى وردّها من قاعدة البيانات (مخزنان بمعرّف الشكوى وليس باسم المرسل)
                const data = complaintMessages[row.dataset.id] || { message: "نص الرسالة غير متوفر.", reply: "" };
                document.getElementById('comp-message').value = data.message;
                
                const replyContainer = document.getElementById('reply-container');
                const existingReplyContainer = document.getElementById('existing-reply-container');
                const btnSendReply = document.getElementById('btn-send-reply');
                
                if (status === "مغلق" || status === "تم الرد") {
                    // View Mode
                    replyContainer.style.display = 'none';
                    document.getElementById('comp-reply').required = false;
                    
                    existingReplyContainer.style.display = 'block';
                    document.getElementById('existing-reply').value = data.reply || "تم معالجة الشكوى بنجاح.";
                    
                    btnSendReply.style.display = 'none';
                    
                    const modal = document.getElementById('complaint-modal');
                    modal.querySelector('.modal-header h3').innerText = "تفاصيل الشكوى (مغلقة)";
                } else {
                    // Reply Mode
                    replyContainer.style.display = 'block';
                    document.getElementById('comp-reply').required = true;
                    document.getElementById('comp-reply').value = "";
                    
                    existingReplyContainer.style.display = 'none';
                    btnSendReply.style.display = 'inline-flex';
                    
                    const modal = document.getElementById('complaint-modal');
                    modal.querySelector('.modal-header h3').innerText = "الرد على الشكوى الإدارية";
                }
                
                openModal('complaint-modal');
            }
        }
    });
});

// Modal Actions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        const firstInput = modal.querySelector('input, select, textarea:not([readonly])');
        if (firstInput) firstInput.focus();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        
        setTimeout(() => {
            currentEditRow = null;
            
            if (modalId === 'add-doctor-modal') {
                modal.querySelector('.modal-header h3').innerText = "إضافة طبيب جديد";
                modal.querySelector('.btn-add').innerText = "حفظ البيانات";
                document.getElementById('add-doctor-form').reset();
            }
            else if (modalId === 'add-clinic-modal') {
                modal.querySelector('.modal-header h3').innerText = "إضافة عيادة جديدة";
                modal.querySelector('.btn-add').innerText = "حفظ البيانات";
                document.getElementById('clinic-code').readOnly = false;
                document.getElementById('add-clinic-form').reset();
            }
            else if (modalId === 'add-appointment-modal') {
                modal.querySelector('.modal-header h3').innerText = "إضافة موعد جديد";
                modal.querySelector('.btn-add').innerText = "حفظ البيانات";
                document.getElementById('add-appointment-form').reset();
            }
            else if (modalId === 'add-user-modal') {
                modal.querySelector('.modal-header h3').innerText = "إضافة مستخدم جديد";
                modal.querySelector('.btn-add').innerText = "حفظ البيانات";
                document.getElementById('usr-name').readOnly = false;
                document.getElementById('usr-password').required = true;
                document.getElementById('usr-password').placeholder = "••••••••";
                document.getElementById('add-user-form').reset();
            }
            else if (modalId === 'complaint-modal') {
                document.getElementById('complaint-form').reset();
                document.getElementById('reply-container').style.display = 'block';
                document.getElementById('existing-reply-container').style.display = 'none';
                document.getElementById('btn-send-reply').style.display = 'inline-flex';
            }
        }, 300);
    }
}

// ===== دوال الحفظ — أُعيد ربطها بالكامل مع الباك اند (كانت محاكاة DOM فقط) =====
async function saveDoctor(event) {
    event.preventDefault();
    // FormData بدل JSON حتى نستطيع إرفاق صورة الطبيب (multer على السيرفر)
    const formData = new FormData();
    formData.append('name', document.getElementById('doc-name').value.trim());
    formData.append('specialization', document.getElementById('doc-specialty').value.trim());
    formData.append('phone', document.getElementById('doc-phone').value.trim());
    formData.append('clinic_id', document.getElementById('doc-clinic').value || '');
    const imageFile = document.getElementById('doc-image').files[0];
    if (imageFile) formData.append('image', imageFile);

    try {
        let res;
        if (currentEditRow) {
            // تعديل: PUT /api/doctors/:id
            res = await fetch(`/api/doctors/${currentEditRow.dataset.id}`, {
                method: 'PUT',
                body: formData
            });
        } else {
            // إضافة: POST /api/doctors/add
            res = await fetch('/api/doctors/add', {
                method: 'POST',
                body: formData
            });
        }
        const result = await res.json();
        if (!result.success) {
            alert(result.message || 'تعذر حفظ بيانات الطبيب');
            return;
        }
        showTemporaryNotification(currentEditRow ? "تم تحديث بيانات الطبيب بنجاح!" : "تم إضافة الطبيب بنجاح!");
        closeModal('add-doctor-modal');
        loadDoctorsPage(); // إعادة تعبئة الجدول من القاعدة
    } catch (err) {
        console.error('فشل حفظ الطبيب:', err);
        showServerError();
    }
}

async function saveClinic(event) {
    event.preventDefault();
    // FormData بدل JSON حتى نستطيع إرفاق صورة العيادة (multer على السيرفر)
    const formData = new FormData();
    formData.append('code', document.getElementById('clinic-code').value.trim());
    formData.append('name', document.getElementById('clinic-name').value.trim());
    formData.append('floor', document.getElementById('clinic-floor').value.trim());
    formData.append('head_name', document.getElementById('clinic-head').value.trim());
    const imageFile = document.getElementById('clinic-image').files[0];
    if (imageFile) formData.append('image', imageFile);

    try {
        let res;
        if (currentEditRow) {
            formData.append('id', currentEditRow.dataset.id);
            res = await fetch('/api/clinics/update', {
                method: 'POST',
                body: formData
            });
        } else {
            res = await fetch('/api/clinics/add', {
                method: 'POST',
                body: formData
            });
        }
        const result = await res.json();
        if (!result.success) {
            alert(result.message || 'تعذر حفظ بيانات العيادة');
            return;
        }
        showTemporaryNotification(currentEditRow ? "تم تحديث بيانات العيادة بنجاح!" : "تم إضافة العيادة بنجاح!");
        closeModal('add-clinic-modal');
        loadClinicsPage();
    } catch (err) {
        console.error('فشل حفظ العيادة:', err);
        showServerError();
    }
}

async function saveAppointment(event) {
    event.preventDefault();
    const patient = document.getElementById('appt-patient').value.trim();
    const doctorId = document.getElementById('appt-doctor').value;
    const rawDate = document.getElementById('appt-date').value; // "YYYY-MM-DDTHH:MM"
    const status = document.getElementById('appt-status').value;

    if (!patient || !doctorId || !rawDate) {
        alert('يرجى تعبئة كل حقول الموعد');
        return;
    }

    try {
        if (currentEditRow) {
            // تعديل موعد قائم
            const res = await fetch('/api/appointments/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: currentEditRow.dataset.id,
                    patient_name: patient,
                    doctor_id: doctorId,
                    appointment_date: rawDate,
                    status: status
                })
            });
            const result = await res.json();
            if (!result.success) {
                alert(result.message || 'تعذر تحديث الموعد');
                return;
            }
            showTemporaryNotification("تم تحديث الموعد بنجاح!");
        } else {
            // إضافة موعد جديد — عبر مسار الحجز نفسه حتى تنطبق فحوصات
            // الدوام ومنع التعارض على مواعيد الإدارة أيضاً
            const res = await fetch('/api/appointments/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_name: patient,
                    doctor_id: doctorId,
                    appointment_date: rawDate
                })
            });
            const result = await res.json();
            if (!result.success) {
                alert(result.message || 'تعذر إضافة الموعد');
                return;
            }
            // الحجز يبدأ بحالة "انتظار"؛ إن اختار الأدمن حالة أخرى نحدّثها مباشرة
            if (status !== 'انتظار') {
                await fetch('/api/appointments/update-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: result.data.ticket_number, status: status })
                });
            }
            showTemporaryNotification("تم جدولة الموعد بنجاح!");
        }
        closeModal('add-appointment-modal');
        loadAppointmentsPage();
    } catch (err) {
        console.error('فشل حفظ الموعد:', err);
        showServerError();
    }
}

async function saveUser(event) {
    event.preventDefault();
    const name = document.getElementById('usr-name').value.trim();
    const role = document.getElementById('usr-role').value;
    const password = document.getElementById('usr-password').value;

    try {
        let res;
        if (currentEditRow) {
            // تعديل: الصلاحية دائماً، وكلمة المرور فقط إذا كُتبت قيمة جديدة
            res = await fetch('/api/users/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentEditRow.dataset.id, role, password: password || null })
            });
        } else {
            res = await fetch('/api/users/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: name, password, role })
            });
        }
        const result = await res.json();
        if (!result.success) {
            alert(result.message || 'تعذر حفظ بيانات المستخدم');
            return;
        }
        showTemporaryNotification(currentEditRow ? "تم تحديث بيانات المستخدم بنجاح!" : "تم إضافة المستخدم بنجاح!");
        closeModal('add-user-modal');
        loadUsersPage();
    } catch (err) {
        console.error('فشل حفظ المستخدم:', err);
        showServerError();
    }
}

// Settle and reply to a complaint
// أُعيد ربطه بالباك اند: الرد يُحفظ في القاعدة ويظهر للمريض في موقع الزوار
async function submitComplaintReply(event) {
    event.preventDefault();
    const replyText = document.getElementById('comp-reply').value.trim();
    if (!currentEditRow || !replyText) return;

    try {
        const res = await fetch('/api/complaints/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentEditRow.dataset.id, reply: replyText })
        });
        const result = await res.json();
        if (!result.success) {
            alert(result.message || 'تعذر إرسال الرد');
            return;
        }
        showTemporaryNotification("تم إرسال الرد وتحديث حالة الشكوى بنجاح!");
        closeModal('complaint-modal');
        loadComplaintsPage(); // إعادة التعبئة تُحدّث الحالة والزر تلقائياً
    } catch (err) {
        console.error('فشل إرسال الرد:', err);
        showServerError();
    }
}

// Temporary toast notification helper
function showTemporaryNotification(message) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '30px';
    notification.style.left = '30px';
    notification.style.background = 'var(--primary-blue)';
    notification.style.color = 'white';
    notification.style.padding = '14px 28px';
    notification.style.borderRadius = '10px';
    notification.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
    notification.style.zIndex = '2000';
    notification.style.fontFamily = 'Cairo, sans-serif';
    notification.style.fontWeight = 'bold';
    notification.style.fontSize = '0.95rem';
    notification.style.direction = 'rtl';
    notification.style.animation = 'fadeIn 0.3s ease';
    
    notification.innerText = "✓ " + message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transition = 'all 0.3s ease';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(10px)';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// Login & Logout
// ملاحظة للمناقشة: التحقق ما زال على جهة الواجهة (admin/123) — تحسين مستقبلي:
// نقله للسيرفر مع تشفير bcrypt وجلسات حقيقية
function handleLogin(event) {
    if(event) event.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (user === "admin" && pass === "123") {
        // علامة الجلسة التي يفحصها حارس الدخول في كل صفحات الإدارة
        localStorage.setItem("alyaseen_admin", "1");
        window.location.href = "dashboard.html";
    } else {
        alert("خطأ في اسم المستخدم أو كلمة المرور");
    }
}

function logout() {
    if (confirm("هل تريد تسجيل الخروج؟")) {
        localStorage.removeItem("alyaseen_admin"); // مسح علامة الجلسة
        window.location.href = "index.html";
    }
}

// ===== أُضيف للربط مع الباك اند: تحميل بيانات لوحة التحكم =====
async function loadDashboardData() {
    // 1) كروت الإحصائيات
    try {
        const stats = await (await fetch('/api/appointments/stats')).json();
        document.getElementById('stat-doctors').textContent = stats.doctors;
        document.getElementById('stat-clinics').textContent = stats.clinics;
        document.getElementById('stat-appointments').textContent = stats.appointments;
        document.getElementById('stat-complaints').textContent = stats.complaints;
    } catch (err) {
        console.error('فشل تحميل الإحصائيات:', err);
        showServerError();
    }

    // 2) جدول آخر المواعيد المحجوزة (أحدث 5 حسب وقت الحجز)
    try {
        const appointments = await (await fetch('/api/appointments')).json();
        const latest = [...appointments]
            .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
            .slice(0, 5);

        const tbody = document.getElementById('latest-appointments-body');
        if (latest.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا توجد مواعيد بعد</td></tr>';
            return;
        }
        tbody.innerHTML = latest.map(a => `
            <tr>
                <td>${a.patient_name}</td>
                <td>${a.doctor_name || '-'}</td>
                <td>${a.clinic_name || '-'}</td>
                <td>${formatDateTime(a.appointment_date)}</td>
                <td><span class="status-tag ${STATUS_CLASS[a.status] || 'status-pending'}">${STATUS_ARABIC[a.status] || a.status}</span></td>
            </tr>`).join('');
    } catch (err) {
        console.error('فشل تحميل آخر المواعيد:', err);
        showServerError();
    }
}

// ===== أُضيف للربط مع الباك اند: محمّلات صفحات الإدارة =====

// صفحة الأطباء: الجدول + قائمة العيادات في المودال
async function loadDoctorsPage() {
    try {
        // تعبئة قائمة العيادات في مودال الإضافة/التعديل
        const clinics = await (await fetch('/api/clinics')).json();
        const clinicSelect = document.getElementById('doc-clinic');
        clinicSelect.innerHTML = '<option value="" disabled selected>اختر العيادة</option>' +
            clinics.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

        // تعبئة جدول الأطباء
        const doctors = await (await fetch('/api/doctors')).json();
        const tbody = document.getElementById('doctors-table-body');
        if (doctors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا يوجد أطباء بعد</td></tr>';
            return;
        }
        tbody.innerHTML = doctors.map((d, i) => `
            <tr data-id="${d.id}" data-clinic-id="${d.clinic_id || ''}">
                <td>${i + 1}</td>
                <td>${d.name}</td>
                <td>${d.specialization}</td>
                <td>${d.phone || '-'}</td>
                <td>
                    <button class="btn btn-edit">تعديل</button>
                    <button class="btn btn-delete">حذف</button>
                </td>
            </tr>`).join('');
    } catch (err) {
        console.error('فشل تحميل الأطباء:', err);
        showServerError();
    }
}

// صفحة العيادات
async function loadClinicsPage() {
    try {
        const clinics = await (await fetch('/api/clinics')).json();
        const tbody = document.getElementById('clinics-table-body');
        if (clinics.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا توجد عيادات بعد</td></tr>';
            return;
        }
        tbody.innerHTML = clinics.map(c => `
            <tr data-id="${c.id}">
                <td>${c.code || '-'}</td>
                <td>${c.name}</td>
                <td>${c.floor || '-'}</td>
                <td>${c.head_name || '-'}</td>
                <td>
                    <button class="btn btn-edit">تعديل</button>
                    <button class="btn btn-delete">حذف</button>
                </td>
            </tr>`).join('');
    } catch (err) {
        console.error('فشل تحميل العيادات:', err);
        showServerError();
    }
}

// صفحة المواعيد: الجدول + قائمة الأطباء في المودال
async function loadAppointmentsPage() {
    try {
        // تعبئة قائمة الأطباء في المودال
        const doctors = await (await fetch('/api/doctors')).json();
        const doctorSelect = document.getElementById('appt-doctor');
        doctorSelect.innerHTML = '<option value="" disabled selected>اختر الطبيب</option>' +
            doctors.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

        // تعبئة جدول المواعيد
        const appointments = await (await fetch('/api/appointments')).json();
        const tbody = document.getElementById('appointments-table-body');
        if (appointments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا توجد مواعيد بعد</td></tr>';
            return;
        }
        tbody.innerHTML = appointments.map(a => `
            <tr data-id="${a.id}" data-doctor-id="${a.doctor_id}" data-datetime="${a.appointment_date}">
                <td>${a.patient_name}</td>
                <td>${a.doctor_name || '-'}</td>
                <td>${formatDateTime(a.appointment_date)}</td>
                <td><span class="status-tag ${STATUS_CLASS[a.status] || 'status-pending'}">${STATUS_ARABIC[a.status] || a.status}</span></td>
                <td>
                    <button class="btn btn-edit">تعديل</button>
                    <button class="btn btn-delete">حذف</button>
                </td>
            </tr>`).join('');
    } catch (err) {
        console.error('فشل تحميل المواعيد:', err);
        showServerError();
    }
}

// صفحة الشكاوى: الجدول + تخزين النصوص والردود للمودال
async function loadComplaintsPage() {
    try {
        const complaints = await (await fetch('/api/complaints')).json();
        const tbody = document.getElementById('complaints-table-body');
        if (complaints.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا توجد شكاوى بعد</td></tr>';
            return;
        }

        // تخزين نص الشكوى والرد بمعرّفها ليقرأهما مودال العرض/الرد
        complaintMessages = {};
        complaints.forEach(c => {
            complaintMessages[c.id] = { message: c.complaint_text, reply: c.admin_reply || '' };
        });

        tbody.innerHTML = complaints.map(c => {
            const replied = c.status === 'replied';
            return `
            <tr data-id="${c.id}">
                <td>${c.patient_name}</td>
                <td>${c.subject || 'بدون موضوع'}</td>
                <td>${formatDateTime(c.created_at)}</td>
                <td><span class="status-tag ${replied ? 'status-success' : 'status-pending'}">${replied ? 'تم الرد' : 'جديدة'}</span></td>
                <td><button class="btn btn-edit ${replied ? 'btn-view-complaint' : 'btn-reply-complaint'}">${replied ? 'عرض' : 'رد'}</button></td>
            </tr>`;
        }).join('');
    } catch (err) {
        console.error('فشل تحميل الشكاوى:', err);
        showServerError();
    }
}

// صفحة المستخدمين
async function loadUsersPage() {
    try {
        const result = await (await fetch('/api/users')).json();
        const users = result.data || [];
        const tbody = document.getElementById('users-table-body');
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا يوجد مستخدمون بعد</td></tr>';
            return;
        }
        tbody.innerHTML = users.map(u => `
            <tr data-id="${u.id}">
                <td>${u.username}</td>
                <td>${u.role}</td>
                <td>${formatDateTime(u.last_login)}</td>
                <td>${u.status}</td>
                <td>
                    <button class="btn btn-edit">تعديل</button>
                    <button class="btn btn-delete">حذف</button>
                </td>
            </tr>`).join('');
    } catch (err) {
        console.error('فشل تحميل المستخدمين:', err);
        showServerError();
    }
}
