const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true // SSL hatalarını engeller
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('MSSQL Veritabanına başarıyla bağlanıldı!');
        return pool;
    })
    .catch(err => console.log('Veritabanı Bağlantı Hatası:', err));

module.exports = { sql, poolPromise };