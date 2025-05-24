// services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true', 
    auth: { 
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {

    }
});
async function sendEmail(to, subject, htmlContent, fromName = "Markanız Adına", replyToEmail = null) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("KRİTİK HATA: .env dosyasında EMAIL_USER veya EMAIL_PASS eksik!");
        return { success: false, error: "E-posta gönderme yapılandırmasında kritik eksiklik var." };
    }
    
    try {
        const mailOptions = {
            from: `"${fromName}" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent,
        };

        if (replyToEmail) {
            mailOptions.replyTo = replyToEmail;
        }

        let info = await transporter.sendMail(mailOptions);

        console.log("E-posta gönderildi (info.messageId): %s", info.messageId);
        
        let previewUrl = null;
        if (process.env.EMAIL_HOST && process.env.EMAIL_HOST.toLowerCase().includes('ethereal.email')) {
            previewUrl = nodemailer.getTestMessageUrl(info);
            if (previewUrl) {
                console.log("Ethereal Önizleme URL (Konsolda): %s", previewUrl);
            }
        }
        
        return { 
            success: true, 
            messageId: info.messageId, 
            previewUrl: previewUrl
        };

    } catch (error) {
        console.error("E-POSTA GÖNDERME SERVİSİNDE HATA OLUŞTU:", error);
        return { 
            success: false, 
            error: error.message || 'Bilinmeyen bir e-posta gönderme hatası oluştu.' 
        };
    }
}

module.exports = { sendEmail };