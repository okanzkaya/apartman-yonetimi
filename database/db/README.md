# 🏢 Apartman ve Site Yönetim Sistemi Veritabanı

Bu proje, bir apartman veya site yönetiminin günlük operasyonlarını (finans, iletişim, arıza takibi, ortak alan rezervasyonu ve güvenlik) dijital ortamda takip edebilmesi için tasarlanmış bir **MS SQL Server** veritabanı şemasıdır.

## 🚀 Genel Bakış
Sistem; daire sakinleri, yöneticiler ve personel arasındaki etkileşimi yönetir. Finansal kayıtların (aidat/gider) tutulmasından, ortak alanların (havuz, spor salonu vb.) kullanımına kadar geniş bir yelpazeyi kapsar.

## 🛠️ Veritabanı Yapısı ve Tablolar

Veritabanı temel olarak aşağıdaki ana modüllerden oluşmaktadır:

### 1. Temel Yapı
* **Daireler:** Blok, kapı numarası, kat ve daire tipi bilgilerini tutar.
* **Kullanicilar:** Sakinler, yöneticiler ve personelin bilgilerini içerir. Daireler ile ilişkilidir.

### 2. Finans Yönetimi
* **Aidatlar:** Daire bazlı aylık aidat tahakkuklarını ve ödeme durumlarını (Ödendi/Ödenmedi) takip eder.
* **Giderler:** Site geneli yapılan harcamaları (elektrik faturası, bakım vb.) kayıt altına alır.

### 3. İletişim ve Teknik Takip
* **Duyurular:** Yöneticilerin sakinlere yönelik yayınladığı genel bilgilendirmeler.
* **Mesajlar:** Kullanıcılar arası veya yönetime yönelik direkt mesajlaşma trafiği.
* **ArizaBildirimleri:** Sakinlerin bildirdiği teknik sorunların kategorize edilmesi ve çözüm süreçlerinin takibi.

### 4. Tesis ve Otopark Yönetimi
* **OrtakAlanlar:** Havuz, spor salonu, toplantı odası gibi alanların kapasite ve çalışma saatlerini tanımlar.
* **Rezervasyonlar:** Ortak alanların kullanım randevularını yönetir; çakışma kontrolü mantığına sahiptir.
* **Araclar:** Dairelere bağlı araç plakalarını ve marka/model bilgilerini tutar.

### 5. Güvenlik ve Kayıt
* **GirisCikisKayitlari:** Kullanıcıların ana kapı veya otopark gibi noktalardan geçişlerini zaman damgasıyla loglar.

---

## ⚙️ Saklı Yordamlar (Stored Procedures)

Veritabanı üzerinde iş mantığını otomatize eden kritik prosedürler:

| Prosedür Adı | İşlev |
| :--- | :--- |
| `sp_AidatOde` | Belirli bir aidatın ödeme durumunu 'Ödendi' olarak günceller ve ödeme tarihini kaydeder. |
| `sp_AktifArizalariListele` | Durumu 'Çözüldü' olmayan tüm arızaları, bildiren kişi ve daire bilgisiyle birlikte listeler. |
| `sp_RezervasyonEkle` | Belirtilen saat aralığında başka bir rezervasyon olup olmadığını kontrol eder. Çakışma yoksa yeni rezervasyonu onaylı olarak ekler. |

---

## 🚦 Kurulum Adımları

1.  **Tabloları Oluşturun:** `create database.txt` dosyasındaki SQL komutlarını çalıştırarak `ApartmanYonetimi` veritabanını ve tablo şemalarını kurun.
2.  **Prosedürleri Yükleyin:** `sp_AidatOde.txt`, `sp_AktifArizalariListele.txt` ve `sp_RezervasyonEkle.txt` dosyalarındaki `CREATE PROCEDURE` bloklarını SQL Server üzerinde çalıştırın.
3.  **Örnek Veri Yükleme:** `insert into.txt` dosyasını kullanarak sisteme test verilerini (daireler, kullanıcılar, örnek aidatlar) ekleyin.
4.  **Test Etme:** `exec komutları.txt` dosyasındaki örnekleri çalıştırarak iş akışlarını (aidat ödeme, rezervasyon çakışma kontrolü vb.) test edebilirsiniz.

---

## 🔒 Güvenlik ve Geliştirme Notları
* `Kullanicilar` tablosundaki `SifreHash` alanı şifrelerin güvenli saklanması içindir. Uygulama tarafında (C#, Java, Python vb.) şifrelerin hashlenerek kaydedilmesi önerilir.
* İlişkisel bütünlük `FOREIGN KEY` kısıtlamaları ile sağlanmıştır.
