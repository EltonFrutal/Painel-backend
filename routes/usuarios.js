const express = require('express');
const router = express.Router();
const pool = require('../db');

// [GET] - Listar usuários, com filtro por nome e organização
router.get('/', async (req, res) => {
  const { nome, numero_organizacao } = req.query;
  try {
    let query = 'SELECT * FROM usuarios';
    let params = [];
    let where = [];

    if (nome) {
      params.push(nome);
      where.push(`nome = $${params.length}`);
    }
    if (numero_organizacao) {
      params.push(numero_organizacao);
      where.push(`numero_organizacao = $${params.length}`);
    }

    if (where.length > 0) {
      query += ' WHERE ' + where.join(' AND ');
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
  const { nome, email, senha, numero_organizacao } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, numero_organizacao) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, email, senha, numero_organizacao]
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
  const { nome, email, senha, numero_organizacao } = req.body;
  try {
    const result = await pool.query(
      'UPDATE usuarios SET nome = $1, email = $2, senha = $3, numero_organizacao = $4 WHERE id_usuario = $5 RETURNING *',
      [nome, email, senha, numero_organizacao, id]
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

module.exports = router;