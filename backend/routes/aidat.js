const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// Dairenin borçlarını getir
router.get('/:daire_id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('daire_id', sql.Int, req.params.daire_id)
            .query('SELECT * FROM aidat WHERE daire_id = @daire_id ORDER BY yil DESC, ay DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Veritabanındaki SQL Prosedürünü çalıştırarak hesaplama yap
router.post('/hesapla', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request().execute('aidat_hesapla');
        res.json({ success: true, message: 'Aidatlar başarıyla hesaplandı.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;