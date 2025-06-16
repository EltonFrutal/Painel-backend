const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Importação das rotas
const authRoutes = require('./routes/auth');
const vendasRoutes = require('./routes/vendas');
const organizacaoRoutes = require('./routes/organizacao');
const usuariosRoutes = require('./routes/usuarios');
const empresasRoutes = require('./routes/empresas'); // ✅ NOVA ROTA

const app = express();

// Middlewares globais
app.use(cors());
app.use(bodyParser.json());

// Rotas com prefixo /api
app.use('/api/auth', authRoutes);
app.use('/api/vendas', vendasRoutes);
app.use('/api/organizacao', organizacaoRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/empresas', empresasRoutes); // ✅ REGISTRAR AQUI

// Rota simples de teste
app.get('/teste-api', (req, res) => {
  res.send('Teste direto do index OK');
});

// Inicialização do servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});