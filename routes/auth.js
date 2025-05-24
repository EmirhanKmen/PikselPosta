// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { isGuest } = require('../middleware/authMiddleware');
const router = express.Router();

// GET /auth/register
router.get('/register', isGuest, (req, res) => {
    res.render('auth/register', {
        pageTitle: 'Kayıt Ol',
        
    });
});

// POST /auth/register
router.post('/register', isGuest, async (req, res) => {
    const { company_name, email, password, confirm_password } = req.body;
    let errors = [];

    if (!company_name || !email || !password || !confirm_password) {
        errors.push({ msg: 'Lütfen tüm alanları doldurun.' });
    }
    if (password && password.length < 6) {
        errors.push({ msg: 'Şifre en az 6 karakter olmalıdır.' });
    }
    if (password !== confirm_password) {
        errors.push({ msg: 'Şifreler eşleşmiyor.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        errors.push({ msg: 'Lütfen geçerli bir e-posta adresi girin.' });
    }

    if (errors.length > 0) {
        req.session.errors = errors;
        req.session.formData = { company_name, email };
        return res.redirect('/auth/register');
    }

    try {
        const [existingUsers] = await db.query('SELECT id FROM brand_owners WHERE email = ?', [email.toLowerCase()]);
        if (existingUsers.length > 0) {
            req.session.errors = [{ msg: 'Bu e-posta adresi zaten kayıtlı.' }];
            req.session.formData = { company_name, email };
            return res.redirect('/auth/register');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query(
            'INSERT INTO brand_owners (company_name, email, password_hash) VALUES (?, ?, ?)',
            [company_name, email.toLowerCase(), hashedPassword]
        );
        req.session.success_msg = 'Başarıyla kayıt oldunuz! Şimdi giriş yapabilirsiniz.';
        res.redirect('/auth/login');

    } catch (error) {
        console.error('Kayıt sırasında veritabanı hatası:', error);
        req.session.errors = [{ msg: 'Kayıt sırasında bir sunucu hatası oluştu.' }];
        req.session.formData = { company_name, email };
        res.redirect('/auth/register');
    }
});

// GET /auth/login
router.get('/login', isGuest, (req, res) => {
    res.render('auth/login', {
        pageTitle: 'Giriş Yap',
    });
});

// POST /auth/login
router.post('/login', isGuest, async (req, res) => {
    const { email, password } = req.body;
    let errors = [];

    if (!email || !password) {
        errors.push({ msg: 'Lütfen e-posta ve şifrenizi girin.' });
    }

    if (errors.length > 0) {
        req.session.errors = errors;
        req.session.formData = { email };
        return res.redirect('/auth/login');
    }

    try {
        const [users] = await db.query('SELECT * FROM brand_owners WHERE email = ?', [email.toLowerCase()]);
        if (users.length === 0) {
            req.session.errors = [{ msg: 'E-posta veya şifre hatalı.' }];
            req.session.formData = { email };
            return res.redirect('/auth/login');
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            req.session.brandOwnerId = user.id;
            req.session.brandOwnerEmail = user.email;
            delete req.session.formData;
            delete req.session.errors;
            res.redirect('/dashboard');
        } else {
            req.session.errors = [{ msg: 'E-posta veya şifre hatalı.' }];
            req.session.formData = { email };
            return res.redirect('/auth/login');
        }
    } catch (error) {
        console.error('Giriş sırasında veritabanı hatası:', error);
        req.session.errors = [{ msg: 'Giriş sırasında bir sunucu hatası oluştu.' }];
        req.session.formData = { email };
        res.redirect('/auth/login');
    }
});

// GET /auth/logout
router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Oturum sonlandırma hatası:', err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/auth/login');
    });
});

module.exports = router;