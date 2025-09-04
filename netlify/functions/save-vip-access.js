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
    console.log('save-vip-access function called');

    const { userId, allowedTests } = JSON.parse(event.body);

    // Валидация данных
    if (!userId || !allowedTests) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId и allowedTests обязательны' })
      };
    }

    // Проверяем, что пользователь существует
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Пользователь не найден' })
      };
    }

    // Создаем или обновляем VIP доступ
    // Сначала удаляем старые записи для этого пользователя
    await pool.query('DELETE FROM user_vip_access WHERE user_id = $1', [userId]);

    // Добавляем новые записи
    const testEntries = Object.entries(allowedTests).filter(([testId, isAllowed]) => isAllowed);
    
    if (testEntries.length > 0) {
      const values = testEntries.map(([testId], index) => 
        `($1, $${index + 2})`
      ).join(', ');
      
      const params = [userId, ...testEntries.map(([testId]) => testId)];
      
      await pool.query(`
        INSERT INTO user_vip_access (user_id, test_id) 
        VALUES ${values}
      `, params);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'VIP доступ успешно сохранен',
        userId: userId,
        allowedTestsCount: testEntries.length
      })
    };

  } catch (error) {
    console.error('Error saving VIP access:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Внутренняя ошибка сервера' })
    };
  }
};
