// Firebase инициализация (если еще не инициализирован и Firebase доступен)
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
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
  console.log('script.js - Firebase инициализирован');
} else if (typeof firebase !== 'undefined') {
  console.log('script.js - Firebase уже инициализирован');
} else {
  console.log('script.js - Firebase недоступен');
}

// Создаем глобальные переменные auth и database
if (typeof firebase !== 'undefined') {
  if (!window.auth) {
    window.auth = firebase.auth();
    console.log('script.js - Создан window.auth');
  }
  if (!window.database) {
    window.database = firebase.database();
    console.log('script.js - Создан window.database');
  }
}

// Используем глобальные переменные auth и database
const auth = window.auth;
const database = window.database;

// Логируем состояние переменных для отладки
console.log('script.js - window.auth:', window.auth);
console.log('script.js - window.database:', window.database);
console.log('script.js - firebase доступен:', typeof firebase !== 'undefined');
console.log('script.js - локальная auth:', auth);
console.log('script.js - локальная database:', database);

// Используем userId из sessionStorage или глобальной переменной
var userId = sessionStorage.getItem("userId") || window.userId;
console.log('userId из script.js:', userId);
//selecting all required elements
const start_btn = document.querySelector(".start_btn button");
const info_box = document.querySelector(".info_box");
const exit_btn = info_box ? info_box.querySelector(".buttons .quit") : null;
const continue_btn = info_box ? info_box.querySelector(".buttons .restart") : null;
const quiz_box = document.querySelector(".quiz_box");
const result_box = document.querySelector(".result_box");
const option_list = document.querySelector(".option_list");
const time_line = document.querySelector("header .time_line");
const timeText = document.querySelector(".timer .time_left_txt");
const timeCount = document.querySelector(".timer .timer_sec");
const waitTxt = result_box ? result_box.querySelector(".wait_text") : null;

// if startQuiz button clicked
if (start_btn && info_box) {
  start_btn.onclick = () => {
    start_btn.style.display = "none"; //hide start button
    info_box.classList.add("activeInfo"); //show info box
  };
}

// if exitQuiz button clicked
if (exit_btn && info_box) {
  exit_btn.onclick = () => {
    // info_box.classList.remove("activeInfo"); //hide info box
    location.replace("./tests.html");
  };
}

// if continueQuiz button clicked
if (continue_btn && info_box && quiz_box) {
  continue_btn.onclick = () => {
    info_box.classList.remove("activeInfo"); //hide info box
    quiz_box.classList.add("activeQuiz"); //show quiz box
    showQuetions(0); //calling showQestions function
    queCounter(1); //passing 1 parameter to queCounter
    startTimer(15); //calling startTimer function
    startTimerLine(0); //calling startTimerLine function
  };
}

let timeValue = 15;
let que_count = 0;
let que_numb = 1;
let userScore = 0;
let counter;
let counterLine;
let widthValue = 0;

const quit_quiz = result_box ? result_box.querySelector(".buttons .quit") : null;
const leaderBoard = result_box ? result_box.querySelector(".buttons .leaderboard") : null;
const matchingData = document.querySelector(".matching-data");

// if quitQuiz button clicked
if (quit_quiz) {
  quit_quiz.onclick = () => {
    location.replace("./tests.html"); //возврат к тестам
  };
}

// if leaderBoard button clicked
if (leaderBoard && matchingData) {
  leaderBoard.onclick = () => {
    // show the rank list
    var data = [];

    const testId = 'Математика_1_1'; // ID для математического теста
    
    if (window.database && typeof firebase !== 'undefined') {
      console.log('Загружаем данные из Firebase...');
      window.database.ref("Leaderboards/" + testId).once("value")
        .then(function (snapshot) {
          data = [];
          snapshot.forEach(function (childSnapshot) {
            var user_name, score;
            var childData = childSnapshot.val();
            if (childData) {
              user_name = childData.name || 'Пользователь';
              score = childData.score || 0;
              data.push({ Score: score, name: user_name });
            }
          });
          
          console.log('Получены данные:', data);
          displayLeaderboard(data);
        })
        .catch(function (error) {
          console.log("Ошибка загрузки данных:", error);
          displayLeaderboard([]);
        });
    } else {
      console.log("Firebase или database недоступен");
      displayLeaderboard([]);
    }
  };
}

const next_btn = document.querySelector("footer .next_btn");
const bottom_ques_counter = document.querySelector("footer .total_que");

// if Next Que button clicked
if (next_btn) {
  next_btn.onclick = () => {
    if (que_count < questions.length - 1) {
      //if question count is less than total question length
      que_count++; //increment the que_count value
      que_numb++; //increment the que_numb value
      showQuetions(que_count); //calling showQestions function
      queCounter(que_numb); //passing que_numb value to queCounter
      clearInterval(counter); //clear counter
      clearInterval(counterLine); //clear counterLine
      startTimer(timeValue); //calling startTimer function
      startTimerLine(widthValue); //calling startTimerLine function
      timeText.textContent = "Time Left"; //change the timeText to Time Left
      next_btn.classList.remove("show"); //hide the next button
    } else {
      clearInterval(counter); //clear counter
      clearInterval(counterLine); //clear counterLine
      showResult(); //calling showResult function
    }
  };
}

// getting questions and options from array
function showQuetions(index) {
  const que_text = document.querySelector(".que_text");
  if (!que_text || !option_list) return;
  //creating a new span and div tag for question and option and passing the value using array index
  let que_tag =
    "<span>" +
    questions[index].numb +
    ". " +
    questions[index].question +
    "</span>";
  let option_tag =
    '<div class="option"><span>' +
    questions[index].options[0] +
    "</span></div>" +
    '<div class="option"><span>' +
    questions[index].options[1] +
    "</span></div>" +
    '<div class="option"><span>' +
    questions[index].options[2] +
    "</span></div>" +
    '<div class="option"><span>' +
    questions[index].options[3] +
    "</span></div>";
  que_text.innerHTML = que_tag; //adding new span tag inside que_tag
  option_list.innerHTML = option_tag; //adding new div tag inside option_tag

  const option = option_list.querySelectorAll(".option");

  // set onclick attribute to all available options
  for (i = 0; i < option.length; i++) {
    option[i].setAttribute("onclick", "optionSelected(this)");
  }
}
// creating the new div tags which for icons
let tickIconTag = '<div class="icon tick"><i class="fas fa-check"></i></div>';
let crossIconTag = '<div class="icon cross"><i class="fas fa-times"></i></div>';

//if user clicked on option
function optionSelected(answer) {
  clearInterval(counter); //clear counter
  clearInterval(counterLine); //clear counterLine
  let userAns = answer.querySelector('span').textContent; //getting user selected option from span
  let correcAns = questions[que_count].answer; //getting correct answer from array
  const allOptions = option_list.children.length; //getting all option items

  if (userAns == correcAns) {
    //if user selected option is equal to array's correct answer
    userScore += 1; //upgrading score value with 1
    answer.classList.add("correct"); //adding green color to correct selected option
    answer.insertAdjacentHTML("beforeend", tickIconTag); //adding tick icon to correct selected option
    console.log("Correct Answer");
    console.log("Your correct answers = " + userScore);
  } else {
    answer.classList.add("incorrect"); //adding red color to correct selected option
    answer.insertAdjacentHTML("beforeend", crossIconTag); //adding cross icon to correct selected option
    console.log("Wrong Answer");

    for (i = 0; i < allOptions; i++) {
      if (option_list.children[i].querySelector('span').textContent == correcAns) {
        //if there is an option which is matched to an array answer
        option_list.children[i].setAttribute("class", "option correct"); //adding green color to matched option
        option_list.children[i].insertAdjacentHTML("beforeend", tickIconTag); //adding tick icon to matched option
        console.log("Auto selected correct answer.");
      }
    }
  }
  for (i = 0; i < allOptions; i++) {
    option_list.children[i].classList.add("disabled"); //once user select an option then disabled all options
  }
  next_btn && next_btn.classList.add("show"); //show the next button if user selected any option
}

function showResult() {
  if (!info_box || !quiz_box || !result_box) return;
  info_box.classList.remove("activeInfo"); //hide info box
  quiz_box.classList.remove("activeQuiz"); //hide quiz box
  result_box.classList.add("activeResult"); //show result box
  const scoreText = result_box.querySelector(".score_text");

  // Определяем ID теста
  const testId = 'Математика_1_1'; // ID для математического теста
  const userName = sessionStorage.getItem('userName') || 'Пользователь';

  // Сохраняем результат в таблицу лидеров
  console.log('showResult - userId:', userId);
  console.log('showResult - database:', database);
  console.log('showResult - window.database:', window.database);
  
  // Используем window.database напрямую
  if (window.database && userId) {
    window.database
      .ref("/Leaderboards/" + testId + "/" + userId)
      .set({
        name: userName,
        score: userScore,
        timestamp: Date.now()
      })
      .then((res) => {
        console.log("Результат сохранен в таблицу лидеров.");
        waitTxt && waitTxt.classList.add("hidden");
        leaderBoard && leaderBoard.classList.remove("hidden");
        quit_quiz && quit_quiz.classList.remove("hidden");
      })
      .catch((error) => {
        console.log("Ошибка сохранения результата:", error);
        waitTxt && waitTxt.classList.add("hidden");
        leaderBoard && leaderBoard.classList.remove("hidden");
        quit_quiz && quit_quiz.classList.remove("hidden");
      });
  } else {
    console.log("Firebase или userId недоступны. window.database:", window.database, "userId:", userId);
    waitTxt && waitTxt.classList.add("hidden");
    leaderBoard && leaderBoard.classList.remove("hidden");
    quit_quiz && quit_quiz.classList.remove("hidden");
  }

  if (userScore > 7) {
    // Отличный результат
    let scoreTag =
      "<span>Отлично! Вы получили <p>" +
      userScore +
      "</p> из <p>" +
      questions.length +
      "</p> баллов</span>";
    scoreText.innerHTML = scoreTag;
  } else if (userScore > 5) {
    // Хороший результат
    let scoreTag =
      "<span>Хорошо! Вы получили <p>" +
      userScore +
      "</p> из <p>" +
      questions.length +
      "</p> баллов</span>";
    scoreText.innerHTML = scoreTag;
  } else if (userScore > 3) {
    // Удовлетворительный результат
    let scoreTag =
      "<span>Неплохо! Вы получили <p>" +
      userScore +
      "</p> из <p>" +
      questions.length +
      "</p> баллов</span>";
    scoreText.innerHTML = scoreTag;
  } else {
    // Нужно подтянуть знания
    let scoreTag =
      "<span>К сожалению, вы получили только <p>" +
      userScore +
      "</p> из <p>" +
      questions.length +
      "</p> баллов. Попробуйте еще раз!</span>";
    scoreText.innerHTML = scoreTag;
  }
}

function startTimer(time) {
  if (!timeCount) return;
  counter = setInterval(timer, 1000);
  function timer() {
    timeCount.textContent = time; //changing the value of timeCount with time value
    time--; //decrement the time value
    if (time < 9) {
      //if timer is less than 9
      let addZero = timeCount.textContent;
      timeCount.textContent = "0" + addZero; //add a 0 before time value
    }
    if (time < 0) {
      //if timer is less than 0
      clearInterval(counter); //clear counter
      timeText && (timeText.textContent = "Time Off"); //change the time text to time off
      const allOptions = option_list ? option_list.children.length : 0; //getting all option items
      let correcAns = questions[que_count].answer; //getting correct answer from array
      for (i = 0; i < allOptions; i++) {
        if (option_list.children[i].querySelector('span').textContent == correcAns) {
          //if there is an option which is matched to an array answer
          option_list.children[i].setAttribute("class", "option correct"); //adding green color to matched option
          option_list.children[i].insertAdjacentHTML("beforeend", tickIconTag); //adding tick icon to matched option
          console.log("Time Off: Auto selected correct answer.");
        }
      }
      for (i = 0; i < allOptions; i++) {
        option_list.children[i].classList.add("disabled"); //once user select an option then disabled all options
      }
      next_btn && next_btn.classList.add("show"); //show the next button if user selected any option
    }
  }
}

function startTimerLine(time) {
  if (!time_line) return;
  counterLine = setInterval(timer, 29);
  function timer() {
    time += 1; //upgrading time value with 1
    time_line.style.width = time + "px"; //increasing width of time_line with px by time value
    if (time > 549) {
      //if time value is greater than 549
      clearInterval(counterLine); //clear counterLine
    }
  }
}

function queCounter(index) {
  if (!bottom_ques_counter) return;
  //creating a new span tag and passing the question number and total question
  let totalQueCounTag =
    "<span>" +
    index +
    " из " +
    questions.length +
    " вопросов</span>";
  bottom_ques_counter.innerHTML = totalQueCounTag; //adding new span tag inside bottom_ques_counter
}

// fror leaderboard model
const modal = document.querySelector(".modal");
const btnCloseModal = document.querySelector(".close-modal");
const overlay = document.querySelector(".overlay");

// querrySelectorAll used for selecting all elements having same class
const btnOpenModal = document.querySelector(".show-modal");

if (btnOpenModal && btnCloseModal && overlay && modal) {
  const closeModal = function () {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
  };

  const openModal = function () {
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
  };

  btnOpenModal.addEventListener("click", openModal);
  btnCloseModal.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
}

// Универсальная логика для модального окна таблицы лидеров
(function() {
  const modal = document.querySelector('.modal');
  const btnOpenModal = document.querySelector('.show-modal');
  const btnCloseModal = document.querySelector('.close-modal');
  const closeLeaderboardBtn = document.querySelector('.close-leaderboard-btn');
  const restartQuizBtn = document.querySelector('.restart-quiz-btn');

  if (modal && btnOpenModal && btnCloseModal) {
    btnOpenModal.addEventListener('click', function () {
      modal.classList.add('show-modal');
      modal.classList.remove('hidden');
    });
    btnCloseModal.addEventListener('click', function () {
      modal.classList.remove('show-modal');
      modal.classList.add('hidden');
    });
    
    // Кнопка "Закрыть" в футере
    if (closeLeaderboardBtn) {
      closeLeaderboardBtn.addEventListener('click', function () {
        modal.classList.remove('show-modal');
        modal.classList.add('hidden');
      });
    }
    
    // Кнопка "Пройти тест снова" в футере
    if (restartQuizBtn) {
      restartQuizBtn.addEventListener('click', function () {
        modal.classList.remove('show-modal');
        modal.classList.add('hidden');
        // Перезапуск теста
        if (typeof restartQuiz === 'function') {
          restartQuiz();
        }
      });
    }
    
    // Закрытие по клику по фону
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        modal.classList.remove('show-modal');
        modal.classList.add('hidden');
      }
    });
  }
})();

// Функция для отображения таблицы лидеров
function displayLeaderboard(data) {
  if (!matchingData) return;
  
  matchingData.innerHTML = "";
  
  if (data.length === 0) {
    matchingData.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 20px; color: #666;">
          Пока нет результатов. Будьте первым!
        </td>
      </tr>
    `;
    return;
  }
  
  var sortedData = data.sort((d1, d2) =>
    d1.Score < d2.Score ? 1 : d1.Score > d2.Score ? -1 : 0
  );
  
  console.log('Отсортированные данные:', sortedData);
  
  var count = 1;
  var prevScore = -1;
  
  sortedData.forEach((d, index) => {
    if (index > 0 && d.Score < prevScore) {
      count++;
    }
    prevScore = d.Score;
    
    var medal = "";
    if (count == 1) {
      medal = "🥇";
    } else if (count == 2) {
      medal = "🥈";
    } else if (count == 3) {
      medal = "🥉";
    }
    
    const html = `
    <tr class="d">
      <td class="name">${medal} ${count}</td>
      <td class="age">${d.name}</td>
      <td class="religion">${d.Score}</td>
      <td class="time">-</td>
    </tr>`;
    matchingData.insertAdjacentHTML("beforeend", html);
  });
}

// Функция для перезапуска теста
function restartQuiz() {
  // Сбрасываем все переменные
  que_count = 0;
  que_numb = 1;
  userScore = 0;
  widthValue = 0;
  
  // Очищаем таймеры
  if (counter) clearInterval(counter);
  if (counterLine) clearInterval(counterLine);
  
  // Скрываем все блоки
  if (info_box) info_box.classList.remove("activeInfo");
  if (quiz_box) quiz_box.classList.remove("activeQuiz");
  if (result_box) result_box.classList.remove("activeResult");
  
  // Показываем стартовую кнопку
  if (start_btn) start_btn.style.display = "block";
  
  // Скрываем кнопки результатов
  if (waitTxt) waitTxt.classList.remove("hidden");
  if (leaderBoard) leaderBoard.classList.add("hidden");
  if (quit_quiz) quit_quiz.classList.add("hidden");
}
