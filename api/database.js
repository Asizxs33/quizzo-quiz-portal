// API для работы с базой данных Neon PostgreSQL
// Заменяет Firebase Database функциональность

class DatabaseAPI {
    constructor() {
        this.baseURL = '/.netlify/functions';
        this.isOnline = navigator.onLine;
        
        // Обработчики изменения состояния сети
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('Сетевое подключение восстановлено');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('Сетевое подключение потеряно');
        });
    }

    // Универсальный метод для API запросов
    async makeRequest(endpoint, method = 'GET', data = null) {
        if (!this.isOnline) {
            throw new Error('Нет подключения к интернету');
        }

        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Методы для работы с пользователями
    async createUser(userData) {
        return await this.makeRequest('/create-user', 'POST', userData);
    }

    async authenticateUser(userData) {
        return await this.makeRequest('/authenticate-user', 'POST', userData);
    }

    async getUserByEmail(email) {
        return await this.makeRequest(`/get-user?email=${encodeURIComponent(email)}`);
    }

    async getUserById(userId) {
        return await this.makeRequest(`/get-user-by-id?userId=${encodeURIComponent(userId)}`);
    }

    async getAllUsers() {
        return await this.makeRequest('/get-all-users');
    }

    async updateUserRole(userId, newRole) {
        return await this.makeRequest('/update-user-role', 'POST', { userId, newRole });
    }

    async saveVipAccess(userId, allowedTests) {
        return await this.makeRequest('/save-vip-access', 'POST', { userId, allowedTests });
    }

    async getVipAccess(userId) {
        return await this.makeRequest(`/get-vip-access?userId=${encodeURIComponent(userId)}`);
    }

    // Методы для работы с викторинами
    async getQuiz(quizId) {
        return await this.makeRequest(`/get-quiz?quizId=${encodeURIComponent(quizId)}`);
    }

    async getAllQuizzes() {
        return await this.makeRequest('/get-all-quizzes');
    }

    // Методы для работы с результатами
    async saveQuizResult(resultData) {
        return await this.makeRequest('/save-quiz-result', 'POST', resultData);
    }

    async getLeaderboard(quizId, limit = 10) {
        return await this.makeRequest(`/get-leaderboard?quizId=${encodeURIComponent(quizId)}&limit=${limit}`);
    }

    async getUserResults(userId) {
        return await this.makeRequest(`/get-user-results?userId=${encodeURIComponent(userId)}`);
    }

    // Метод для проверки подключения к базе данных
    async checkConnection() {
        try {
            await this.makeRequest('/health-check');
            return true;
        } catch (error) {
            console.error('Database connection check failed:', error);
            return false;
        }
    }
}

// Создаем глобальный экземпляр API
window.databaseAPI = new DatabaseAPI();

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseAPI;
}

// Также экспортируем методы для прямого использования
if (typeof window !== 'undefined') {
    window.authenticateUser = window.databaseAPI.authenticateUser.bind(window.databaseAPI);
    window.createUser = window.databaseAPI.createUser.bind(window.databaseAPI);
    window.saveQuizResult = window.databaseAPI.saveQuizResult.bind(window.databaseAPI);
    window.getLeaderboard = window.databaseAPI.getLeaderboard.bind(window.databaseAPI);
    window.getQuiz = window.databaseAPI.getQuiz.bind(window.databaseAPI);
    window.getAllUsers = window.databaseAPI.getAllUsers.bind(window.databaseAPI);
    window.updateUserRole = window.databaseAPI.updateUserRole.bind(window.databaseAPI);
    window.saveVipAccess = window.databaseAPI.saveVipAccess.bind(window.databaseAPI);
    window.getVipAccess = window.databaseAPI.getVipAccess.bind(window.databaseAPI);
}
