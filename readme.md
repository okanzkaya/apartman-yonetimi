# 🏢 Apartman Yönetim Sistemi - Web Aplikasyonu

Bu proje, apartman veya site yönetim süreçlerini dijitalleştirerek yöneticiler ve sakinler arasındaki iletişimi, finansal takibi ve operasyonel işleri tek bir merkezden yönetmeyi sağlayan web tabanlı bir otomasyondur.

## 🌟 Projenin Temel Özellikleri (Ne İşe Yarar?)

Sistem, "Yönetici" ve "Sakin" olmak üzere iki farklı kullanıcı tipiyle çalışır ve şu temel işlevleri sunar:
* **Kullanıcı ve Apartman Oluşturma:** Sisteme yeni apartman, daire ve sakin/yönetici kayıtlarının güvenli bir şekilde yapılması.
* **Duyuru Yayınlama Sistemi:** Yöneticinin tüm apartman sakinlerine tarihsel sırayla duyurular (toplantı, su kesintisi vb.) iletebilmesi.
* **Dinamik Aidat Hesaplama:** Sabit aidatların ve ekstra ortak giderlerin (asansör bakımı, temizlik vb.) daire sayısına bölünerek otomatik borçlandırılması.
* **Gelir-Gider Sistemi:** Apartman kasasına giren aidatların ve çıkan masrafların şeffaf bir şekilde takip edilmesi.
* **Arıza Bildirim Sistemi:** Sakinlerin karşılaştıkları sorunları (örneğin "Asansör arızası") anlık olarak yönetime iletebilmesi ve sürecin durumunu (Beklemede/Çözüldü) takip edebilmesi.

---

## 👥 Ekip ve Rol Dağılımı

Projemiz belirlenen görev dağılımına göre aşağıdaki rollerle yürütülmektedir:
* **1 Proje Yöneticisi (PM):** GitHub Issues takibi, projenin zamanında ilerlemesi ve ekibin koordinasyonu.
* **1 Veritabanı Yöneticisi (DB):** Veritabanı mimarisinin tasarımı, tabloların oluşturulması ve SQL scriptlerinin yazılması.
* **3 Backend Geliştirici:** Veritabanı bağlantıları, API uç noktalarının (Endpoint) yazılması ve sistemin matematiksel/iş mantığı.
* **3 Frontend Geliştirici:** Tasarımların koda dökülmesi (HTML/CSS/JS/Framework), arayüzün geliştirilmesi ve API'lerin ekrana bağlanması.
* **2 Tasarımcı (UI/UX):** Uygulamanın görsel tasarımı, renk paletleri ve sayfa prototiplerinin (Figma) hazırlanması.

---

## 📅 Adım Adım Geliştirme Planı (Kim, Ne Zaman, Neyi Bitirecek?)

Projenin kilitlenmeden ilerlemesi için aşağıdaki aşamalar sırasıyla tamamlanacaktır:

### Aşama 1: Temel Atma (Tasarım, Veritabanı ve Planlama)
* **PM:** GitHub üzerinde projeyi başlatır, tüm görevleri "Issues" kısmına ekler.
* **Tasarımcılar (2):** Logoyu, renkleri belirler; Login ekranı, Yönetici Paneli ve Sakin Paneli için Figma tasarımlarını çizer ve `/design` klasörüne linkler.
* **Veritabanı Yöneticisi (1):** Tüm özellikleri karşılayacak SQL Master Script'ini yazar, tabloları oluşturur ve `/database` klasörüne yükler.

### Aşama 2: Arka Plan ve Altyapı (Backend)
* *Tasarım ve Veritabanı tamamlandıktan sonra başlar.*
* **Backend Geliştiriciler (3):** Klasör yapısını kurar. Apartman/Kullanıcı kayıt işlemlerini, dinamik aidat hesaplama mantığını ve diğer tüm özellikleri API (servis) olarak yazar ve test eder. Kodları `/backend` klasörüne yükler.

### Aşama 3: Arayüz ve Entegrasyon (Frontend)
* *Tasarım ve Backend servisleri belli olduktan sonra hızlanır.*
* **Frontend Geliştiriciler (3):** Figma'daki tasarımları koda (React/Vue/HTML vb.) döker. Backend ekibinin yazdığı servisleri (örneğin: `getDuyurular`) butonlara ve sayfalara bağlar. Kodları `/frontend` klasörüne yükler.

---

## 📁 Klasör Yapımız

Çalışırken kimse başkasının alanına müdahale etmemelidir:
* **/design:** Sadece tasarım ekibi kullanır.
* **/database:** Veritabanı kurulum scriptleri (`.sql`) buradadır.
* **/backend:** Sunucu, API ve iş mantığı kodları buradadır.
* **/frontend:** Kullanıcı arayüzü kodları buradadır.

---

## 🚀 Kodu GitHub'a Gönderme Sırası (Ezberlenecek!)

Tüm geliştirmeler **tek bir branch (`main`)** üzerinden yürütülmektedir. Kodu GitHub'a yüklemeden önce terminalde **sırasıyla** şu komutlar çalıştırılmalıdır:

1. `git add .` 
2. `git commit -m "feat: dinamik aidat hesaplama eklendi"` *(Anlamsız mesajlar yasaktır!)*
3. `git pull origin main` **<-- (EN ÖNEMLİ ADIM:** Başkasının yazdığı kodla kendi bilgisayarındaki güncellemeyi harmanla.**)**
4. `git push origin main` 

---

## ⚠️ Haberleşme ve Çakışmaları Önleme Kuralları

1. **GitHub Issues ile Görev Kapma:** Mesajlaşma gruplarındaki bilgi kirliliğini önlemek için WhatsApp yerine GitHub kullanıyoruz. Bir kod/tasarım üzerinde çalışmaya başlamadan önce GitHub "Issues" sekmesinden o görevi bulun ve **kendinize atayın (Assignees)**. Diğerleri orada çalıştığınızı görüp o dosyaya dokunmayacaktır.
2. **Çapraz Dosya Değişikliği Yasaktır:** Kendi klasörünüz (`/frontend`, `/backend` vb.) dışındaki dosyalara müdahale etmeyin. Ortak bir değişiklik gerekiyorsa ilgili ekibe Issue açın.
3. **Her Oturumda Pull Yapın:** Bilgisayarı açıp projeye her oturduğunuzda, kod yazmaya başlamadan önce mutlaka `git pull origin main` yaparak en güncel projeyi indirin.
