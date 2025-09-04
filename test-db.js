// Простой тест подключения к базе данных
const { Pool } = require('pg');

// Загружаем переменные окружения
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv не установлен');
}

console.log('🔍 Тестирование подключения к базе данных...');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL не найден в переменных окружения');
  console.log('Создайте файл .env с содержимым:');
  console.log('DATABASE_URL=postgresql://neondb_owner:npg_WJfTG1CPy7gS@ep-icy-snow-aelf148u-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('🔄 Подключение к базе данных...');
    const client = await pool.connect();
    console.log('✅ Подключение успешно!');
    
    // Проверяем существование таблиц
    console.log('🔍 Проверка таблиц...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Найденные таблицы:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    if (result.rows.length === 0) {
      console.log('⚠️  Таблицы не найдены. Выполните SQL из database_schema.sql');
    }
    
    client.release();
    await pool.end();
    console.log('✅ Тест завершен успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error.message);
    console.error('Детали ошибки:', error);
    process.exit(1);
  }
}

testConnection();
