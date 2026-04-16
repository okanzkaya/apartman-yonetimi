USE ApartmanYonetimi;
GO

-- 1. DAİRELER (Önce daireler oluşturulmalı)
INSERT INTO Daireler (Blok, KapiNo, Kat, BosMu, DaireTipi) VALUES
('A', 1, 1, 0, '3+1'), -- Dolu
('A', 2, 1, 0, '2+1'), -- Dolu
('B', 15, 4, 1, '3+1'); -- Boş daire örneği
GO

-- 2. KULLANICILAR (Dairelere atanmış sakinler ve dairesi olmayan personel)
-- SifreHash kısımlarına backend'in beklediği formatta (örneğin SHA256) dummy veriler girilmiştir.
INSERT INTO Kullanicilar (DaireID, Ad, Soyad, TCNo, Telefon, Email, SifreHash, Rol, Durum) VALUES
(1, 'Ahmet', 'Yılmaz', '12345678901', '05551112233', 'ahmet@site.com', 'hash_ornek_123', 'Yonetici', 1),
(2, 'Ayşe', 'Kaya', '98765432109', '05329998877', 'ayse@site.com', 'hash_ornek_456', 'Sakin', 1),
(NULL, 'Mehmet', 'Çelik', '55544433322', '05057776655', 'guvenlik@site.com', 'hash_ornek_789', 'Personel', 1);
GO

-- 3. DUYURULAR (Yönetici olan Ahmet - KullaniciID 1 tarafından eklenmiş)
INSERT INTO Duyurular (EkleyenKullaniciID, Baslik, Icerik, OlusturmaTarihi, BitisTarihi, KritikMi) VALUES
(1, 'Asansör Bakımı', 'A Blok asansörü 15 Nisan saat 10:00 - 12:00 arası bakıma alınacaktır.', GETDATE(), '2026-04-16', 1),
(1, 'Nisan Ayı Aidatları', 'Lütfen Nisan ayı aidatlarını ayın 20''sine kadar yatırmayı unutmayınız.', GETDATE(), '2026-04-21', 0);
GO

-- 4. ARIZA BİLDİRİMLERİ (Sakin olan Ayşe - KullaniciID 2 tarafından eklenmiş)
INSERT INTO ArizaBildirimleri (BildirenKullaniciID, Kategori, Baslik, Aciklama, BildirimTarihi, Durum, CozumTarihi, YoneticiNotu) VALUES
(2, 'Su', 'Mutfak Borusu Sızıntısı', 'Mutfak lavabosunun altındaki borudan su damlıyor.', GETDATE(), 'Beklemede', NULL, NULL),
(2, 'Elektrik', 'Koridor Lambası', 'Kat 1 koridor lambası patlamış.', DATEADD(day, -2, GETDATE()), 'Çözüldü', GETDATE(), 'Elektrikçi çağrıldı ve ampul yenisiyle değiştirildi.');
GO

-- 5. AİDATLAR (Dolu olan 1 ve 2 numaralı DaireID'ler için)
INSERT INTO Aidatlar (DaireID, DonemAy, DonemYil, Tutar, SonOdemeTarihi, OdemeDurumu, OdemeTarihi) VALUES
(1, 4, 2026, 750.00, '2026-04-20', 1, '2026-04-10'), -- Ödenmiş (Ahmet ödemiş)
(2, 4, 2026, 750.00, '2026-04-20', 0, NULL),        -- Ödenmemiş (Ayşe henüz ödememiş)
(1, 3, 2026, 750.00, '2026-03-20', 1, '2026-03-15'); -- Geçmiş ayın ödenmiş aidatı
GO

-- 6. GİRİŞ ÇIKIŞ KAYITLARI (Güvenlik sisteminden düşen loglar)
INSERT INTO GirisCikisKayitlari (KullaniciID, IslemTipi, IslemZamani, GecisNoktasi) VALUES
(2, 'Giriş', DATEADD(hour, -5, GETDATE()), 'Ana Kapı Turnike'),
(2, 'Çıkış', DATEADD(hour, -1, GETDATE()), 'Otopark Çıkışı'),
(3, 'Giriş', DATEADD(hour, -8, GETDATE()), 'Personel Girişi');
GO