const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

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
    console.log('authenticate-user function called');
    
    const { email, password } = JSON.parse(event.body);

    // Валидация данных
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email и пароль обязательны' })
      };
    }

    // Поиск пользователя по email
    const result = await pool.query(
      'SELECT id, email, username, password_hash, role, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('User not found for email:', email);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Пользователь не найден' })
      };
    }

    const user = result.rows[0];

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Неверный пароль' })
      };
    }

    // Возвращаем данные пользователя (без пароля)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          created_at: user.created_at
        }
      })
    };

  } catch (error) {
    console.error('Error authenticating user:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Внутренняя ошибка сервера' })
    };
  }
};
