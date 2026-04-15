const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// Tüm duyuruları getir (Ekleyen kişinin adıyla birlikte)
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT d.DuyuruID, d.Baslik, d.Icerik, d.OlusturmaTarihi, d.KritikMi, k.Ad, k.Soyad 
            FROM Duyurular d
            INNER JOIN Kullanicilar k ON d.EkleyenKullaniciID = k.KullaniciID
            ORDER BY d.OlusturmaTarihi DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Yeni duyuru ekle
router.post('/', async (req, res) => {
    const { ekleyen_id, baslik, icerik, kritik_mi } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ekleyen_id', sql.Int, ekleyen_id)
            .input('baslik', sql.NVarChar, baslik)
            .input('icerik', sql.NVarChar, icerik)
            .input('kritik_mi', sql.Bit, kritik_mi || 0)
            .query(`
                INSERT INTO Duyurular (EkleyenKullaniciID, Baslik, Icerik, KritikMi) 
                VALUES (@ekleyen_id, @baslik, @icerik, @kritik_mi)
            `);
        res.json({ success: true, message: 'Duyuru başarıyla eklendi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;