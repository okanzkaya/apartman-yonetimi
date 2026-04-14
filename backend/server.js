const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// API Rotaları
app.use('/api/auth', require('./routes/auth'));
app.use('/api/duyurular', require('./routes/duyuru'));
app.use('/api/aidat', require('./routes/aidat'));
app.use('/api/ariza', require('./routes/ariza'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});