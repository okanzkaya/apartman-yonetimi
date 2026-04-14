const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// Arızaları listele
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM ariza ORDER BY bildirim_tarihi DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Yeni arıza bildir (SQL Prosedürü ile)
router.post('/', async (req, res) => {
    const { daire_id, aciklama } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('daire_id', sql.Int, daire_id)
            .input('aciklama', sql.VarChar(255), aciklama)
            .execute('ariza_ekle');
        res.json({ success: true, message: 'Arıza kaydı alındı.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;