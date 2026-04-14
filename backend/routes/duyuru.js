const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// Apartmana göre duyuruları getir
router.get('/:apartman_id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('apartman_id', sql.Int, req.params.apartman_id)
            .query('SELECT * FROM duyuru WHERE apartman_id = @apartman_id ORDER BY duyuru_tarihi DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Yeni duyuru ekle
router.post('/', async (req, res) => {
    const { icerik, apartman_id } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('icerik', sql.Text, icerik)
            .input('apartman_id', sql.Int, apartman_id)
            .query('INSERT INTO duyuru (duyuru_icerigi, duyuru_tarihi, apartman_id) VALUES (@icerik, GETDATE(), @apartman_id)');
        res.json({ success: true, message: 'Duyuru eklendi' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;