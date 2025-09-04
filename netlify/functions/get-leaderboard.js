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
    const { quizId, limit = 10 } = event.queryStringParameters || {};

    if (!quizId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'quizId обязателен' })
      };
    }

    // Получение таблицы лидеров с информацией о пользователях
    const result = await pool.query(
      `SELECT 
        u.username as name,
        qr.score,
        qr.total_questions,
        qr.time_taken,
        qr.created_at,
        ROW_NUMBER() OVER (ORDER BY qr.score DESC, qr.created_at ASC) as rank
       FROM quiz_results qr
       JOIN users u ON qr.user_id = u.id
       WHERE qr.quiz_id = $1
       ORDER BY qr.score DESC, qr.created_at ASC
       LIMIT $2`,
      [quizId, parseInt(limit)]
    );

    const leaderboard = result.rows.map(row => ({
      name: row.name,
      score: row.score,
      totalQuestions: row.total_questions,
      timeTaken: row.time_taken,
      rank: row.rank,
      created_at: row.created_at
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        leaderboard,
        quizId
      })
    };

  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Внутренняя ошибка сервера' })
    };
  }
};
