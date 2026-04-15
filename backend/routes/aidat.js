const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// Dairenin tüm aidat geçmişini getir
router.get('/:daire_id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('daire_id', sql.Int, req.params.daire_id)
            .query('SELECT * FROM Aidatlar WHERE DaireID = @daire_id ORDER BY DonemYil DESC, DonemAy DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dairenin Borç Özetini Getir (Stored Procedure)
router.get('/:daire_id/ozet', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('DaireID', sql.Int, req.params.daire_id)
            .execute('SP_DaireBorcSorgula');
        
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toplu Aidat Oluştur (Stored Procedure)
router.post('/toplu-olustur', async (req, res) => {
    const { donemAy, donemYil, aidatTutari, sonOdemeTarihi } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('DonemAy', sql.Int, donemAy)
            .input('DonemYil', sql.Int, donemYil)
            .input('AidatTutari', sql.Decimal(18,2), aidatTutari)
            .input('SonOdemeTarihi', sql.Date, sonOdemeTarihi)
            .execute('SP_TopluAidatOlustur');
            
        res.json({ success: true, message: 'Dolu daireler için aidatlar başarıyla oluşturuldu.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;