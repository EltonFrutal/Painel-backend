const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Importação das rotas
const authRoutes = require('./routes/auth');
const vendasRoutes = require('./routes/vendas');
const organizacaoRoutes = require('./routes/organizacao');
const usuariosRoutes = require('./routes/usuarios'); // <--- Adicionada esta linha

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rotas principais
app.use('/auth', authRoutes);
app.use('/vendas', vendasRoutes);
app.use('/api/organizacao', organizacaoRoutes);
app.use('/api/usuarios', usuariosRoutes); // <--- Adicionada esta linha

// Rota simples de teste
app.get('/teste-api', (req, res) => {
  res.send('Teste direto do index OK');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});