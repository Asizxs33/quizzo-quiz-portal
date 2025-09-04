# Руководство по миграции с Firebase на Neon Database

## Обзор изменений

Проект Quizo Quiz Portal был успешно мигрирован с Firebase на Neon Database (PostgreSQL) через Netlify DB. Все функции аутентификации и хранения данных теперь работают через новую систему.

## Что было изменено

### 1. База данных
- **Было**: Firebase Realtime Database
- **Стало**: Neon PostgreSQL через Netlify DB

### 2. Аутентификация
- **Было**: Firebase Auth
- **Стало**: Собственная система аутентификации с bcrypt

### 3. API
- **Было**: Firebase SDK
- **Стало**: Netlify Functions + REST API

## Новые файлы

### База данных
- `database_schema.sql` - SQL схема для создания таблиц
- `netlify.toml` - конфигурация Netlify
- `package.json` - зависимости Node.js

### API
- `api/database.js` - клиентский API для работы с базой данных
- `netlify/functions/` - серверные функции:
  - `create-user.js` - регистрация пользователей
  - `authenticate-user.js` - аутентификация
  - `save-quiz-result.js` - сохранение результатов
  - `get-leaderboard.js` - получение таблицы лидеров
  - `get-quiz.js` - получение данных викторины

### Обновленные скрипты
- `login_script_new.js` - новый скрипт аутентификации
- `script_new.js` - новый основной скрипт

## Настройка и развертывание

### Шаг 1: Установка Netlify CLI
```bash
npm install -g netlify-cli
```

### Шаг 2: Инициализация Netlify DB
```bash
npx netlify db init
```

### Шаг 3: Настройка базы данных
1. Выполните SQL из `database_schema.sql` в вашей Neon базе данных
2. Получите connection string от Neon
3. Добавьте его в переменные окружения Netlify

### Шаг 4: Установка зависимостей
```bash
npm install
```

### Шаг 5: Локальная разработка
```bash
netlify dev
```

### Шаг 6: Развертывание
```bash
netlify deploy --prod
```

## Переменные окружения

Добавьте в Netlify следующие переменные:
- `DATABASE_URL` - connection string к Neon PostgreSQL

## Структура базы данных

### Таблица users
- `id` (UUID) - уникальный идентификатор
- `email` (VARCHAR) - email пользователя
- `username` (VARCHAR) - имя пользователя
- `password_hash` (VARCHAR) - хеш пароля
- `role` (VARCHAR) - роль пользователя
- `created_at`, `updated_at` - временные метки

### Таблица quizzes
- `id` (VARCHAR) - идентификатор викторины
- `name` (VARCHAR) - название викторины
- `description` (TEXT) - описание
- `questions` (JSONB) - вопросы в формате JSON
- `time_limit` (INTEGER) - лимит времени
- `created_at`, `updated_at` - временные метки

### Таблица quiz_results
- `id` (UUID) - уникальный идентификатор
- `user_id` (UUID) - ссылка на пользователя
- `quiz_id` (VARCHAR) - ссылка на викторину
- `score` (INTEGER) - количество баллов
- `total_questions` (INTEGER) - общее количество вопросов
- `time_taken` (INTEGER) - время выполнения
- `answers` (JSONB) - детальные ответы
- `created_at` - временная метка

## API Endpoints

### Аутентификация
- `POST /.netlify/functions/create-user` - регистрация
- `POST /.netlify/functions/authenticate-user` - вход

### Викторины
- `GET /.netlify/functions/get-quiz?quizId=ID` - получение викторины
- `GET /.netlify/functions/get-all-quizzes` - все викторины

### Результаты
- `POST /.netlify/functions/save-quiz-result` - сохранение результата
- `GET /.netlify/functions/get-leaderboard?quizId=ID&limit=10` - таблица лидеров
- `GET /.netlify/functions/get-user-results?userId=ID` - результаты пользователя

## Безопасность

- Пароли хешируются с помощью bcrypt
- Все API запросы проверяют валидность данных
- CORS настроен для безопасных запросов
- SQL инъекции предотвращены через параметризованные запросы

## Мониторинг

- Логирование всех операций
- Проверка состояния сети
- Обработка ошибок с понятными сообщениями
- Автоматические retry для сетевых запросов

## Преимущества новой системы

1. **Производительность**: PostgreSQL быстрее Firebase для сложных запросов
2. **Гибкость**: Полный контроль над схемой данных
3. **Масштабируемость**: Neon обеспечивает автоматическое масштабирование
4. **Стоимость**: Более предсказуемая модель ценообразования
5. **AI-оптимизация**: Neon оптимизирован для AI workflows

## Обратная совместимость

Старые файлы сохранены с суффиксом `_old` для возможного отката:
- `login_script_old.js`
- `script_old.js`

## Тестирование

После развертывания проверьте:
1. Регистрацию новых пользователей
2. Вход существующих пользователей
3. Прохождение викторин
4. Сохранение результатов
5. Отображение таблицы лидеров

## Поддержка

При возникновении проблем:
1. Проверьте логи Netlify Functions
2. Убедитесь в правильности переменных окружения
3. Проверьте подключение к базе данных
4. Обратитесь к документации Neon и Netlify
