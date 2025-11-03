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

// === REGRAS DE PERMISSÃO ===
const rules = auth.rewriter({
  "/api/*": "/$1",

  "/users*": "600 role:diretor",
  "/users/:id": "640 role:diretor",

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

  "/controls*": "600 role:diretor",
  "/controls/:id": "640 role:diretor",

  "/notes*": "600",
  "/notes/:id": "640",

  "/widgetPositions": "600",
  "/globalSettings": "600",
  "/rolePermissions": "600 role:diretor",
  "/userSpecificPermissions": "600 role:diretor",
  "/globalNotifications": "600 role:diretor"
});

server.use(rules);

// === LOGIN PERSONALIZADO POR USERNAME ===
server.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: 'Username e senha são obrigatórios' });

  const db = router.db;
  const users = db.get('users').value();

  const user = users.find(u => u.name === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Usuário ou senha inválidos' });

  const { password: _, ...safeUser } = user;
  const accessToken = Buffer.from(`${user.id}:${Date.now()}:${Math.random()}`).toString('base64');

  res.json({ accessToken, user: safeUser });
});

// === CRIA CONFIGURAÇÕES PADRÃO AO CRIAR NOVO USUÁRIO ===
server.post('/users', (req, res, next) => {
  const db = router.db;
  const newUser = req.body;

  next(); // Criação padrão

  setTimeout(() => {
    const existing = db.get('userSettings').find({ userId: newUser.id }).value();
    if (existing) return;

    const newUserSettings = {
      ...db.get('defaultUserSettings').value(),
      id: Date.now(),
      userId: newUser.id
    };

    db.get('userSettings').push(newUserSettings).write();
    console.log(`Configurações padrão criadas para o usuário ID ${newUser.id}`);
  }, 300);
});

// === REMOVE CONFIGURAÇÕES E REGISTROS AO DELETAR USUÁRIO ===
server.delete('/users/:id', (req, res, next) => {
  const db = router.db;
  const userId = parseInt(req.params.id, 10);

  next(); // Exclusão padrão

  setTimeout(() => {
    // Remove userSettings
    db.get('userSettings').remove({ userId }).write();

    // Remove registros relacionados ao usuário
    const collectionsToClean = ['notes', 'assessments', 'followUps', 'placements'];
    collectionsToClean.forEach(collection => {
      db.get(collection).remove({ registeredBy: userId }).write();
    });

    console.log(`Usuário ID ${userId} e todos os registros relacionados foram removidos.`);
  }, 300);
});


// === APLICA AUTENTICAÇÃO NAS ROTAS /api ===
server.use('/api', auth);

// === ROTEADOR PADRÃO ===
server.use(router);

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`JSON Server rodando em http://localhost:${PORT}`);
  console.log(`Teste login: POST /login`);
  console.log(`Body: { "username": "Diretor", "password": "admin" }`);
});
