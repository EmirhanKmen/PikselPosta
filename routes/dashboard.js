// routes/dashboard.js
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const db = require('../db');
const { sendEmail } = require('../services/emailService');

router.use(isAuthenticated);

// GET /dashboard - Ana Dashboard Sayfası
router.get('/', async (req, res) => {
    try {
        const brandOwnerId = req.session.brandOwnerId;
        const [customerCountResult] = await db.query(
            'SELECT COUNT(*) AS totalCustomers FROM customers WHERE brand_owner_id = ?',
            [brandOwnerId]
        );
        const totalCustomers = customerCountResult[0].totalCustomers || 0;
        const [emailCountResult] = await db.query(
            "SELECT COUNT(*) AS totalEmailsSent FROM email_logs WHERE brand_owner_id = ? AND status LIKE 'sent%'",
            [brandOwnerId]
        );
        const totalEmailsSent = emailCountResult[0].totalEmailsSent || 0;
        res.render('dashboard/index', {
            pageTitle: 'Panelim',
            totalCustomers: totalCustomers,
            totalEmailsSent: totalEmailsSent,
        });
    } catch (error) {
        console.error("Dashboard ana sayfa hatası:", error);
        res.render('dashboard/index', {
            pageTitle: 'Panelim',
            totalCustomers: 0,
            totalEmailsSent: 0,
            error_msg: 'Dashboard verileri yüklenirken bir sorun oluştu.'
        });
    }
});

// --- MÜŞTERİ YÖNETİMİ ROTALARI ---
// GET /dashboard/customers
router.get('/customers', async (req, res) => {
    try {
        const brandOwnerId = req.session.brandOwnerId;
        const [customers] = await db.query(
            'SELECT id, customer_name, customer_email, phone_number, created_at FROM customers WHERE brand_owner_id = ? ORDER BY created_at DESC',
            [brandOwnerId]
        );
        res.render('dashboard/customers', {
            pageTitle: 'Müşterilerim',
            customers: customers,
        });
    } catch (error) {
        console.error('Müşteri listeleme hatası:', error);
        req.session.error_msg = 'Müşteriler listelenirken bir hata oluştu.';
        res.redirect('/dashboard');
    }
});

// POST /dashboard/customers/add
router.post('/customers/add', async (req, res) => {
    const { customer_name, customer_email, phone_number, address, order_details } = req.body;
    const brandOwnerId = req.session.brandOwnerId;
    let errors = [];
    if (!customer_email) {
        errors.push({ msg: 'Müşteri e-posta adresi zorunludur.' });
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customer_email)) {
            errors.push({ msg: 'Lütfen geçerli bir e-posta adresi girin.' });
        }
    }
    if (errors.length > 0) {
        req.session.errors = errors;
        req.session.formData = { customer_name, customer_email, phone_number, address, order_details };
        return res.redirect('/dashboard/customers');
    }
    try {
        const [existingCustomer] = await db.query(
            'SELECT id FROM customers WHERE brand_owner_id = ? AND customer_email = ?',
            [brandOwnerId, customer_email.toLowerCase()]
        );
        if (existingCustomer.length > 0) {
            req.session.errors = [{ msg: 'Bu e-posta adresine sahip bir müşteri zaten mevcut.' }];
            req.session.formData = { customer_name, customer_email, phone_number, address, order_details };
            return res.redirect('/dashboard/customers');
        }
        await db.query(
            'INSERT INTO customers (brand_owner_id, customer_name, customer_email, phone_number, address, order_details) VALUES (?, ?, ?, ?, ?, ?)',
            [brandOwnerId, customer_name, customer_email.toLowerCase(), phone_number, address, order_details]
        );
        req.session.success_msg = 'Yeni müşteri başarıyla eklendi.';
        res.redirect('/dashboard/customers');
    } catch (error) {
        console.error('Müşteri ekleme hatası:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            req.session.errors = [{ msg: 'Bu e-posta adresine sahip bir müşteri zaten mevcut (DB).'}];
        } else {
            req.session.errors = [{ msg: 'Müşteri eklenirken bir sunucu hatası oluştu.' }];
        }
        req.session.formData = { customer_name, customer_email, phone_number, address, order_details };
        res.redirect('/dashboard/customers');
    }
});

// GET /dashboard/customers/edit/:id
router.get('/customers/edit/:id', async (req, res) => {
    try {
        const customerId = req.params.id;
        const brandOwnerId = req.session.brandOwnerId;
        const [customers] = await db.query(
            'SELECT * FROM customers WHERE id = ? AND brand_owner_id = ?',
            [customerId, brandOwnerId]
        );
        if (customers.length === 0) {
            req.session.error_msg = 'Müşteri bulunamadı veya bu müşteriyi düzenleme yetkiniz yok.';
            return res.redirect('/dashboard/customers');
        }
        const customer = customers[0];
        const formDataFromSession = req.session.formData;
        const initialFormData = formDataFromSession || customer;
        res.render('dashboard/edit-customer', {
            pageTitle: 'Müşteriyi Düzenle',
            customer: customer,
            formData: initialFormData
        });
    } catch (error) {
        console.error('Müşteri düzenleme formu hatası:', error);
        req.session.error_msg = 'Müşteri bilgileri getirilirken bir hata oluştu.';
        res.redirect('/dashboard/customers');
    }
});

// POST /dashboard/customers/update/:id
router.post('/customers/update/:id', async (req, res) => {
    const customerId = req.params.id;
    const brandOwnerId = req.session.brandOwnerId;
    const { customer_name, customer_email, phone_number, address, order_details } = req.body;
    let errors = [];
    if (!customer_email) {
        errors.push({ msg: 'Müşteri e-posta adresi zorunludur.' });
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customer_email)) {
            errors.push({ msg: 'Lütfen geçerli bir e-posta adresi girin.' });
        }
    }
    if (errors.length > 0) {
        req.session.errors = errors;
        req.session.formData = { customer_name, customer_email, phone_number, address, order_details, id: customerId };
        return res.redirect(`/dashboard/customers/edit/${customerId}`);
    }
    try {
        const [existingEmail] = await db.query(
            'SELECT id FROM customers WHERE brand_owner_id = ? AND customer_email = ? AND id != ?',
            [brandOwnerId, customer_email.toLowerCase(), customerId]
        );
        if (existingEmail.length > 0) {
            req.session.errors = [{ msg: 'Bu e-posta adresi zaten başka bir müşterinize ait.' }];
            req.session.formData = { customer_name, customer_email, phone_number, address, order_details, id: customerId };
            return res.redirect(`/dashboard/customers/edit/${customerId}`);
        }
        const [result] = await db.query(
            'UPDATE customers SET customer_name = ?, customer_email = ?, phone_number = ?, address = ?, order_details = ? WHERE id = ? AND brand_owner_id = ?',
            [customer_name, customer_email.toLowerCase(), phone_number, address, order_details, customerId, brandOwnerId]
        );
        if (result.affectedRows === 0) {
             req.session.error_msg = 'Müşteri bulunamadı veya güncelleme yetkiniz yok.';
             return res.redirect('/dashboard/customers');
        }
        req.session.success_msg = 'Müşteri bilgileri başarıyla güncellendi.';
        res.redirect('/dashboard/customers');
    } catch (error) {
        console.error('Müşteri güncelleme hatası:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            req.session.errors = [{ msg: 'Bu e-posta adresi zaten başka bir müşterinize ait (DB).'}];
        } else {
            req.session.errors = [{ msg: 'Müşteri güncellenirken bir sunucu hatası oluştu.' }];
        }
        req.session.formData = { customer_name, customer_email, phone_number, address, order_details, id: customerId };
        res.redirect(`/dashboard/customers/edit/${customerId}`);
    }
});

// POST /dashboard/customers/delete/:id
router.post('/customers/delete/:id', async (req, res) => {
    try {
        const customerId = req.params.id;
        const brandOwnerId = req.session.brandOwnerId;
        const [result] = await db.query(
            'DELETE FROM customers WHERE id = ? AND brand_owner_id = ?',
            [customerId, brandOwnerId]
        );
        if (result.affectedRows === 0) {
            req.session.error_msg = 'Müşteri bulunamadı veya silme yetkiniz yok.';
        } else {
            req.session.success_msg = 'Müşteri başarıyla silindi.';
        }
        res.redirect('/dashboard/customers');
    } catch (error) {
        console.error('Müşteri silme hatası:', error);
        req.session.error_msg = 'Müşteri silinirken bir sunucu hatası oluştu.';
        res.redirect('/dashboard/customers');
    }
});

// GET /dashboard/customers/view/:id
router.get('/customers/view/:id', async (req, res) => {
    try {
        const customerId = req.params.id;
        const brandOwnerId = req.session.brandOwnerId;
        const [customers] = await db.query(
            'SELECT * FROM customers WHERE id = ? AND brand_owner_id = ?',
            [customerId, brandOwnerId]
        );
        if (customers.length === 0) {
            req.session.error_msg = 'Müşteri bulunamadı veya bu müşteriyi görüntüleme yetkiniz yok.';
            return res.redirect('/dashboard/customers');
        }
        const customer = customers[0];
        res.render('dashboard/view-customer', {
            pageTitle: `Müşteri Detayları: ${customer.customer_name || customer.customer_email}`,
            customer: customer
        });
    } catch (error) {
        console.error('Müşteri detay görüntüleme hatası:', error);
        req.session.error_msg = 'Müşteri detayları getirilirken bir hata oluştu.';
        res.redirect('/dashboard/customers');
    }
});

// GET /dashboard/email/compose
router.get('/email/compose', async (req, res) => {
    try {
        const brandOwnerId = req.session.brandOwnerId;
        const [customers] = await db.query(
            'SELECT id, customer_name, customer_email FROM customers WHERE brand_owner_id = ? ORDER BY customer_name ASC',
            [brandOwnerId]
        );
        res.render('dashboard/compose-email', {
            pageTitle: 'Yeni E-posta Oluştur',
            customers: customers,
        });
    } catch (error) {
        console.error("E-posta oluşturma formu GET hatası:", error);
        req.session.error_msg = "E-posta formu yüklenirken bir hata oluştu.";
        res.redirect('/dashboard');
    }
});
router.post('/email/send', async (req, res) => {
    console.log("-------------------------------------------");
    console.log("POST /email/send ÇAĞRILDI");
    console.log("req.body içeriği:", req.body);
    console.log("req.body.recipient_type değeri:", req.body.recipient_type);
    console.log("req.body.selected_customers değeri:", req.body.selected_customers);
    console.log("-------------------------------------------");

    const { subject, html_content, recipient_type, selected_customers } = req.body;
    const brandOwnerId = req.session.brandOwnerId;
    const brandOwnerEmail = req.session.brandOwnerEmail; 
    let errors = [];

    if (!subject || !html_content) {
        errors.push({ msg: 'Lütfen e-posta konusu ve içeriğini girin.' });
    }
    if (!recipient_type || (recipient_type !== 'all_customers' && recipient_type !== 'specific_customers')) {
        errors.push({ msg: 'Geçerli bir alıcı türü seçmelisiniz.' });
    }
    if (recipient_type === 'specific_customers') {
        if (!selected_customers || (Array.isArray(selected_customers) && selected_customers.length === 0) || (!Array.isArray(selected_customers) && !selected_customers) ) {
            errors.push({ msg: 'Belirli müşterileri seçtiyseniz, lütfen en az bir müşteri işaretleyin.' });
        }
    }

    if (errors.length > 0) {
        req.session.errors = errors;
        req.session.formData = { subject, html_content, recipient_type, selected_customers };
        try {
            const [customersForForm] = await db.query( /* ... müşteri listesini çek ... */ );
            return res.render('dashboard/compose-email', { /* ... formu hatalarla render et ... */ });
        } catch (dbError) { /* ... hata yönetimi ... */ }
    }
    try {
        let customersToSend = []; 

        if (recipient_type === 'all_customers') {
            const [customers] = await db.query(
                'SELECT customer_email, customer_name FROM customers WHERE brand_owner_id = ?',
                [brandOwnerId]
            );
            if (customers.length === 0) { /* ... hata yönetimi ... */ }
            customersToSend = customers;
        } else if (recipient_type === 'specific_customers') {
            const customerIds = Array.isArray(selected_customers) ? selected_customers : [selected_customers].filter(id => id);
            if (customerIds.length === 0) { /* ... hata yönetimi ... */ }
            const [customers] = await db.query(
                'SELECT customer_email, customer_name FROM customers WHERE brand_owner_id = ? AND id IN (?)', 
                [brandOwnerId, customerIds]
            );
            if (customers.length === 0) { /* ... hata yönetimi ... */ }
            customersToSend = customers;
        }

        if (customersToSend.length === 0) {
            req.session.error_msg = 'Belirtilen kriterlere uyan gönderilecek müşteri bulunamadı.';
            const [customersForForm] = await db.query('SELECT id, customer_name, customer_email FROM customers WHERE brand_owner_id = ? ORDER BY customer_name ASC', [brandOwnerId]);
            return res.render('dashboard/compose-email', { pageTitle: 'Yeni E-posta Oluştur', errors: [{msg: req.session.error_msg}], formData: req.body, customers: customersForForm });
        }

        const [owner] = await db.query('SELECT company_name FROM brand_owners WHERE id = ?', [brandOwnerId]);
        const companyName = owner.length > 0 ? owner[0].company_name : "Markanız";

        let successfulSends = 0;
        let failedSends = 0;
        let emailResults = [];
        let recipientEmailListForLog = []; 

        // HER BİR MÜŞTERİYE AYRI E-POSTA GÖNDER
        for (const customer of customersToSend) {
            recipientEmailListForLog.push(customer.customer_email); 

            // E-posta içeriğini kişiselleştirebiliriz (opsiyonel)
            // Örneğin, "Merhaba [Müşteri Adı]," gibi bir şey ekleyebiliriz.
            let personalizedHtmlContent = html_content;
            if (customer.customer_name) {
                personalizedHtmlContent = `<p>Merhaba ${customer.customer_name},</p>${html_content}`;
            }

            const emailResult = await sendEmail(
                customer.customer_email, 
                subject,
                personalizedHtmlContent,
                companyName,
                brandOwnerEmail
            );
            emailResults.push(emailResult); 
            if (emailResult.success) {
                successfulSends++;
            } else {
                failedSends++;
            }
        }

        // Genel başarı/hata mesajı oluştur
        let finalMessage = "";
        if (successfulSends > 0) {
            finalMessage += `${successfulSends} e-posta başarıyla gönderildi. `;
        }
        if (failedSends > 0) {
            finalMessage += `${failedSends} e-posta gönderilemedi. Lütfen detaylar için logları kontrol edin.`;
            req.session.error_msg = finalMessage;
        } else if (successfulSends > 0) {
            req.session.success_msg = finalMessage;
        } else {
            req.session.error_msg = "Hiç e-posta gönderilemedi.";
        }
        
        // Ethereal linklerini birleştir (eğer varsa)
        const previewUrls = emailResults.filter(r => r.success && r.previewUrl).map(r => r.previewUrl);
        if (previewUrls.length > 0) {
            if(req.session.success_msg) req.session.success_msg += " Ethereal Önizlemeleri: "; else req.session.error_msg += " Ethereal Önizlemeleri: ";
            previewUrls.forEach(url => {
                 if(req.session.success_msg) req.session.success_msg += `<a href="${url}" target="_blank" rel="noopener noreferrer">[Link]</a> `;
                 else req.session.error_msg += `<a href="${url}" target="_blank" rel="noopener noreferrer">[Link]</a> `;
            });
        }


        // E-posta logunu kaydet
        const overallStatus = failedSends > 0 ? (successfulSends > 0 ? 'partially_sent' : 'failed') : 'sent';
        try {
            await db.query(
                'INSERT INTO email_logs (brand_owner_id, subject, body, recipients, status) VALUES (?, ?, ?, ?, ?)',
                [brandOwnerId, subject, html_content, JSON.stringify(recipientEmailListForLog), overallStatus]
            );
        } catch (logError) {
            console.error("E-posta log kaydı hatası:", logError);
        }
        
        delete req.session.formData;
        res.redirect('/dashboard/email/compose');

    } catch (error) {
        console.error('E-posta gönderme işlemi hatası (genel catch):', error);
        req.session.error_msg = 'E-postalar gönderilirken genel bir sunucu hatası oluştu.';
        // Hata durumunda formu ve müşteri listesini tekrar render et
        try {
            const [customersForForm] = await db.query( /* ... */ );
            return res.render('dashboard/compose-email', { /* ... */ });
        } catch (dbErrorDuringError) { /* ... */ }
    }
});

module.exports = router;