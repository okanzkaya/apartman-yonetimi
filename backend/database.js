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
    SifreHash: { type: DataTypes.STRING, allowNull: false },
    AdSoyad: { type: DataTypes.STRING(100), allowNull: false },
    BlokDaire: { type: DataTypes.STRING(20) },
    Telefon: { type: DataTypes.STRING(15) },
    Rol: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, 
    AktifMi: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { tableName: 'Kullanicilar', timestamps: false });

// 2. Finans Hareketleri Tablosu
const FinansHareketi = sequelize.define('FinansHareketi', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    KullaniciId: { type: DataTypes.INTEGER, allowNull: true },
    Tarih: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    Donem: { type: DataTypes.STRING(50), allowNull: false },
    Aciklama: { type: DataTypes.STRING(255), allowNull: false },
    Tip: { type: DataTypes.INTEGER, allowNull: false }, 
    Tutar: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    Durum: { type: DataTypes.STRING(50) } 
}, { tableName: 'FinansHareketleri', timestamps: false });

// 3. Talepler Tablosu
const Talep = sequelize.define('Talep', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    KullaniciId: { type: DataTypes.INTEGER, allowNull: false },
    Tarih: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    HamMetin: { type: DataTypes.TEXT, allowNull: false },
    Kategori: { type: DataTypes.STRING(100) },
    DuyguDurumu: { type: DataTypes.STRING(50) },
    Aciliyet: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, 
    Durum: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 } 
}, { tableName: 'Talepler', timestamps: false });

// 4. Rezervasyonlar Tablosu
const Rezervasyon = sequelize.define('Rezervasyon', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    KullaniciId: { type: DataTypes.INTEGER, allowNull: false },
    TesisAdi: { type: DataTypes.STRING(100), allowNull: false },
    Tarih: { type: DataTypes.DATE, allowNull: false },
    SaatAraligi: { type: DataTypes.STRING(50), allowNull: false },
    Durum: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 } 
}, { tableName: 'Rezervasyonlar', timestamps: false });

// 5. Planlı Bakımlar Tablosu (YENİ)
const PlanliBakim = sequelize.define('PlanliBakim', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Tur: { type: DataTypes.STRING(150), allowNull: false },
    Tarih: { type: DataTypes.DATE, allowNull: false },
    Maliyet: { type: DataTypes.DECIMAL(18,2) },
    Periyot: { type: DataTypes.STRING(50) },
    Durum: { type: DataTypes.STRING(50), defaultValue: 'Planlandı' }
}, { tableName: 'PlanliBakimlar', timestamps: false });

// 6. Tedarikçiler / Ustalar Tablosu (YENİ)
const Tedarikci = sequelize.define('Tedarikci', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Isim: { type: DataTypes.STRING(150), allowNull: false },
    Alan: { type: DataTypes.STRING(100), allowNull: false },
    Tel: { type: DataTypes.STRING(20) }
}, { tableName: 'Tedarikciler', timestamps: false });

// 7. Dokümanlar Tablosu (YENİ)
const Dokuman = sequelize.define('Dokuman', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Isim: { type: DataTypes.STRING(150), allowNull: false },
    YuklemeTarihi: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    ErisimTipi: { type: DataTypes.STRING(50), defaultValue: 'Herkese Açık' }
}, { tableName: 'Dokumanlar', timestamps: false });

// İlişkiler
Kullanici.hasMany(FinansHareketi, { foreignKey: 'KullaniciId' });
FinansHareketi.belongsTo(Kullanici, { foreignKey: 'KullaniciId' });

Kullanici.hasMany(Talep, { foreignKey: 'KullaniciId' });
Talep.belongsTo(Kullanici, { foreignKey: 'KullaniciId' });

Kullanici.hasMany(Rezervasyon, { foreignKey: 'KullaniciId' });
Rezervasyon.belongsTo(Kullanici, { foreignKey: 'KullaniciId' });

// Veritabanını Başlat
const initDB = async () => {
    await sequelize.sync({ force: true });
    
    await Kullanici.create({ KullaniciAdi: 'admin', SifreHash: '123456', AdSoyad: 'Sistem Yöneticisi', Rol: 1, AktifMi: true });
    const sakin = await Kullanici.create({ KullaniciAdi: 'sakin', SifreHash: '123456', AdSoyad: 'Tuğba Yılmaz', BlokDaire: 'A Blok D:12', Telefon: '05551234567', Rol: 0, AktifMi: true });

    await FinansHareketi.create({ KullaniciId: sakin.Id, Tarih: new Date(), Donem: 'Nisan 2026', Aciklama: 'Nisan Ayı Aidat Ödemesi', Tip: 0, Tutar: 1500.00, Durum: 'Ödenmedi' });
    
    await PlanliBakim.create({ Tur: 'Asansör Bakımı', Tarih: new Date('2026-05-10'), Maliyet: 4500, Periyot: '1 Ay', Durum: 'Planlandı' });
    await Tedarikci.create({ Isim: 'Yılmaz Elektrik', Alan: 'Elektrik', Tel: '0533 111 2233' });
    await Dokuman.create({ Isim: 'Site Yaşam Kuralları ve Yönetmelik', ErisimTipi: 'Herkese Açık' });

    console.log("Veritabanı oluşturuldu, yeni tablolar ve test verileri eklendi.");
};

module.exports = { sequelize, Kullanici, FinansHareketi, Talep, Rezervasyon, PlanliBakim, Tedarikci, Dokuman, initDB, Op };