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
    console.log('get-vip-access function called');

    const { userId } = event.queryStringParameters || {};

    // Валидация данных
    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId обязателен' })
      };
    }

    // Получаем VIP доступ для пользователя
    const result = await pool.query(
      'SELECT test_id FROM user_vip_access WHERE user_id = $1',
      [userId]
    );

    const allowedTests = {};
    result.rows.forEach(row => {
      allowedTests[row.test_id] = true;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        userId: userId,
        allowedTests: allowedTests
      })
    };

  } catch (error) {
    console.error('Error getting VIP access:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Внутренняя ошибка сервера' })
    };
  }
};
