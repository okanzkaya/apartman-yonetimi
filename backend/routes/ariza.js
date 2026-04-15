const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// Tüm arızaları listele
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM ArizaBildirimleri ORDER BY BildirimTarihi DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Yeni arıza bildir
router.post('/', async (req, res) => {
    const { bildiren_id, kategori, baslik, aciklama } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('bildiren_id', sql.Int, bildiren_id)
            .input('kategori', sql.NVarChar, kategori)
            .input('baslik', sql.NVarChar, baslik)
            .input('aciklama', sql.NVarChar, aciklama)
            .query(`
                INSERT INTO ArizaBildirimleri (BildirenKullaniciID, Kategori, Baslik, Aciklama) 
                VALUES (@bildiren_id, @kategori, @baslik, @aciklama)
            `);
        res.json({ success: true, message: 'Arıza kaydı başarıyla alındı.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Arızayı Çözüldü Olarak İşaretle (Stored Procedure)
router.put('/:ariza_id/cozum', async (req, res) => {
    const { yonetici_notu } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ArizaID', sql.Int, req.params.ariza_id)
            .input('YoneticiNotu', sql.NVarChar(sql.MAX), yonetici_notu)
            .execute('SP_ArizaCozulduIsaretle');
            
        res.json({ success: true, message: 'Arıza başarıyla çözüldü olarak işaretlendi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;