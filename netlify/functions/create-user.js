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
  console.log('create-user function called with:', event.httpMethod);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
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
    const { email, username, password } = JSON.parse(event.body);

    // Валидация данных
    if (!email || !username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Все поля обязательны' })
      };
    }

    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Неверный формат email' })
      };
    }

    // Проверка длины пароля
    if (password.length < 6) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Пароль должен содержать минимум 6 символов' })
      };
    }

    // Хеширование пароля
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Проверка существования пользователя
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ error: 'Пользователь с таким email уже существует' })
      };
    }

    // Создание пользователя
    const result = await pool.query(
      'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, role, created_at',
      [email, username, passwordHash]
    );

    const user = result.rows[0];

    return {
      statusCode: 201,
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
    console.error('Error creating user:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Внутренняя ошибка сервера' })
    };
  }
};
