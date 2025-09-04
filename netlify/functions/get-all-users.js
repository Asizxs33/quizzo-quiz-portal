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
    console.log('get-all-users function called');

    // Получаем всех пользователей из базы данных
    const result = await pool.query(
      'SELECT id, email, username, role, created_at FROM users ORDER BY created_at DESC'
    );

    const users = result.rows.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role || 'user',
      created_at: user.created_at
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        users: users,
        count: users.length
      })
    };

  } catch (error) {
    console.error('Error getting all users:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Внутренняя ошибка сервера' })
    };
  }
};
