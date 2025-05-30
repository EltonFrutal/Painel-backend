const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();

// Cadastro de usuário
router.post('/register', async (req, res) => {
  const { nome, email, senha, id_organizacao } = req.body;
  const hash = await bcrypt.hash(senha, 10);
  try {
    await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, id_organizacao) VALUES ($1, $2, $3, $4)',
      [nome, email, hash, id_organizacao]
    );
    res.json({ message: 'Usuário cadastrado!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];
    if (user && await bcrypt.compare(senha, user.senha_hash)) {
      res.json({ message: 'Login OK', user: { id: user.id, nome: user.nome, id_organizacao: user.id_organizacao } });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
