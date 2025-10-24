# Piksel Posta - Müşteri Yönetimi ve E-posta Uygulaması

**Piksel Posta**, müşterilerinizi veritabanında güvenli bir şekilde saklamanızı ve onlara hem toplu hem de bireysel olarak e-posta göndermenizi sağlayan basit bir web uygulamasıdır. Bu proje, özellikle küçük işletmelerin veya bireysel kullanıcıların müşteri ilişkilerini (CRM) kolayca yönetmesi için bir başlangıç noktası olarak tasarlanmıştır.

Proje şu anda geliştirme ve test aşamasındadır.

![Giriş Ekranı](https://github.com/user-attachments/assets/47e3015d-e417-4eae-ab10-b9194f5e3b14)
![Ana Panel](https://github.com/user-attachments/assets/391fe442-54bb-4d33-b76f-a3e69a2971d7)

## 📝 Proje Hakkında

Bu uygulamanın temel amacı, kullanıcıların müşteri listelerini oluşturmasını, yönetmesini ve bu listeye kolayca e-posta pazarlaması yapabilmesini sağlamaktır. Projenin genel tasarımına odaklanılmış olup, backend ve frontend yapısı kendi ihtiyaçlarınıza göre kolayca kişiselleştirilebilir ve geliştirilebilir durumdadır.

## ✨ Özellikler

- **Müşteri Yönetimi:** Müşterilerinizi ekleyin, listeleyin ve bilgilerini güncelleyin.
- **E-posta Gönderimi:** Tek bir müşteriye veya tüm müşteri listenize aynı anda e-posta gönderin.
- **Güvenli Oturum Yönetimi:** `express-session` ile güvenli ve HTTPOnly cookie'ler kullanılarak oturum yönetimi sağlanmıştır.
- **Şifre Güvenliği:** Kullanıcı şifreleri `bcrypt` kütüphanesi ile hashlenerek veritabanında saklanır.

## 🛠️ Kullanılan Teknolojiler

- **Backend:** Node.js, Express.js
- **Veritabanı:** MySQL
- **Güvenlik:** bcrypt, express-session
- **Frontend:** HTML, CSS, JavaScript (Kişiselleştirmeye açık)

## 🚀 Kurulum ve Başlatma

Uygulamayı yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler

- [Node.js](https://nodejs.org/en/) (ve npm)
- [MySQL](https://www.mysql.com/) ve [MySQL Workbench](https://www.mysql.com/products/workbench/) (veya başka bir veritabanı yönetim aracı)

### Kurulum Adımları

1.  **Projeyi klonlayın:**
    ```bash
    git clone https://github.com/EmirhanKmen/PikselPosta.git
    cd piksel-posta
    ```
    *Not: `senin-kullanici-adin/piksel-posta` kısmını kendi GitHub bilgilerinizle güncellemeyi unutmayın.*

2.  **Gerekli Node.js paketlerini yükleyin:**
    ```bash
    npm install
    ```

3.  **Veritabanını kurun:**
    - MySQL Workbench veya tercih ettiğiniz bir MySQL istemcisini açın.
    - Proje dosyaları içinde bulunan `müşteridatabase.sql` dosyasını içe aktararak (import) veritabanını ve gerekli tabloları oluşturun.

4.  **Veritabanı bağlantı ayarlarını yapın:**
    - Proje dosyalarınızda veritabanı bağlantı bilgilerinin bulunduğu dosyayı (örneğin `app.js` veya `db.js`) açın.
    - Kendi MySQL kullanıcı adı, şifre ve veritabanı adı bilgilerinizi girin.

### Uygulamayı Başlatma

Tüm kurulum adımları tamamlandıktan sonra, terminalde aşağıdaki komutu çalıştırın:

```bash
node app.js
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışmaya başlayacaktır. (Port numarasını `app.js` dosyasından kontrol edebilir veya değiştirebilirsiniz.)

## ⚠️ Güvenlik Notları ve Geliştirme Önerileri

Bu proje, bir öğrenme ve test projesi olarak geliştirilmiştir. Bu nedenle şu anki haliyle yalnızca **localhost** üzerinde güvenli bir şekilde çalışması hedeflenmiştir.

- **Mevcut Güvenlik Önlemleri:**
  - **Şifre Hashleme:** `bcrypt` kullanılarak şifreler veritabanına kaydedilmeden önce güvenli bir şekilde hashlenir.
  - **Güvenli Oturum Cookie'leri:** Session cookie'lerinin client-side JavaScript tarafından erişilmesi engellenmiştir (`httpOnly: true`).

- **Geliştirme Önerileri:**
  - Projeyi canlı bir sunucuda yayınlamadan önce **HTTPS** (SSL sertifikası) kullanmanız şiddetle tavsiye edilir.
  - Gelen verilere karşı **sunucu tarafı doğrulama (validation)** eklenmelidir.
  - **SQL Injection**, **XSS** gibi zafiyetlere karşı ek güvenlik katmanları (örneğin, ORM kullanımı veya sorguların parametrelendirilmesi) güçlendirilebilir.
  - E-posta gönderimi için daha profesyonel bir servis (SendGrid, Mailgun vb.) entegrasyonu yapılabilir.

## 🤝 Katkıda Bulunma

Bu proje geliştirmeye açıktır. Katkıda bulunmak isterseniz:

1.  Projeyi Fork'layın.
2.  Yeni bir Feature Branch oluşturun (`git checkout -b yenilik/harika-bir-ozellik`).
3.  Değişikliklerinizi Commit'leyin (`git commit -m 'Yeni ve harika bir özellik eklendi'`).
4.  Branch'inizi Push'layın (`git push origin yenilik/harika-bir-ozellik`).
5.  Bir Pull Request açın.

---
*Bu README dosyası, projenin daha anlaşılır ve kullanılabilir olması için düzenlenmiştir.*
