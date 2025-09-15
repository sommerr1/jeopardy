// Netlify Function для проксирования запросов к Google Sheets API
const fetch = require('node-fetch');

// URL Google Sheets API (дублируем из TypeScript файла)
const SPREADSHEET_API_URL = "https://script.google.com/macros/s/AKfycbyuSFRlzih7IMI5Y4myMrftNjrRBzxK_QiaCw0HtcJkhSx6u42kJgPKB2DiO1iMdQkaYw/exec";

exports.handler = async (event, context) => {
  // CORS заголовки
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Обработка preflight запросов
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { queryStringParameters } = event;
    const queryString = new URLSearchParams(queryStringParameters || {}).toString();
    const url = `${SPREADSHEET_API_URL}${queryString ? '?' + queryString : ''}`;
    
    console.log('🌐 Proxying request to:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.text();
    
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: data
    };
  } catch (error) {
    console.error('❌ Proxy error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Proxy error', 
        details: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
