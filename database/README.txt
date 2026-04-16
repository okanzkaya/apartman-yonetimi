# 🏢 Apartman Yönetim Sistemi - Backend Geliştirici Kılavuzu

Bu depo (repository), Apartman Yönetim Sistemi web uygulamasının arka uç (backend) servislerini ve veritabanı mimarisini içerir. Sistem, daire ve sakin takibini, aidat yönetimini, arıza/bakım süreçlerini ve giriş-çıkış loglamalarını merkezi bir yapıda yönetmek üzere tasarlanmıştır.

## 🛠 Teknoloji Yığını & Gereksinimler

* **Veritabanı:** Microsoft SQL Server (MSSQL)
* **Önerilen ORM:** Entity Framework Core veya Dapper (Veri erişim katmanı için)
* **Mimari Yaklaşım:** İlişkisel Veritabanı Yönetim Sistemi (RDBMS)

## 📦 Veritabanı Kurulum Süreci

Veritabanını yerel ortamınızda (local environment) ayağa kaldırmak için SQL scriptlerini aşağıdaki sırayla çalıştırınız:

1. **`01_Schema.sql`**: Veritabanı ve tablo yapılarını oluşturur (Daireler, Kullanıcılar, Duyurular, Aidatlar vb.).
2. **`02_StoredProcedures.sql`**: İş kurallarını veritabanı seviyesinde yöneten saklı yordamları (SP) oluşturur.
3. **`03_MockData.sql`**: Geliştirme sürecinde API'leri test edebilmeniz için tabloları örnek verilerle doldurur (Bağımlılık sırasına göre).

## 🗄️ Temel Veritabanı Tabloları ve Mantığı

* **Daireler:** Sistemin temel bağımsız nesnesidir. Aidat borçlandırmaları kişilere değil, dairelere (`DaireID`) yapılır.
* **Kullanıcılar:** Apartman sakinleri, yöneticiler ve personeli içerir. Daireler ile `1:N` ilişkisi vardır.
* **Aidatlar:** Her ay oluşturulan borç kayıtlarıdır.
* **ArizaBildirimleri:** Sakinler tarafından açılan iş talepleridir.
* **Duyurular & GirisCikisKayitlari:** Bilgilendirme ve güvenlik loglarını tutar.

## ⚙️ Kullanıma Hazır Stored Procedure'ler (SP)

Performansı artırmak ve veri bütünlüğünü sağlamak adına bazı kritik işlemler veritabanı seviyesinde (C# tarafını yormadan) çözülmüştür. API endpoint'lerinizden doğrudan bu SP'leri tetikleyebilirsiniz:

1. **`SP_TopluAidatOlustur(@DonemAy, @DonemYil, @AidatTutari, @SonOdemeTarihi)`**
   * *Kullanım:* Belirtilen dönem için sadece "dolu" (`BosMu = 0`) olan dairelere otomatik aidat yansıtır. Çift kayıt atılmasını önleyen güvenlik katmanı içerir.

2. **`SP_ArizaCozulduIsaretle(@ArizaID, @YoneticiNotu)`**
   * *Kullanım:* Arıza durumunu günceller, çözüm tarihini anlık olarak sisteme basar ve varsa yönetici notunu kaydeder.

3. **`SP_DaireBorcSorgula(@DaireID)`**
   * *Kullanım:* Dairenin geçmişe dönük ödenmemiş tüm aidatlarını toplar ve özet bir borç ekstresi döner. Kullanıcı arayüzündeki (UI) "Hesabım" sayfası için idealdir.

## ⚠️ Geliştirici Ekipler İçin Önemli Notlar

* **Şifre Güvenliği:** `Kullanicilar` tablosundaki `SifreHash` alanına kesinlikle düz metin (plain-text) şifre kaydedilmemelidir. Backend tarafında kimlik doğrulama işlemleri sırasında SHA-256 veya BCrypt gibi güvenli bir hashing algoritması kullanıldığından emin olun.
* **Soft Delete (Yumuşak Silme):** Veri kaybını ve log bütünlüğünün bozulmasını önlemek için sistemde doğrudan `DELETE` işlemi yapmak yerine `Kullanicilar` tablosundaki `Durum` (1/0) ve `Daireler` tablosundaki `BosMu` (0/1) bayraklarını (flag) güncelleyen bir yapı kurgulayın.
* **Tarih Formatları:** Veritabanındaki `DATETIME` alanları varsayılan olarak `GETDATE()` ile çalışır. Backend tarafında tarihsel işlemlerde zaman dilimi (Timezone) kaymalarına dikkat ediniz.
* **Aidat Bütünlüğü:** Aidat tablosu doğrudan `Daireler` tablosuna bağlıdır. Bir kullanıcı (`Kullanicilar`) sistemden pasife çekilse bile, dairesinin borç geçmişi sistemde kalmaya devam eder.
