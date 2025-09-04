// Скрипт для создания таблиц в базе данных
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Загружаем переменные окружения
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv не установлен');
}

console.log('🔧 Создание таблиц в базе данных...');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL не найден в переменных окружения');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTables() {
  try {
    console.log('🔄 Подключение к базе данных...');
    const client = await pool.connect();
    console.log('✅ Подключение успешно!');
    
    // Читаем SQL из файла
    const sqlPath = path.join(__dirname, 'database_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 Выполнение SQL...');
    await client.query(sql);
    
    console.log('✅ Таблицы созданы успешно!');
    
    // Проверяем созданные таблицы
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Созданные таблицы:');
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    
    client.release();
    await pool.end();
    console.log('🎉 Готово! Теперь можно запускать сервер.');
    
  } catch (error) {
    console.error('❌ Ошибка создания таблиц:', error.message);
    console.error('Детали ошибки:', error);
    process.exit(1);
  }
}

createTables();
