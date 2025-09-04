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
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Обработка preflight запросов
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('update-user-role function called');

    const { userId, newRole } = JSON.parse(event.body);

    // Валидация данных
    if (!userId || !newRole) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId и newRole обязательны' })
      };
    }

    // Проверяем, что роль валидна
    const validRoles = ['user', 'admin', 'vip'];
    if (!validRoles.includes(newRole)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Неверная роль. Доступные роли: user, admin, vip' })
      };
    }

    // Обновляем роль пользователя
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, username, role',
      [newRole, userId]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Пользователь не найден' })
      };
    }

    const updatedUser = result.rows[0];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          role: updatedUser.role
        }
      })
    };

  } catch (error) {
    console.error('Error updating user role:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Внутренняя ошибка сервера' })
    };
  }
};
