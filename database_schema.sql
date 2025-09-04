-- Схема базы данных для Quizo Quiz Portal
-- Создание таблиц для миграции с Firebase на Neon PostgreSQL

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица викторин
CREATE TABLE IF NOT EXISTS quizzes (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    questions JSONB NOT NULL,
    time_limit INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица результатов (заменяет Firebase Leaderboards)
CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quiz_id VARCHAR(100) REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    time_taken INTEGER, -- время в секундах
    answers JSONB, -- детальные ответы пользователя
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_score ON quiz_results(quiz_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created_at ON quiz_results(created_at DESC);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Вставка тестовых данных для математической викторины
INSERT INTO quizzes (id, name, description, questions, time_limit) VALUES 
('Математика_1_1', 'Математика - Базовый уровень', 'Тест по основам математики', 
'[
    {
        "numb": 1,
        "question": "Сколько будет 2 + 2?",
        "options": ["3", "4", "5", "6"],
        "answer": "4"
    },
    {
        "numb": 2,
        "question": "Сколько будет 5 × 3?",
        "options": ["15", "12", "18", "20"],
        "answer": "15"
    },
    {
        "numb": 3,
        "question": "Сколько будет 10 - 4?",
        "options": ["5", "6", "7", "8"],
        "answer": "6"
    },
    {
        "numb": 4,
        "question": "Сколько будет 8 ÷ 2?",
        "options": ["3", "4", "5", "6"],
        "answer": "4"
    },
    {
        "numb": 5,
        "question": "Сколько будет 3²?",
        "options": ["6", "9", "12", "15"],
        "answer": "9"
    },
    {
        "numb": 6,
        "question": "Сколько будет √16?",
        "options": ["2", "4", "8", "16"],
        "answer": "4"
    },
    {
        "numb": 7,
        "question": "Сколько будет 7 + 8?",
        "options": ["14", "15", "16", "17"],
        "answer": "15"
    },
    {
        "numb": 8,
        "question": "Сколько будет 12 - 5?",
        "options": ["6", "7", "8", "9"],
        "answer": "7"
    },
    {
        "numb": 9,
        "question": "Сколько будет 4 × 6?",
        "options": ["20", "24", "28", "32"],
        "answer": "24"
    },
    {
        "numb": 10,
        "question": "Сколько будет 15 ÷ 3?",
        "options": ["3", "4", "5", "6"],
        "answer": "5"
    }
]'::jsonb, 15)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    questions = EXCLUDED.questions,
    time_limit = EXCLUDED.time_limit,
    updated_at = CURRENT_TIMESTAMP;
