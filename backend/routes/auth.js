const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

router.post('/login', async (req, res) => {
    const { email, sifre } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .input('sifre', sql.NVarChar, sifre)
            .query(`
                SELECT KullaniciID, Ad, Soyad, Rol, DaireID 
                FROM Kullanicilar 
                WHERE Email = @email AND SifreHash = @sifre AND Durum = 1
            `);

        if (result.recordset.length > 0) {
            res.json({ success: true, user: result.recordset[0] });
        } else {
            res.status(401).json({ success: false, message: 'Hatalı e-posta veya şifre' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;