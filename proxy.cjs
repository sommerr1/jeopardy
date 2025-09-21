// proxy.cjs
const express = require('express');
const fetch = require('node-fetch'); // npm install node-fetch@2
const app = express();

// URL Google Sheets API (дублируем из TypeScript файла)
const API_URL = "https://script.google.com/macros/s/AKfycbyuSFRlzih7IMI5Y4myMrftNjrRBzxK_QiaCw0HtcJkhSx6u42kJgPKB2DiO1iMdQkaYw/exec";

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/api/questions', async (req, res) => {
  try {
    // Получаем query параметры из запроса
    const queryString = new URLSearchParams(req.query).toString();
    const url = `${API_URL}${queryString ? '?' + queryString : ''}`;
    
    console.log('🌐 Proxy request to:', url);
    
    const response = await fetch(url);
    const data = await response.text();
    res.type('application/json').send(data);
  } catch (err) {
    console.error('❌ Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
});

app.listen(3001, () => console.log('Proxy running on http://localhost:3001'));