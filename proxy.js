// proxy.js
const express = require('express');
const fetch = require('node-fetch'); // npm install node-fetch@2
const app = express();

const API_URL = 'https://script.google.com/macros/s/AKfycbyvKRMoyi-9f3ZqTPR1HvVqAM6q2liuTSRJpqruKP0dxf7twTG7PIRAxs-ZrUWE8Ztd0w/exec';

app.get('/api/questions', async (req, res) => {
  try {
    const response = await fetch(API_URL);
    const data = await response.text();
    res.set('Access-Control-Allow-Origin', '*');
    res.type('application/json').send(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
});

app.listen(3001, () => console.log('Proxy running on http://localhost:3001'));