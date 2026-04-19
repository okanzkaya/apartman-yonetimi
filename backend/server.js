const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { sequelize, Kullanici, FinansHareketi, Talep, Rezervasyon, initDB, Op } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'ElitYonetimSuperGizliAnahtar1234567890!!';

// Enum Haritalamaları (C# Enum .ToString() simülasyonu için)
const RolEnum = { 0: 'Sakin', 1: 'Yonetici' };
const FinansTipiEnum = { 0: 'Gelir', 1: 'Gider' };
const TalepAciliyetEnum = { 0: 'Dusuk', 1: 'Orta', 2: 'Yuksek' };
const TalepDurumuEnum = { 0: 'Inceleniyor', 1: 'IslemeAlindi', 2: 'Cozuldu' };
const RezervasyonDurumuEnum = { 0: 'Bekliyor', 1: 'Onaylandi', 2: 'Reddedildi' };

// --- MIDDLEWARES (Kimlik Doğrulama) ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ mesaj: "Token bulunamadı." });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(401).json({ mesaj: "Geçersiz veya süresi dolmuş token." });
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (req.user.Rol !== 1) return res.status(403).json({ mesaj: "Yönetici yetkisi gerekiyor." }); // 1: Yonetici
    next();
};

// --- AUTH UÇ NOKTALARI ---
app.post('/api/auth/login', async (req, res) => {
    const { KullaniciAdi, Sifre } = req.body;
    const user = await Kullanici.findOne({ where: { KullaniciAdi } });

    // Eski C# kodundaki gibi düz metin şifre kontrolü
    if (!user || user.SifreHash !== Sifre) {
        return res.status(401).json({ mesaj: 'Geçersiz kullanıcı adı veya şifre.' });
    }

    const token = jwt.sign({ id: user.Id, Rol: user.Rol }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
});

// --- FİNANS UÇ NOKTALARI ---
app.get('/api/finans/ekstre', authenticateToken, async (req, res) => {
    const hareketler = await FinansHareketi.findAll({
        where: { KullaniciId: req.user.id }, order: [['Tarih', 'DESC']]
    });
    res.json(hareketler.map(f => ({
        id: f.Id, donem: f.Donem, aciklama: f.Aciklama, tutar: f.Tutar, durum: f.Durum
    })));
});

app.post('/api/finans/ode', authenticateToken, async (req, res) => {
    const hareketId = req.body;
    const hareket = await FinansHareketi.findByPk(hareketId);
    
    if (!hareket || hareket.KullaniciId !== req.user.id) return res.status(404).json({ mesaj: "Fatura bulunamadı." });
    if (hareket.Durum === 'Ödendi') return res.status(400).json({ mesaj: "Bu borç zaten ödenmiş." });

    hareket.Durum = 'Ödendi';
    await hareket.save();
    res.json({ mesaj: "Ödeme işlemi başarıyla gerçekleşti." });
});

app.get('/api/finans/hepsini-getir', authenticateToken, requireAdmin, async (req, res) => {
    const hareketler = await FinansHareketi.findAll({ include: Kullanici, order: [['Tarih', 'DESC']] });
    res.json(hareketler.map(f => ({
        id: f.Id, 
        kullaniciAdi: f.Kullanici ? f.Kullanici.AdSoyad : "Ortak Gider",
        blokDaire: f.Kullanici ? f.Kullanici.BlokDaire : "-",
        tarih: new Date(f.Tarih).toLocaleDateString('tr-TR'),
        donem: f.Donem, aciklama: f.Aciklama, tip: FinansTipiEnum[f.Tip], tutar: f.Tutar, durum: f.Durum
    })));
});

// --- REZERVASYON UÇ NOKTALARI ---
app.post('/api/rezervasyon/yap', authenticateToken, async (req, res) => {
    const { TesisAdi, SaatAraligi, Tarih } = req.body;
    const rezerveTarihi = new Date(Tarih);

    const transaction = await sequelize.transaction();
    try {
        // Reddedildi (2) olmayanlar dolu sayılır
        const doluMu = await Rezervasyon.findOne({
            where: { TesisAdi, SaatAraligi, Durum: { [Op.ne]: 2 } },
            transaction
        });

        if (doluMu && new Date(doluMu.Tarih).toDateString() === rezerveTarihi.toDateString()) {
            await transaction.rollback();
            return res.status(400).json({ mesaj: "Seçtiğiniz tesis bu saat aralığında zaten dolu." });
        }

        await Rezervasyon.create({ KullaniciId: req.user.id, TesisAdi, Tarih: rezerveTarihi, SaatAraligi, Durum: 0 }, { transaction }); // 0: Bekliyor
        await transaction.commit();
        res.json({ mesaj: "Rezervasyon talebiniz başarıyla oluşturuldu." });
    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ mesaj: "Hata oluştu." });
    }
});

app.get('/api/rezervasyon/listele', authenticateToken, async (req, res) => {
    const rezervasyonlar = await Rezervasyon.findAll({ where: { KullaniciId: req.user.id }, order: [['Tarih', 'DESC']] });
    res.json(rezervasyonlar.map(r => ({
        tesisAdi: r.TesisAdi, tarih: new Date(r.Tarih).toLocaleDateString('tr-TR'), saatAraligi: r.SaatAraligi, durum: RezervasyonDurumuEnum[r.Durum]
    })));
});

app.get('/api/rezervasyon/hepsini-getir', authenticateToken, requireAdmin, async (req, res) => {
    const rezervasyonlar = await Rezervasyon.findAll({ include: Kullanici, order: [['Tarih', 'DESC']] });
    res.json(rezervasyonlar.map(r => ({
        id: r.Id, kullaniciAdi: r.Kullanici.AdSoyad, tesisAdi: r.TesisAdi, tarih: new Date(r.Tarih).toLocaleDateString('tr-TR'), saatAraligi: r.SaatAraligi, durum: RezervasyonDurumuEnum[r.Durum]
    })));
});

app.put('/api/rezervasyon/durum-guncelle/:id', authenticateToken, requireAdmin, async (req, res) => {
    await Rezervasyon.update({ Durum: req.body }, { where: { Id: req.params.id } });
    res.json({ mesaj: "Durum güncellendi." });
});

// --- TALEPLER UÇ NOKTALARI ---
app.post('/api/talepler/olustur', authenticateToken, async (req, res) => {
    const { Kategori, Aciklama } = req.body;
    let aciliyet = 0, duygu = 'Nötr'; // 0: Dusuk
    const text = Aciklama.toLowerCase();

    if (text.includes('acil') || text.includes('tehlike')) { aciliyet = 2; duygu = 'Endişeli'; } // 2: Yuksek
    else if (text.includes('lanet') || text.includes('yönetim')) { duygu = 'Kızgın'; }

    const yeniTalep = await Talep.create({ KullaniciId: req.user.id, Kategori, HamMetin: Aciklama, Aciliyet: aciliyet, DuyguDurumu: duygu, Durum: 0 }); // 0: Inceleniyor
    res.json({ mesaj: "Talebiniz iletildi.", talepId: yeniTalep.Id });
});

app.get('/api/talepler/hepsini-getir', authenticateToken, requireAdmin, async (req, res) => {
    const talepler = await Talep.findAll({ include: Kullanici, order: [['Tarih', 'DESC']] });
    res.json(talepler.map(t => ({
        id: t.Id, kullaniciAdi: t.Kullanici.AdSoyad, blokDaire: t.Kullanici.BlokDaire,
        tarih: new Date(t.Tarih).toLocaleString('tr-TR'), kategori: t.Kategori, aciliyet: TalepAciliyetEnum[t.Aciliyet], duyguDurumu: t.DuyguDurumu, durum: TalepDurumuEnum[t.Durum], hamMetin: t.HamMetin
    })));
});

app.put('/api/talepler/durum-guncelle/:id', authenticateToken, requireAdmin, async (req, res) => {
    await Talep.update({ Durum: req.body }, { where: { Id: req.params.id } });
    res.json({ mesaj: "Talep durumu güncellendi." });
});

// --- KULLANICI UÇ NOKTALARI ---
app.get('/api/kullanici/listele', authenticateToken, requireAdmin, async (req, res) => {
    const kullanicilar = await Kullanici.findAll({ where: { Rol: 0 } }); // 0: Sakin
    res.json(kullanicilar.map(k => ({
        id: k.Id, kullaniciAdi: k.KullaniciAdi, adSoyad: k.AdSoyad, blokDaire: k.BlokDaire, telefon: k.Telefon, aktifMi: k.AktifMi
    })));
});

// Sunucuyu Başlat
const PORT = 5000;
app.listen(PORT, async () => {
    await initDB();
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});