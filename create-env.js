// Скрипт для создания правильного .env файла
const fs = require('fs');
const path = require('path');

console.log('🔧 Создание файла .env с правильным connection string...');

const envContent = `# Переменные окружения для Quizo Quiz Portal
DATABASE_URL=postgresql://neondb_owner:npg_WJfTG1CPy7gS@ep-icy-snow-aelf148u-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Файл .env создан успешно!');
  console.log('📋 Содержимое:');
  console.log(envContent);
  console.log('🚀 Теперь запустите: npm run test-db');
} catch (error) {
  console.error('❌ Ошибка создания файла .env:', error.message);
  console.log('');
  console.log('📋 Создайте файл .env вручную с содержимым:');
  console.log(envContent);
}
