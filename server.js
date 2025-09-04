// Простой сервер для тестирования функций
const express = require('express');
const path = require('path');

// Загружаем переменные окружения из .env файла
try {
  require('dotenv').config();
} catch (error) {
  console.log('⚠️  dotenv не установлен, используем системные переменные окружения');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Импортируем функции
const createUser = require('./netlify/functions/create-user');
const authenticateUser = require('./netlify/functions/authenticate-user');
const saveQuizResult = require('./netlify/functions/save-quiz-result');
const getLeaderboard = require('./netlify/functions/get-leaderboard');
const getQuiz = require('./netlify/functions/get-quiz');
const healthCheck = require('./netlify/functions/health-check');

// Маршруты для API
app.post('/.netlify/functions/create-user', (req, res) => {
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify(req.body),
    headers: req.headers
  };
  const context = {};
  
  createUser.handler(event, context)
    .then(result => {
      res.status(result.statusCode).json(JSON.parse(result.body));
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

app.post('/.netlify/functions/authenticate-user', (req, res) => {
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify(req.body),
    headers: req.headers
  };
  const context = {};
  
  authenticateUser.handler(event, context)
    .then(result => {
      res.status(result.statusCode).json(JSON.parse(result.body));
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

app.post('/.netlify/functions/save-quiz-result', (req, res) => {
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify(req.body),
    headers: req.headers
  };
  const context = {};
  
  saveQuizResult.handler(event, context)
    .then(result => {
      res.status(result.statusCode).json(JSON.parse(result.body));
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

app.get('/.netlify/functions/get-leaderboard', (req, res) => {
  const event = {
    httpMethod: 'GET',
    queryStringParameters: req.query,
    headers: req.headers
  };
  const context = {};
  
  getLeaderboard.handler(event, context)
    .then(result => {
      res.status(result.statusCode).json(JSON.parse(result.body));
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

app.get('/.netlify/functions/get-quiz', (req, res) => {
  const event = {
    httpMethod: 'GET',
    queryStringParameters: req.query,
    headers: req.headers
  };
  const context = {};
  
  getQuiz.handler(event, context)
    .then(result => {
      res.status(result.statusCode).json(JSON.parse(result.body));
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

app.get('/.netlify/functions/health-check', (req, res) => {
  const event = {
    httpMethod: 'GET',
    queryStringParameters: req.query,
    headers: req.headers
  };
  const context = {};
  
  healthCheck.handler(event, context)
    .then(result => {
      res.status(result.statusCode).json(JSON.parse(result.body));
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

app.get('/.netlify/functions/get-all-users', (req, res) => {
  const event = {
    httpMethod: 'GET',
    queryStringParameters: req.query,
    headers: req.headers
  };
  const context = {};
  
  const getAllUsers = require('./netlify/functions/get-all-users');
  getAllUsers.handler(event, context)
    .then(result => {
      res.status(result.statusCode).json(JSON.parse(result.body));
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

app.post('/.netlify/functions/update-user-role', (req, res) => {
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify(req.body),
    headers: req.headers
  };
  const context = {};
  
  const updateUserRole = require('./netlify/functions/update-user-role');
  updateUserRole.handler(event, context)
    .then(result => {
      res.status(result.statusCode).json(JSON.parse(result.body));
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

app.post('/.netlify/functions/save-vip-access', (req, res) => {
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify(req.body),
    headers: req.headers
  };
  const context = {};
  
  const saveVipAccess = require('./netlify/functions/save-vip-access');
  saveVipAccess.handler(event, context)
    .then(result => {
      res.status(result.statusCode).json(JSON.parse(result.body));
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

app.get('/.netlify/functions/get-vip-access', (req, res) => {
  const event = {
    httpMethod: 'GET',
    queryStringParameters: req.query,
    headers: req.headers
  };
  const context = {};
  
  const getVipAccess = require('./netlify/functions/get-vip-access');
  getVipAccess.handler(event, context)
    .then(result => {
      res.status(result.statusCode).json(JSON.parse(result.body));
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Страница теста
app.get('/math_test.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'math_test.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log('📱 Откройте http://localhost:3001 для тестирования');
  console.log('🔗 API доступно по адресу http://localhost:3001/.netlify/functions/');
  console.log('');
  console.log('📋 Доступные API endpoints:');
  console.log('  GET  /.netlify/functions/health-check');
  console.log('  POST /.netlify/functions/create-user');
  console.log('  POST /.netlify/functions/authenticate-user');
  console.log('  POST /.netlify/functions/save-quiz-result');
  console.log('  GET  /.netlify/functions/get-leaderboard');
  console.log('  GET  /.netlify/functions/get-quiz');
  console.log('  GET  /.netlify/functions/get-all-users');
  console.log('  POST /.netlify/functions/update-user-role');
  console.log('  POST /.netlify/functions/save-vip-access');
  console.log('  GET  /.netlify/functions/get-vip-access');
});
