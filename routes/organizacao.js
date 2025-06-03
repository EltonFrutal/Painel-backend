const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET - Listar todas as organizações
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM organizacao ORDER BY id_organizacao');
    res.json(result.rows);
  } catch (err) {
    console.error('[GET /api/organizacao] Erro:', err);
    res.status(500).json({ erro: 'Erro ao buscar organizacao', detalhes: err.message });
  }
});

// POST - Adicionar nova organização
router.post('/', async (req, res) => {
  const { id_organizacao, nome_organizacao } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO organizacao (id_organizacao, nome_organizacao) VALUES ($1, $2) RETURNING *',
      [id_organizacao, nome_organizacao]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[POST /api/organizacao] Erro:', err);
    if (err.code === "23505") {
      res.status(409).json({ erro: 'Já existe uma organização com esse código.' });
    } else {
      res.status(400).json({ erro: 'Erro ao adicionar organização.', detalhes: err.message });
    }
  }
});

// PUT - Editar uma organização por id_organizacao
router.put('/:id_organizacao', async (req, res) => {
  const { id_organizacao } = req.params;
  const { nome_organizacao } = req.body;
  try {
    const result = await pool.query(
      'UPDATE organizacao SET nome_organizacao = $1 WHERE id_organizacao = $2 RETURNING *',
      [nome_organizacao, id_organizacao]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ erro: 'Organização não encontrada.' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error('[PUT /api/organizacao/:id_organizacao] Erro:', err);
    res.status(500).json({ erro: 'Erro ao editar organização', detalhes: err.message });
  }
});

// DELETE - Remover uma organização por id_organizacao
router.delete('/:id_organizacao', async (req, res) => {
  const { id_organizacao } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM organizacao WHERE id_organizacao = $1 RETURNING *',
      [id_organizacao]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ erro: 'Organização não encontrada.' });
    } else {
      res.json({ sucesso: true, removido: result.rows[0] });
    }
  } catch (err) {
    console.error('[DELETE /api/organizacao/:id_organizacao] Erro:', err);
    res.status(500).json({ erro: 'Erro ao remover organização', detalhes: err.message });
  }
});

module.exports = router;
