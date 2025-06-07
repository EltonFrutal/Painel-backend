const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../db');

// [GET] - Listar usuários, com filtro por organização
router.get('/', async (req, res) => {
  const { id_organizacao } = req.query;
  try {
    let query = 'SELECT * FROM usuarios';
    let params = [];
    if (id_organizacao) {
      query += ' WHERE id_organizacao = $1';
      params.push(id_organizacao);
    }
    query += ' ORDER BY id_usuario';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[GET /api/usuarios] Erro:', err);
    res.status(500).json({ erro: 'Erro ao buscar usuários', detalhes: err.message });
  }
});

// [POST] - Adicionar novo usuário
router.post('/', async (req, res) => {
  const { nome, email, senha_hash, id_organizacao } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, id_organizacao) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, email, senha_hash, id_organizacao]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[POST /api/usuarios] Erro:', err);
    res.status(400).json({ erro: 'Erro ao adicionar usuário.', detalhes: err.message });
  }
});

// [PUT] - Editar usuário
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha_hash, id_organizacao } = req.body;
  try {
    const result = await pool.query(
      'UPDATE usuarios SET nome = $1, email = $2, senha_hash = $3, id_organizacao = $4 WHERE id_usuario = $5 RETURNING *',
      [nome, email, senha_hash, id_organizacao, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ erro: 'Usuário não encontrado.' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error('[PUT /api/usuarios/:id] Erro:', err);
    res.status(500).json({ erro: 'Erro ao editar usuário', detalhes: err.message });
  }
});

// [DELETE] - Remover usuário
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ erro: 'Usuário não encontrado.' });
    } else {
      res.json({ sucesso: true, removido: result.rows[0] });
    }
  } catch (err) {
    console.error('[DELETE /api/usuarios/:id] Erro:', err);
    res.status(500).json({ erro: 'Erro ao remover usuário', detalhes: err.message });
  }
});

// [POST] - Login do usuário
router.post('/login', async (req, res) => {
  const { nome, senha, id_organizacao } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE nome = $1 AND id_organizacao = $2',
      [nome, id_organizacao]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(403).json({ erro: 'Senha incorreta.' });
    }

    delete usuario.senha_hash;
    res.json(usuario);
  } catch (err) {
    console.error('[POST /api/usuarios/login] Erro:', err);
    res.status(500).json({ erro: 'Erro ao realizar login', detalhes: err.message });
  }
});

module.exports = router;
