// Новый скрипт аутентификации для работы с Neon Database
// Заменяет Firebase Auth функциональность

// Глобальные переменные для элементов формы
const submitButton = document.getElementById("submit");
const signupButton = document.getElementById("sign-up");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const createacctbtn = document.getElementById("create-acct-btn");
const signupEmailIn = document.getElementById("email-signup");
const usernameIn = document.getElementById("username-signup");
const signupPasswordIn = document.getElementById("password-signup");
const confirmSignUpPasswordIn = document.getElementById("confirm-password-signup");
const forgetBtn = document.querySelector(".forget-btn");

// Переменные для хранения данных
var email, password, signupEmail, signupPassword, confirmSignUpPassword, username, userId;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== СТАТУС СИСТЕМЫ ПРИ ЗАГРУЗКЕ ===');
    console.log('Online статус:', navigator.onLine);
    console.log('Текущий URL:', window.location.href);
    console.log('Время загрузки:', new Date().toISOString());
    
    // Проверяем доступность API
    if (window.databaseAPI) {
        console.log('Database API доступен');
        console.log('authenticateUser method exists:', typeof window.databaseAPI.authenticateUser);
        checkDatabaseConnection();
    } else {
        console.error('Database API недоступен!');
    }
    
    if (!navigator.onLine) {
        window.alert('Внимание! Нет подключения к интернету.\n\nПожалуйста, проверьте ваше интернет-соединение перед попыткой входа.');
    }
});

// Проверка подключения к базе данных
async function checkDatabaseConnection() {
    try {
        const isConnected = await window.databaseAPI.checkConnection();
        if (isConnected) {
            console.log('База данных подключена');
        } else {
            console.log('База данных недоступна');
        }
    } catch (error) {
        console.error('Ошибка проверки подключения к базе данных:', error);
    }
}

// Обработчик регистрации
createacctbtn.addEventListener("click", async function () {
    var isVerified = true;
    signupEmail = signupEmailIn.value.trim();
    signupPassword = signupPasswordIn.value;
    confirmSignUpPassword = confirmSignUpPasswordIn.value;
    username = usernameIn.value.trim();

    // Валидация данных
    if (signupPassword !== confirmSignUpPassword) {
        window.alert("Поля пароля не совпадают. Попробуйте еще раз.");
        isVerified = false;
    }

    if (!signupEmail || !signupPassword || !confirmSignUpPassword || !username) {
        window.alert("Пожалуйста, заполните все обязательные поля.");
        isVerified = false;
    }

    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (signupEmail && !emailRegex.test(signupEmail)) {
        window.alert("Пожалуйста, введите корректный email!");
        isVerified = false;
    }

    // Проверка длины пароля
    if (signupPassword && signupPassword.length < 6) {
        window.alert("Пароль должен содержать минимум 6 символов!");
        isVerified = false;
    }

    if (isVerified) {
        // Показываем индикатор загрузки
        createacctbtn.textContent = 'Создание аккаунта...';
        createacctbtn.disabled = true;

        try {
            const result = await window.databaseAPI.createUser({
                email: signupEmail,
                username: username,
                password: signupPassword
            });

            if (result.success) {
                console.log("Успех! Аккаунт создан.");
                
                // Сохраняем данные пользователя в sessionStorage
                sessionStorage.setItem("userId", result.user.id);
                sessionStorage.setItem("userName", result.user.username);
                sessionStorage.setItem("userEmail", result.user.email);
                sessionStorage.setItem("userRole", result.user.role);
                
                // Переход на страницу тестов
                location.replace("./tests.html");
            } else {
                throw new Error(result.error || 'Неизвестная ошибка');
            }
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            window.alert("Ошибка регистрации: " + error.message);
        } finally {
            // Восстанавливаем кнопку
            createacctbtn.textContent = 'Create Account';
            createacctbtn.disabled = false;
        }
    }
});

// Обработчик входа
submitButton.addEventListener("click", async function () {
    email = emailInput.value.trim();
    password = passwordInput.value;
    
    // Проверяем, что поля не пустые
    if (!email || !password) {
        window.alert("Пожалуйста, заполните все поля!");
        return;
    }
    
    // Проверяем формат email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        window.alert("Пожалуйста, введите корректный email!");
        return;
    }
    
    // Проверяем сетевое подключение
    if (!navigator.onLine) {
        window.alert('Нет подключения к интернету!\n\nПожалуйста, проверьте ваше интернет-соединение и попробуйте снова.');
        return;
    }
    
    // Показываем индикатор загрузки
    submitButton.textContent = 'Вход...';
    submitButton.disabled = true;
    
    try {
        const result = await window.databaseAPI.authenticateUser({
            email: email,
            password: password
        });

        if (result.success) {
            console.log("Успех! Добро пожаловать!", result.user.id);
            
            // Сохраняем данные пользователя в sessionStorage
            sessionStorage.setItem("userId", result.user.id);
            sessionStorage.setItem("userName", result.user.username);
            sessionStorage.setItem("userEmail", result.user.email);
            sessionStorage.setItem("userRole", result.user.role);
            
                            // Переход на страницу тестов
                location.replace("./tests.html");
        } else {
            throw new Error(result.error || 'Неизвестная ошибка');
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        
        let userMessage = 'Ошибка входа';
        if (error.message.includes('Пользователь не найден')) {
            userMessage = 'Пользователь не найден. Проверьте email или зарегистрируйтесь.';
        } else if (error.message.includes('Неверный пароль')) {
            userMessage = 'Неверный пароль. Попробуйте еще раз.';
        } else if (error.message.includes('Нет подключения')) {
            userMessage = 'Ошибка сети.\n\nВозможные причины:\n• Проблемы с интернет-соединением\n• Проблемы с сервером\n\nПопробуйте:\n• Проверить интернет-соединение\n• Перезагрузить страницу';
        } else {
            userMessage = `Ошибка: ${error.message}`;
        }
        
        window.alert(userMessage);
    } finally {
        // Восстанавливаем кнопку
        submitButton.textContent = 'Submit';
        submitButton.disabled = false;
    }
});

// Обработчик сброса пароля (упрощенная версия)
forgetBtn.addEventListener("click", function () {
    email = emailInput.value.trim();
    
    if (!email) {
        window.alert("Пожалуйста, введите email для сброса пароля.");
        return;
    }
    
    // Проверяем формат email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        window.alert("Пожалуйста, введите корректный email!");
        return;
    }
    
    // В реальном приложении здесь был бы запрос к API для сброса пароля
    window.alert("Функция сброса пароля временно недоступна.\n\nОбратитесь к администратору для восстановления доступа.");
});

// Мониторинг состояния сети
window.addEventListener('online', function() {
    console.log('Сетевое подключение восстановлено');
    if (submitButton) submitButton.disabled = false;
    if (createacctbtn) createacctbtn.disabled = false;
});

window.addEventListener('offline', function() {
    console.log('Сетевое подключение потеряно');
    if (submitButton) submitButton.disabled = true;
    if (createacctbtn) createacctbtn.disabled = true;
    
    window.alert('Потеряно подключение к интернету!\n\nПожалуйста, проверьте ваше интернет-соединение.');
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkDatabaseConnection,
        authenticateUser: window.databaseAPI?.authenticateUser,
        createUser: window.databaseAPI?.createUser
    };
}
