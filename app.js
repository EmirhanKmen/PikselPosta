// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const db = require('./db');

// Rota dosyaları
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware'ler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// View Engine Ayarı - EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Session Ayarları
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 gün
    }
}));

// Global değişkenler ve Flash Mesaj Yönetimi
app.use((req, res, next) => {
    res.locals.currentUser = req.session.brandOwnerId;
    res.locals.currentUserName = req.session.brandOwnerEmail;

    if (req.session.success_msg) {
        res.locals.success_msg = req.session.success_msg;
        delete req.session.success_msg;
    }
    if (req.session.error_msg) {
        res.locals.error_msg = req.session.error_msg;
        delete req.session.error_msg;
    }
    if (req.session.errors) {
        res.locals.errors = req.session.errors;
        delete req.session.errors;
    } else {
        res.locals.errors = [];
    }
    if (req.session.formData) {
        res.locals.formData = req.session.formData;
        delete req.session.formData;
    } else {
        res.locals.formData = {};
    }
    next();
});

// Ana sayfa rotası 
app.get('/', (req, res) => {
    res.render('index', { user: req.user || null }); 
});

// Rota Kullanımı
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);

// 404 Hata Sayfası
app.use((req, res, next) => {
    res.status(404).render('error/404', { 
        pageTitle: 'Sayfa Bulunamadı - 404',
    });
});

// Genel Hata Yönetimi Middleware'i
app.use((err, req, res, next) => {
    console.error("SUNUCU HATASI OLUŞTU:", err);
    const statusCode = err.status || 500;
    res.status(statusCode);
    res.render('error/500', {
        pageTitle: 'Sunucu Hatası - 500',
        error: process.env.NODE_ENV === 'development' ? err : { message: "Beklenmedik bir sunucu hatası oluştu." },
        statusCode: statusCode
    });
});

// Sunucuyu Başlatma Fonksiyonu
async function startServer() {
    try {
        const [rows] = await db.query('SELECT 1 AS connection_test');
        if (rows && rows[0] && rows[0].connection_test === 1) {
            console.log('MySQL bağlantısı başarılı. Test sorgusu sonucu:', rows);
        } else {
            throw new Error('MySQL bağlantı testi beklenen sonucu vermedi.');
        }
        app.listen(PORT, () => {
            console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
            if (process.env.NODE_ENV !== 'production') {
                console.log('Geliştirme modunda çalışıyor.');
            }
        });
    } catch (error) {
        console.error('MySQL bağlantı hatası veya sunucu başlatma sorunu:', error);
        console.error('Lütfen .env dosyanızdaki DB_HOST, DB_USER, DB_PASSWORD, DB_NAME ayarlarını ve MySQL sunucunuzun çalıştığını kontrol edin.');
        process.exit(1);
    }
}

startServer();