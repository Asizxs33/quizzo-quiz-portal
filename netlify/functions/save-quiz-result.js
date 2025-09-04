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
    const { userId, quizId, score, totalQuestions, timeTaken, answers } = JSON.parse(event.body);

    // Валидация данных
    if (!userId || !quizId || score === undefined || !totalQuestions) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Необходимые поля: userId, quizId, score, totalQuestions' })
      };
    }

    // Проверка существования пользователя
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Пользователь не найден' })
      };
    }

    // Проверка существования викторины
    const quizCheck = await pool.query(
      'SELECT id FROM quizzes WHERE id = $1',
      [quizId]
    );

    if (quizCheck.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Викторина не найдена' })
      };
    }

    // Сохранение результата
    const result = await pool.query(
      `INSERT INTO quiz_results (user_id, quiz_id, score, total_questions, time_taken, answers) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, created_at`,
      [userId, quizId, score, totalQuestions, timeTaken || null, answers ? JSON.stringify(answers) : null]
    );

    const savedResult = result.rows[0];

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        result: {
          id: savedResult.id,
          userId,
          quizId,
          score,
          totalQuestions,
          timeTaken,
          created_at: savedResult.created_at
        }
      })
    };

  } catch (error) {
    console.error('Error saving quiz result:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Внутренняя ошибка сервера' })
    };
  }
};
