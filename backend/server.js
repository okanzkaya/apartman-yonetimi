const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sequelize, Kullanici, FinansHareketi, Talep, Rezervasyon, PlanliBakim, Tedarikci, Dokuman, initDB, Op } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'ElitYonetimSuperGizliAnahtar1234567890!!';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

const RolEnum = { 0: 'Sakin', 1: 'Yonetici' };
const FinansTipiEnum = { 0: 'Gelir', 1: 'Gider' };
const TalepAciliyetEnum = { 0: 'Dusuk', 1: 'Orta', 2: 'Yuksek' };
const TalepDurumuEnum = { 0: 'İnceleniyor', 1: 'İşleme Alındı', 2: 'Çözüldü' };
const RezervasyonDurumuEnum = { 0: 'Bekliyor', 1: 'Onaylandı', 2: 'Reddedildi' };

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
    if (req.user.Rol !== 1) return res.status(403).json({ mesaj: "Yönetici yetkisi gerekiyor." }); 
    next();
};

app.post('/api/auth/login', async (req, res) => {
    const { KullaniciAdi, Sifre } = req.body;
    const user = await Kullanici.findOne({ where: { KullaniciAdi } });

    if (!user || user.SifreHash !== Sifre) {
        return res.status(401).json({ mesaj: 'Geçersiz kullanıcı adı veya şifre.' });
    }
    const token = jwt.sign({ id: user.Id, Rol: user.Rol }, JWT_SECRET, { expiresIn: '12h' });
    
    // Rol bilgisi frontend'e yönlendirme için eklendi
    res.json({ token, adSoyad: user.AdSoyad, blokDaire: user.BlokDaire, id: user.Id, rol: user.Rol });
});

// --- KULLANICI / SAKİN ---
app.get('/api/kullanici/listele', authenticateToken, requireAdmin, async (req, res) => {
    const kullanicilar = await Kullanici.findAll({ where: { Rol: 0 } }); 
    res.json(kullanicilar.map(k => ({
        id: k.Id, kullaniciAdi: k.KullaniciAdi, adSoyad: k.AdSoyad, blokDaire: k.BlokDaire, telefon: k.Telefon, plaka: k.Plaka, aktifMi: k.AktifMi
    })));
});

app.post('/api/kullanici/ekle', authenticateToken, requireAdmin, async (req, res) => {
    const { KullaniciAdi, AdSoyad, BlokDaire, Telefon, Plaka, Sifre } = req.body;
    try {
        const mevcut = await Kullanici.findOne({ where: { KullaniciAdi } });
        if (mevcut) return res.status(400).json({ mesaj: "Bu kullanıcı adı alınmış." });
        const yeni = await Kullanici.create({ KullaniciAdi, SifreHash: Sifre || '123456', AdSoyad, BlokDaire, Telefon, Plaka, Rol: 0, AktifMi: true });
        res.json({ mesaj: "Sakin eklendi.", id: yeni.Id });
    } catch (e) { res.status(500).json({ mesaj: "Hata oluştu." }); }
});

app.delete('/api/kullanici/sil/:id', authenticateToken, requireAdmin, async (req, res) => {
    await Kullanici.destroy({ where: { Id: req.params.id } });
    res.json({ mesaj: "Sakin başarıyla silindi." });
});

app.get('/api/kullanici/profil', authenticateToken, async (req, res) => {
    const user = await Kullanici.findByPk(req.user.id);
    res.json({ id: user.Id, kullaniciAdi: user.KullaniciAdi, adSoyad: user.AdSoyad, blokDaire: user.BlokDaire, telefon: user.Telefon, plaka: user.Plaka });
});

app.put('/api/kullanici/profil-guncelle', authenticateToken, async (req, res) => {
    const { Telefon, Plaka } = req.body;
    await Kullanici.update({ Telefon, Plaka }, { where: { Id: req.user.id } });
    res.json({ mesaj: "Profil başarıyla güncellendi." });
});

// --- FİNANS ---
app.get('/api/finans/ekstre', authenticateToken, async (req, res) => {
    const hareketler = await FinansHareketi.findAll({ where: { KullaniciId: req.user.id }, order: [['Tarih', 'DESC']] });
    res.json(hareketler.map(f => ({ id: f.Id, donem: f.Donem, aciklama: f.Aciklama, tutar: f.Tutar, durum: f.Durum })));
});

app.post('/api/finans/ode', authenticateToken, async (req, res) => {
    const hareket = await FinansHareketi.findByPk(req.body.id);
    if (!hareket || hareket.KullaniciId !== req.user.id) return res.status(404).json({ mesaj: "Fatura bulunamadı." });
    if (hareket.Durum === 'Ödendi') return res.status(400).json({ mesaj: "Bu borç zaten ödenmiş." });
    hareket.Durum = 'Ödendi';
    await hareket.save();
    res.json({ mesaj: "Ödeme işlemi başarıyla gerçekleşti." });
});

app.get('/api/finans/hepsini-getir', authenticateToken, requireAdmin, async (req, res) => {
    const hareketler = await FinansHareketi.findAll({ include: Kullanici, order: [['Tarih', 'DESC']] });
    res.json(hareketler.map(f => ({
        id: f.Id, kullaniciAdi: f.Kullanici ? f.Kullanici.AdSoyad : "Ortak Gider", blokDaire: f.Kullanici ? f.Kullanici.BlokDaire : "-",
        tarih: new Date(f.Tarih).toLocaleDateString('tr-TR'), donem: f.Donem, aciklama: f.Aciklama, tip: FinansTipiEnum[f.Tip], tutar: f.Tutar, durum: f.Durum
    })));
});

app.post('/api/finans/borclandir', authenticateToken, requireAdmin, async (req, res) => {
    const { KullaniciId, Donem, Aciklama, Tutar } = req.body;
    try {
        if(KullaniciId === 'ALL') {
            const sakinler = await Kullanici.findAll({where:{Rol: 0}});
            for (const s of sakinler) {
                await FinansHareketi.create({ KullaniciId: s.Id, Tarih: new Date(), Donem, Aciklama, Tip: 0, Tutar, Durum: 'Ödenmedi' });
            }
        } else {
            await FinansHareketi.create({ KullaniciId, Tarih: new Date(), Donem, Aciklama, Tip: 0, Tutar, Durum: 'Ödenmedi' });
        }
        res.json({ mesaj: "Borçlandırma başarılı." });
    } catch (error) { res.status(500).json({ mesaj: "Hata oluştu." }); }
});

// --- REZERVASYON ---
app.post('/api/rezervasyon/yap', authenticateToken, async (req, res) => {
    const { TesisAdi, SaatAraligi, Tarih } = req.body;
    const rezerveTarihi = new Date(Tarih);
    const doluMu = await Rezervasyon.findOne({ where: { TesisAdi, SaatAraligi, Durum: { [Op.ne]: 2 } } });
    if (doluMu && new Date(doluMu.Tarih).toDateString() === rezerveTarihi.toDateString()) {
        return res.status(400).json({ mesaj: "Seçtiğiniz tesis bu saat aralığında dolu." });
    }
    await Rezervasyon.create({ KullaniciId: req.user.id, TesisAdi, Tarih: rezerveTarihi, SaatAraligi, Durum: 0 });
    res.json({ mesaj: "Rezervasyon talebiniz oluşturuldu." });
});

app.get('/api/rezervasyon/listele', authenticateToken, async (req, res) => {
    const rezervasyonlar = await Rezervasyon.findAll({ where: { KullaniciId: req.user.id }, order: [['Tarih', 'DESC']] });
    res.json(rezervasyonlar.map(r => ({ id: r.Id, tesisAdi: r.TesisAdi, tarih: new Date(r.Tarih).toLocaleDateString('tr-TR'), saatAraligi: r.SaatAraligi, durum: RezervasyonDurumuEnum[r.Durum] })));
});

app.get('/api/rezervasyon/hepsini-getir', authenticateToken, requireAdmin, async (req, res) => {
    const rezervasyonlar = await Rezervasyon.findAll({ include: Kullanici, order: [['Tarih', 'DESC']] });
    res.json(rezervasyonlar.map(r => ({ id: r.Id, kullaniciAdi: r.Kullanici.AdSoyad, tesisAdi: r.TesisAdi, tarih: new Date(r.Tarih).toLocaleDateString('tr-TR'), saatAraligi: r.SaatAraligi, durum: RezervasyonDurumuEnum[r.Durum] })));
});

app.put('/api/rezervasyon/durum-guncelle/:id', authenticateToken, requireAdmin, async (req, res) => {
    await Rezervasyon.update({ Durum: req.body.durum }, { where: { Id: req.params.id } });
    res.json({ mesaj: "Durum güncellendi." });
});

// --- TALEPLER (ARIZALAR) ---
app.post('/api/talepler/olustur', authenticateToken, async (req, res) => {
    const { Kategori, Aciklama } = req.body;
    let aciliyet = 0, duygu = 'Nötr'; 
    const text = Aciklama.toLowerCase();
    if (text.includes('acil') || text.includes('tehlike') || text.includes('hemen') || text.includes('patladı')) { aciliyet = 2; duygu = 'Endişeli'; } 
    else if (text.includes('lanet') || text.includes('yönetim') || text.includes('bıktım')) { duygu = 'Kızgın'; }

    await Talep.create({ KullaniciId: req.user.id, Kategori, HamMetin: Aciklama, Aciliyet: aciliyet, DuyguDurumu: duygu, Durum: 0 });
    res.json({ mesaj: "Talebiniz yönetime iletildi." });
});

app.get('/api/talepler/benimkiler', authenticateToken, async (req, res) => {
    const talepler = await Talep.findAll({ where: { KullaniciId: req.user.id }, order: [['Tarih', 'DESC']] });
    res.json(talepler.map(t => ({
        id: t.Id, tarih: new Date(t.Tarih).toLocaleDateString('tr-TR'), kategori: t.Kategori, durum: TalepDurumuEnum[t.Durum], aciklama: t.HamMetin
    })));
});

app.get('/api/talepler/hepsini-getir', authenticateToken, requireAdmin, async (req, res) => {
    const talepler = await Talep.findAll({ include: Kullanici, order: [['Tarih', 'DESC']] });
    res.json(talepler.map(t => ({
        id: t.Id, kullaniciAdi: t.Kullanici.AdSoyad, blokDaire: t.Kullanici.BlokDaire,
        tarih: new Date(t.Tarih).toLocaleString('tr-TR'), kategori: t.Kategori, aciliyet: TalepAciliyetEnum[t.Aciliyet], duyguDurumu: t.DuyguDurumu, durum: TalepDurumuEnum[t.Durum], hamMetin: t.HamMetin
    })));
});

app.put('/api/talepler/durum-guncelle/:id', authenticateToken, requireAdmin, async (req, res) => {
    await Talep.update({ Durum: req.body.durum }, { where: { Id: req.params.id } });
    res.json({ mesaj: "Talep durumu güncellendi." });
});

// --- DOKÜMANLAR ---
app.post('/api/dokuman/yukle', authenticateToken, requireAdmin, upload.single('dosya'), async (req, res) => {
    if (!req.file) return res.status(400).json({ mesaj: "Lütfen bir dosya seçin." });
    await Dokuman.create({ Isim: req.body.isim, ErisimTipi: req.body.erisimTipi, DosyaYolu: req.file.filename });
    res.json({ mesaj: "Doküman başarıyla yüklendi." });
});

app.get('/api/dokuman/listele', authenticateToken, async (req, res) => {
    const dokumanlar = await Dokuman.findAll({ order: [['YuklemeTarihi', 'DESC']] });
    res.json(dokumanlar.map(d => ({ id: d.Id, isim: d.Isim, yuklemeTarihi: new Date(d.YuklemeTarihi).toLocaleDateString('tr-TR'), erisimTipi: d.ErisimTipi, dosyaYolu: d.DosyaYolu })));
});

app.delete('/api/dokuman/sil/:id', authenticateToken, requireAdmin, async (req, res) => {
    const dokuman = await Dokuman.findByPk(req.params.id);
    if(dokuman && dokuman.DosyaYolu) {
        const p = path.join(__dirname, 'uploads', dokuman.DosyaYolu);
        if(fs.existsSync(p)) fs.unlinkSync(p);
    }
    await Dokuman.destroy({ where: { Id: req.params.id } });
    res.json({ mesaj: "Doküman sistemden silindi." });
});

app.get('/api/dokuman/indir/:id', authenticateToken, async (req, res) => {
    const dokuman = await Dokuman.findByPk(req.params.id);
    if (!dokuman || !dokuman.DosyaYolu) return res.status(404).send("Dosya bulunamadı.");
    const filePath = path.join(__dirname, 'uploads', dokuman.DosyaYolu);
    res.download(filePath, dokuman.Isim);
});

// --- BAKIMLAR & TEDARİKÇİLER ---
app.get('/api/bakim/listele', authenticateToken, async (req, res) => {
    const bakimlar = await PlanliBakim.findAll({ order: [['Tarih', 'DESC']] });
    res.json(bakimlar.map(b => ({ id: b.Id, tur: b.Tur, tarih: new Date(b.Tarih).toLocaleDateString('tr-TR'), maliyet: b.Maliyet, periyot: b.Periyot, durum: b.Durum })));
});
app.post('/api/bakim/ekle', authenticateToken, requireAdmin, async (req, res) => {
    await PlanliBakim.create({ Tur: req.body.tur, Tarih: new Date(req.body.tarih), Maliyet: req.body.maliyet, Periyot: req.body.periyot });
    res.json({ mesaj: "Bakım takvime eklendi." });
});
app.delete('/api/bakim/sil/:id', authenticateToken, requireAdmin, async (req, res) => {
    await PlanliBakim.destroy({ where: { Id: req.params.id } });
    res.json({ mesaj: "Bakım silindi." });
});

app.get('/api/tedarikci/listele', authenticateToken, requireAdmin, async (req, res) => {
    const tedarikciler = await Tedarikci.findAll();
    res.json(tedarikciler.map(t => ({ id: t.Id, isim: t.Isim, alan: t.Alan, tel: t.Tel })));
});
app.post('/api/tedarikci/ekle', authenticateToken, requireAdmin, async (req, res) => {
    await Tedarikci.create({ Isim: req.body.isim, Alan: req.body.alan, Tel: req.body.tel });
    res.json({ mesaj: "Tedarikçi eklendi." });
});
app.delete('/api/tedarikci/sil/:id', authenticateToken, requireAdmin, async (req, res) => {
    await Tedarikci.destroy({ where: { Id: req.params.id } });
    res.json({ mesaj: "Tedarikçi silindi." });
});

const PORT = 5000;
app.listen(PORT, async () => {
    await initDB();
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});