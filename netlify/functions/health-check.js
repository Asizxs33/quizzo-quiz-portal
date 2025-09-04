const { Pool } = require('pg');

// Подключение к базе данных Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event, context) => {
  // Настройка CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Обработка preflight запросов
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Простая проверка подключения к базе данных
    await pool.query('SELECT 1');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected'
      })
    };

  } catch (error) {
    console.error('Health check failed:', error);
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message
      })
    };
  }
};