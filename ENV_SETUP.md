# Настройка переменных окружения

## Для Windows PowerShell:

### 1. Установите переменную окружения для текущей сессии:
```powershell
$env:DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
```

### 2. Или создайте файл .env в корне проекта:
Создайте файл `.env` в папке проекта с содержимым:
```
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
```

## Получение connection string от Neon:

1. Перейдите на [neon.tech](https://neon.tech)
2. Создайте аккаунт и новый проект
3. В разделе "Connection Details" скопируйте connection string
4. Замените `your-neon-connection-string` на реальный connection string

## Пример реального connection string:
```
postgresql://alexey:password123@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## Проверка:
После настройки переменной окружения запустите:
```bash
npm start
```

И откройте http://localhost:3000
