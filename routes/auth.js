const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// POST /auth/login
router.post('/login', async (req, res) => {
  const { nome, senha, id_organizacao } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE nome = $1 AND id_organizacao = $2',
      [nome, id_organizacao]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    const usuario = result.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Senha inválida.' });
    }

    delete usuario.senha_hash; // remove a senha antes de enviar para o frontend
    res.json({ user: usuario });
  } catch (err) {
    console.error('[POST /auth/login] Erro:', err);
    res.status(500).json({ error: 'Erro interno ao fazer login.' });
  }
});

module.exports = router;