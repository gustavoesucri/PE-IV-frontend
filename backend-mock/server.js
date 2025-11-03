// server.js
const jsonServer = require('json-server');
const auth = require('json-server-auth');
const fs = require('fs');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// === PARSER DE JSON ===
server.use(jsonServer.bodyParser);
server.use(middlewares);

// === REGRAS DE PERMISSÃO SIMPLIFICADAS ===
const rules = auth.rewriter({
  "/api/*": "/$1",
  "/users*": "600",
  "/users/:id": "600",
  "/userSettings*": "600", 
  "/userSettings/:id": "600",
  "/students*": "600",
  "/students/:id": "640",
  "/companies*": "600",
  "/companies/:id": "640",
  "/assessments*": "600",
  "/assessments/:id": "640",
  "/followUps*": "600",
  "/followUps/:id": "640",
  "/placements*": "600",
  "/placements/:id": "640",
  "/controls*": "600",
  "/controls/:id": "640",
  "/notes*": "600",
  "/notes/:id": "640"
});

server.use(rules);

// === LOGIN PERSONALIZADO POR USERNAME ===
server.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  
  console.log('Tentativa de login:', { username, password });
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username e senha são obrigatórios' });
  }

  const db = router.db;
  const users = db.get('users').value();

  // Busca usuário por username (campo correto)
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    console.log('Usuário não encontrado ou senha incorreta');
    return res.status(401).json({ message: 'Usuário ou senha inválidos' });
  }

  // Cria um token simples (não JWT)
  const token = Buffer.from(`${user.id}:${user.username}:${Date.now()}`).toString('base64');
  const { password: _, ...safeUser } = user;

  console.log('Login bem-sucedido para:', user.username);
  
  res.json({
    accessToken: token,
    user: safeUser
  });
});

// === MIDDLEWARE DE AUTENTICAÇÃO SIMPLES ===
server.use((req, res, next) => {
  // Rotas públicas
  if (req.path === '/login' && req.method === 'POST') {
    return next();
  }

  // Para outras rotas, verifica o token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso necessário' });
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('ascii');
    const [userId, username, timestamp] = decoded.split(':');
    
    // Verifica se o usuário existe
    const user = router.db.get('users').find({ id: parseInt(userId) }).value();
    if (!user || user.username !== username) {
      return res.status(403).json({ message: 'Token inválido' });
    }

    // Adiciona usuário à requisição
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
});

// === MIDDLEWARE DE AUTORIZAÇÃO ===
server.use((req, res, next) => {
  // Usuário só pode acessar seus próprios dados
  if (req.path.startsWith('/api/users/') && req.method === 'PATCH') {
    const userId = req.path.split('/').pop();
    if (parseInt(userId) !== req.user.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
  }

  if (req.path.startsWith('/api/userSettings')) {
    if (req.method === 'GET') {
      const queryUserId = req.query.userId;
      if (queryUserId && parseInt(queryUserId) !== req.user.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
    }
    
    if (req.method === 'PATCH') {
      const settingsId = req.path.split('/').pop();
      const userSettings = router.db.get('userSettings').find({ id: parseInt(settingsId) }).value();
      
      if (userSettings && userSettings.userId !== req.user.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
    }
  }
  
  next();
});

// === CRIA CONFIGURAÇÕES PADRÃO AO CRIAR NOVO USUÁRIO ===
server.post('/api/users', (req, res, next) => {
  const db = router.db;
  
  // Adiciona ID automaticamente
  const users = db.get('users').value();
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  
  const newUser = {
    ...req.body,
    id: newId
  };

  // Continua com a criação padrão
  req.body = newUser;
  next();

  // Cria userSettings automaticamente
  setTimeout(() => {
    const existing = db.get('userSettings').find({ userId: newId }).value();
    if (existing) return;

    const newUserSettings = {
      ...db.get('defaultUserSettings').value(),
      id: Date.now(),
      userId: newId
    };

    db.get('userSettings').push(newUserSettings).write();
    console.log(`Configurações padrão criadas para o usuário ID ${newId} (${newUser.username})`);
  }, 300);
});

// === ROTEADOR PADRÃO ===
server.use(router);

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`JSON Server rodando em http://localhost:${PORT}`);
  console.log(`Teste login: POST /login`);
  console.log(`Body: { "username": "Diretor", "password": "admin" }`);
  console.log(`Usuário disponível: Diretor / admin`);
});