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
    const { quizId } = event.queryStringParameters || {};

    if (!quizId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'quizId обязателен' })
      };
    }

    // Получение викторины
    const result = await pool.query(
      'SELECT id, name, description, questions, time_limit FROM quizzes WHERE id = $1',
      [quizId]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Викторина не найдена' })
      };
    }

    const quiz = result.rows[0];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        quiz: {
          id: quiz.id,
          name: quiz.name,
          description: quiz.description,
          questions: quiz.questions,
          time_limit: quiz.time_limit
        }
      })
    };

  } catch (error) {
    console.error('Error getting quiz:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Внутренняя ошибка сервера' })
    };
  }
};
