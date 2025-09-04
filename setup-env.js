// Скрипт для настройки переменных окружения
const fs = require('fs');
const path = require('path');

console.log('🔧 Настройка переменных окружения для Quizo Quiz Portal');
console.log('');

// Проверяем, существует ли файл .env
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ Файл .env уже существует');
} else {
  console.log('📝 Создание файла .env...');
  
  const envContent = `# Переменные окружения для Quizo Quiz Portal
# Замените your-neon-connection-string на реальный connection string от Neon

DATABASE_URL=your-neon-connection-string

# Пример реального connection string:
# DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Файл .env создан успешно');
  } catch (error) {
    console.error('❌ Ошибка создания файла .env:', error.message);
    console.log('');
    console.log('📋 Создайте файл .env вручную с содержимым:');
    console.log(envContent);
  }
}

console.log('');
console.log('📋 Следующие шаги:');
console.log('1. Получите connection string на https://neon.tech');
console.log('2. Замените "your-neon-connection-string" в файле .env на реальный connection string');
console.log('3. Запустите: npm start');
console.log('4. Откройте: http://localhost:3000');
console.log('');
console.log('🔗 Ссылки:');
console.log('- Neon Database: https://neon.tech');
console.log('- Документация: https://neon.tech/docs');
