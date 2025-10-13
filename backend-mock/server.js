// backend-mock/server.js
const jsonServer = require('json-server');
const auth = require('json-server-auth');
const cors = require('cors');

const app = jsonServer.create();
const router = jsonServer.router('db.json');


// regras de acesso customizadas
const rules = require('./routes.json');
app.use(jsonServer.rewriter(rules));

app.db = router.db;

// Habilita CORS
app.use(cors());
app.use(jsonServer.defaults());

// Ativa a autenticação
app.use(auth);
app.use(router);

// Porta padrão 8000
app.listen(8000, () => {
  console.log('JSON Server está rodando na porta 8000');
});

