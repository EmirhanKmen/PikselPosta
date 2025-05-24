// my-smtp-server.js
const { SMTPServer } = require('smtp-server');

const server = new SMTPServer({
    onAuth(auth, session, callback) {
        if (auth.username === 'testuser' && auth.password === 'testpass') {
            console.log(`Kimlik doğrulama başarılı: ${auth.username}`);
            return callback(null, { user: auth.username }); // Başarılı
        }
        console.log(`Kimlik doğrulama başarısız: ${auth.username}`);
        return callback(new Error('Invalid username or password')); 
    },

    // Bağlantı kurulduğunda
    onConnect(session, callback) {
        console.log(`Bağlantı kuruldu: ${session.remoteAddress}`);
        return callback(); 
    },

    // MAIL FROM komutu alındığında
    onMailFrom(address, session, callback) {
        console.log(`MAIL FROM: ${address.address} (Oturum: ${session.id})`);
        return callback(); 
    },

    // RCPT TO komutu alındığında
    onRcptTo(address, session, callback) {
        console.log(`RCPT TO: ${address.address} (Oturum: ${session.id})`);
        return callback(); 
    },
    onData(stream, session, callback) {
        let emailData = '';
        console.log('E-posta verisi alınıyor...');
        stream.on('data', (chunk) => {
            emailData += chunk.toString();
        });
        stream.on('end', () => {
            console.log('-------------------- E-POSTA BAŞLANGICI --------------------');
            console.log(`Kimden: ${session.envelope.mailFrom.address}`);
            console.log(`Kime: ${session.envelope.rcptTo.map(r => r.address).join(', ')}`);
            console.log('--- Veri ---');
            console.log(emailData);
            console.log('--------------------- E-POSTA SONU ----------------------');

            callback(); 
        });
        stream.on('error', (err) => {
            console.error('Veri akışında hata:', err);
            callback(err);
        });
    },

    // Bağlantı kapandığında
    onClose(session) {
        console.log(`Bağlantı kapandı: ${session.remoteAddress} (Oturum: ${session.id})`);
    },

    // Hata oluştuğunda
    onError(err) {
        console.error('Sunucu Hatası:', err);
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Kendi SMTP sunucun ${PORT} portunda dinlemede...`);
});