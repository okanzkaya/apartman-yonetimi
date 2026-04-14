-- 1. Veritabanını Oluştur
CREATE DATABASE ApartmanYonetimi;
GO

-- 2. Veritabanını Kullan
USE ApartmanYonetimi;
GO

-- 3. Daireler Tablosu (Sistemin temeli)
CREATE TABLE Daireler (
    DaireID INT IDENTITY(1,1) PRIMARY KEY,
    Blok NVARCHAR(10) NOT NULL,
    KapiNo INT NOT NULL,
    Kat INT NOT NULL,
    BosMu BIT DEFAULT 0, -- 0: Dolu, 1: Boş
    DaireTipi NVARCHAR(20) -- 2+1, 3+1 vb.
);
GO

-- 4. Kullanıcılar/Sakinler Tablosu
CREATE TABLE Kullanicilar (
    KullaniciID INT IDENTITY(1,1) PRIMARY KEY,
    DaireID INT NULL, -- Yönetici veya personelin dairesi olmayabilir
    Ad NVARCHAR(50) NOT NULL,
    Soyad NVARCHAR(50) NOT NULL,
    TCNo CHAR(11) UNIQUE,
    Telefon NVARCHAR(15),
    Email NVARCHAR(100) UNIQUE,
    SifreHash NVARCHAR(256) NOT NULL,
    Rol NVARCHAR(20) DEFAULT 'Sakin', -- 'Yonetici', 'Sakin', 'Personel'
    Durum BIT DEFAULT 1, -- 1: Aktif, 0: Pasif
    CONSTRAINT FK_Kullanici_Daire FOREIGN KEY (DaireID) REFERENCES Daireler(DaireID)
);
GO

-- 5. Duyuru Ekranı Tablosu
CREATE TABLE Duyurular (
    DuyuruID INT IDENTITY(1,1) PRIMARY KEY,
    EkleyenKullaniciID INT NOT NULL,
    Baslik NVARCHAR(100) NOT NULL,
    Icerik NVARCHAR(MAX) NOT NULL,
    OlusturmaTarihi DATETIME DEFAULT GETDATE(),
    BitisTarihi DATETIME NULL,
    KritikMi BIT DEFAULT 0,
    CONSTRAINT FK_Duyuru_Ekleyen FOREIGN KEY (EkleyenKullaniciID) REFERENCES Kullanicilar(KullaniciID)
);
GO

-- 6. Arıza Bildirimi ve Takibi Tablosu
CREATE TABLE ArizaBildirimleri (
    ArizaID INT IDENTITY(1,1) PRIMARY KEY,
    BildirenKullaniciID INT NOT NULL,
    Kategori NVARCHAR(50), -- Asansör, Elektrik, Su, Ortak Alan vb.
    Baslik NVARCHAR(100) NOT NULL,
    Aciklama NVARCHAR(MAX) NOT NULL,
    BildirimTarihi DATETIME DEFAULT GETDATE(),
    Durum NVARCHAR(30) DEFAULT 'Beklemede', -- 'Beklemede', 'İşlemde', 'Çözüldü'
    CozumTarihi DATETIME NULL,
    YoneticiNotu NVARCHAR(MAX) NULL,
    CONSTRAINT FK_Ariza_Bildiren FOREIGN KEY (BildirenKullaniciID) REFERENCES Kullanicilar(KullaniciID)
);
GO

-- 7. Aidat Ödeme Takibi Tablosu
CREATE TABLE Aidatlar (
    AidatID INT IDENTITY(1,1) PRIMARY KEY,
    DaireID INT NOT NULL,
    DonemAy INT NOT NULL,
    DonemYil INT NOT NULL,
    Tutar DECIMAL(18,2) NOT NULL,
    SonOdemeTarihi DATE NOT NULL,
    OdemeDurumu BIT DEFAULT 0, -- 0: Ödenmedi, 1: Ödendi
    OdemeTarihi DATETIME NULL,
    CONSTRAINT FK_Aidat_Daire FOREIGN KEY (DaireID) REFERENCES Daireler(DaireID)
);
GO

-- 8. Giriş - Çıkış Kayıt Bilgileri Tablosu
CREATE TABLE GirisCikisKayitlari (
    KayitID INT IDENTITY(1,1) PRIMARY KEY,
    KullaniciID INT NOT NULL,
    IslemTipi NVARCHAR(10) NOT NULL, -- 'Giriş' veya 'Çıkış'
    IslemZamani DATETIME DEFAULT GETDATE(),
    GecisNoktasi NVARCHAR(50), -- 'Ana Kapı', 'Otopark' vb.
    CONSTRAINT FK_GirisCikis_Kullanici FOREIGN KEY (KullaniciID) REFERENCES Kullanicilar(KullaniciID)
);
GO