const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const vendasRoutes = require('./routes/vendas');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/vendas', vendasRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
