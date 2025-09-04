const firebaseConfig = {
  apiKey: "AIzaSyA-9UrtC3wijNGNS0QsaeF_tEGxJ8tuZeE",
  authDomain: "quizapp-e0401.firebaseapp.com",
  databaseURL: "https://quizapp-e0401-default-rtdb.firebaseio.com",
  projectId: "quizapp-e0401",
  storageBucket: "quizapp-e0401.firebasestorage.app",
  messagingSenderId: "104150965733",
  appId: "1:104150965733:web:2532b20f84a4435d3b630c",
  measurementId: "G-Y7X0E1QYKH"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const submitButton = document.getElementById("submit");
const signupButton = document.getElementById("sign-up");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const main = document.getElementById("main");
const createacct = document.getElementById("create-acct");
const signupEmailIn = document.getElementById("email-signup");
const usernameIn = document.getElementById("username-signup");
const signupPasswordIn = document.getElementById("password-signup");
const confirmSignUpPasswordIn = document.getElementById(
  "confirm-password-signup"
);
const createacctbtn = document.getElementById("create-acct-btn");
const forgetBtn = document.querySelector(".forget-btn");

// const returnBtn = document.getElementById("return-btn");

var email,
  password,
  signupEmail,
  signupPassword,
  confirmSignUpPassword,
  username,
  userId;

createacctbtn.addEventListener("click", function () {
  var isVerified = true;
  signupEmail = signupEmailIn.value;

  signupPassword = signupPasswordIn.value;
  confirmSignUpPassword = confirmSignUpPasswordIn.value;
  if (signupPassword != confirmSignUpPassword) {
    window.alert("Password fields do not match. Try again.");
    isVerified = false;
  }

  username = usernameIn.value;
  if (
    signupEmail == null ||
    signupPassword == null ||
    confirmSignUpPassword == null
  ) {
    window.alert("Please fill out all required fields.");
    isVerified = false;
  }

  if (isVerified) {
    auth
      .createUserWithEmailAndPassword(signupEmail, signupPassword)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // ...
        console.log("Success! Account created.");
        sessionStorage.setItem("userId", auth.currentUser.uid);
        sessionStorage.setItem("userName", username);
        sessionStorage.setItem("userEmail", signupEmail);
        // console.log(auth.currentUser.uid);
        database
          .ref("/Users/" + auth.currentUser.uid)
          .set({
            Basic_info: {
              email_id: signupEmail,
              user_name: username,
              role: 'user', // По умолчанию обычный пользователь
            },
          })
          .then((res) => {
            console.log("Data added to database.");
            location.replace("./tests.html"); // <-- переход на tests.html
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
        console.log(errorMessage);
        window.alert("Ошибка регистрации: " + errorMessage); // Показываем причину ошибки
      });
  }
});

submitButton.addEventListener("click", function () {
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
  
  console.log('Попытка входа с email:', email);
  console.log('Email после trim():', email);
  console.log('Длина email:', email.length);
  
  // Проверяем сетевое подключение
  if (!navigator.onLine) {
    window.alert('Нет подключения к интернету!\n\nПожалуйста, проверьте ваше интернет-соединение и попробуйте снова.');
    return;
  }
  
  // Показываем индикатор загрузки
  submitButton.textContent = 'Вход...';
  submitButton.disabled = true;
  
  // Функция для попытки входа с retry
  function attemptLogin(retryCount = 0) {
    console.log(`Попытка входа #${retryCount + 1}`);
    
    // Прямая попытка входа через Firebase Auth
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Успешный вход
        const user = userCredential.user;
        sessionStorage.setItem("userId", user.uid);
        console.log("Success! Welcome back!", user.uid);
        
        // Загружаем данные пользователя и сохраняем в sessionStorage
        database.ref("/Users/" + user.uid + "/Basic_info").once('value').then(snap => {
          const data = snap.val();
          if (data) {
            sessionStorage.setItem("userName", data.user_name);
            sessionStorage.setItem("userEmail", data.email_id);
            sessionStorage.setItem("userRole", data.role || 'user');
          }
          location.replace("./tests.html");
        }).catch(error => {
          console.log("Ошибка загрузки данных пользователя:", error);
          // Восстанавливаем кнопку перед переходом
          submitButton.textContent = 'Submit';
          submitButton.disabled = false;
          location.replace("./tests.html");
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(`Ошибка входа (попытка #${retryCount + 1}):`, error);
        console.log('Код ошибки:', errorCode);
        console.log('Сообщение ошибки:', errorMessage);
        
        // Если это сетевая ошибка и есть попытки, пробуем еще раз
        if ((errorCode === 'auth/network-request-failed' || errorCode === 'auth/internal-error') && retryCount < 2) {
          console.log(`Повторная попытка через 2 секунды... (${retryCount + 1}/3)`);
          setTimeout(() => {
            attemptLogin(retryCount + 1);
          }, 2000);
          return;
        }
        
        // Если все попытки исчерпаны или другая ошибка
        let userMessage = 'Ошибка входа';
        if (errorCode === 'auth/user-not-found') {
          userMessage = 'Пользователь не найден. Проверьте email или зарегистрируйтесь.';
        } else if (errorCode === 'auth/wrong-password') {
          userMessage = 'Неверный пароль. Попробуйте еще раз.';
        } else if (errorCode === 'auth/invalid-email') {
          userMessage = 'Неверный формат email.';
        } else if (errorCode === 'auth/invalid-login-credentials') {
          userMessage = 'Неверные учетные данные. Проверьте email и пароль.';
        } else if (errorCode === 'auth/internal-error') {
          userMessage = 'Внутренняя ошибка сервера после 3 попыток. Попробуйте позже.';
        } else if (errorCode === 'auth/too-many-requests') {
          userMessage = 'Слишком много попыток входа. Попробуйте позже.';
        } else if (errorCode === 'auth/network-request-failed') {
          userMessage = 'Ошибка сети после 3 попыток.\n\nВозможные причины:\n• Проблемы с интернет-соединением\n• Блокировка Google API\n• Проблемы с DNS\n\nПопробуйте:\n• Проверить интернет-соединение\n• Перезагрузить страницу\n• Использовать VPN';
        } else if (errorCode === 'auth/operation-not-allowed') {
          userMessage = 'Вход по email/паролю отключен. Обратитесь к администратору.';
        } else {
          userMessage = `Ошибка: ${errorMessage}`;
        }
        
        // Проверяем, что введено пользователем
        console.log('Введенный email:', email);
        console.log('Введенный пароль:', password ? '***' : 'пусто');
        
        // Дополнительная диагностика
        console.log('Длина пароля:', password ? password.length : 0);
        console.log('Email содержит @:', email.includes('@'));
        console.log('Email содержит точку:', email.includes('.'));
        
        // Восстанавливаем кнопку
        submitButton.textContent = 'Submit';
        submitButton.disabled = false;
        
        // Показываем сообщение об ошибке
        window.alert(userMessage);
      });
  }
  
  // Начинаем попытку входа
  attemptLogin();
});

// reseting password
forgetBtn.addEventListener("click", function () {
  email = emailInput.value;
  auth
    .sendPasswordResetEmail(email)
    .then(() => {
      window.alert("Password reset email sent, check your inbox. ");
    })
    .catch((error) => {
      window.alert(error);
    });
});





// Мониторинг состояния сети
window.addEventListener('online', function() {
  console.log('Сетевое подключение восстановлено');
  if (document.getElementById('submit')) {
    document.getElementById('submit').disabled = false;
  }
});

window.addEventListener('offline', function() {
  console.log('Сетевое подключение потеряно');
  if (document.getElementById('submit')) {
    document.getElementById('submit').disabled = true;
  }
  
  window.alert('Потеряно подключение к интернету!\n\nПожалуйста, проверьте ваше интернет-соединение.');
});

// Проверка состояния сети и Firebase при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  console.log('=== СТАТУС СИСТЕМЫ ПРИ ЗАГРУЗКЕ ===');
  console.log('Online статус:', navigator.onLine);
  console.log('User Agent:', navigator.userAgent);
  console.log('Текущий URL:', window.location.href);
  console.log('Время загрузки:', new Date().toISOString());
  
  // Проверяем состояние Firebase
  console.log('Firebase Auth доступен:', !!auth);
  console.log('Firebase Database доступен:', !!database);
  
  if (!navigator.onLine) {
    window.alert('Внимание! Нет подключения к интернету.\n\nПожалуйста, проверьте ваше интернет-соединение перед попыткой входа.');
  }
  
  // Проверяем доступность Firebase Auth
  if (auth) {
    auth.onAuthStateChanged(function(user) {
      if (user) {
        console.log('Firebase Auth работает, пользователь:', user.uid);
      } else {
        console.log('Firebase Auth работает, пользователь не аутентифицирован');
      }
    });
  } else {
    console.error('Firebase Auth недоступен!');
  }
  
  // Проверяем доступность Firebase Database
  if (database) {
    database.ref('.info/connected').on('value', function(snap) {
      if (snap.val() === true) {
        console.log('Firebase Database подключен');
      } else {
        console.log('Firebase Database не подключен');
      }
    });
  } else {
    console.error('Firebase Database недоступен!');
  }
});
