const { Sequelize, DataTypes, Op } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './elityonetim.sqlite',
    logging: false
});

// 1. Kullanıcılar Tablosu
const Kullanici = sequelize.define('Kullanici', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    KullaniciAdi: { type: DataTypes.STRING(50), allowNull: false },
    SifreHash: { type: DataTypes.STRING, allowNull: false }, // Şifre düz metin
    AdSoyad: { type: DataTypes.STRING(100), allowNull: false },
    BlokDaire: { type: DataTypes.STRING(20) },
    Telefon: { type: DataTypes.STRING(15) },
    Rol: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, // 0: Sakin, 1: Yonetici
    AktifMi: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { tableName: 'Kullanicilar', timestamps: false });

// 2. Finans Hareketleri Tablosu
const FinansHareketi = sequelize.define('FinansHareketi', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    KullaniciId: { type: DataTypes.INTEGER, allowNull: true },
    Tarih: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    Donem: { type: DataTypes.STRING(50), allowNull: false },
    Aciklama: { type: DataTypes.STRING(255), allowNull: false },
    Tip: { type: DataTypes.INTEGER, allowNull: false }, // 0: Gelir, 1: Gider
    Tutar: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    Durum: { type: DataTypes.STRING(50) } // 'Ödendi', 'Ödenmedi'
}, { tableName: 'FinansHareketleri', timestamps: false });

// 3. Talepler Tablosu
const Talep = sequelize.define('Talep', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    KullaniciId: { type: DataTypes.INTEGER, allowNull: false },
    Tarih: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    HamMetin: { type: DataTypes.TEXT, allowNull: false },
    Kategori: { type: DataTypes.STRING(100) },
    DuyguDurumu: { type: DataTypes.STRING(50) },
    Aciliyet: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, // 0: Düşük, 1: Orta, 2: Yüksek
    Durum: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 } // 0: İnceleniyor, 1: İşleme Alındı, 2: Çözüldü
}, { tableName: 'Talepler', timestamps: false });

// 4. Rezervasyonlar Tablosu
const Rezervasyon = sequelize.define('Rezervasyon', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    KullaniciId: { type: DataTypes.INTEGER, allowNull: false },
    TesisAdi: { type: DataTypes.STRING(100), allowNull: false },
    Tarih: { type: DataTypes.DATE, allowNull: false },
    SaatAraligi: { type: DataTypes.STRING(50), allowNull: false },
    Durum: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 } // 0: Bekliyor, 1: Onaylandı, 2: Reddedildi
}, { tableName: 'Rezervasyonlar', timestamps: false });

// İlişkiler (Foreign Keys)
Kullanici.hasMany(FinansHareketi, { foreignKey: 'KullaniciId' });
FinansHareketi.belongsTo(Kullanici, { foreignKey: 'KullaniciId' });

Kullanici.hasMany(Talep, { foreignKey: 'KullaniciId' });
Talep.belongsTo(Kullanici, { foreignKey: 'KullaniciId' });

Kullanici.hasMany(Rezervasyon, { foreignKey: 'KullaniciId' });
Rezervasyon.belongsTo(Kullanici, { foreignKey: 'KullaniciId' });

// Veritabanını Başlat ve Eski SQL Scriptindeki Verileri Ekle
const initDB = async () => {
    await sequelize.sync({ force: true });
    
    await Kullanici.create({ KullaniciAdi: 'admin', SifreHash: '123456', AdSoyad: 'Sistem Yöneticisi', Rol: 1, AktifMi: true });
    const sakin = await Kullanici.create({ KullaniciAdi: 'sakin', SifreHash: '123456', AdSoyad: 'Tuğba Yılmaz', BlokDaire: 'A Blok D:12', Telefon: '05551234567', Rol: 0, AktifMi: true });

    await FinansHareketi.create({ KullaniciId: sakin.Id, Tarih: new Date(), Donem: 'Nisan 2026', Aciklama: 'Nisan Ayı Aidat Ödemesi', Tip: 0, Tutar: 1500.00, Durum: 'Ödenmedi' });
    
    console.log("Veritabanı eski SQL şemasına tam uyumlu olarak oluşturuldu.");
};

module.exports = { sequelize, Kullanici, FinansHareketi, Talep, Rezervasyon, initDB, Op };