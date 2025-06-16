const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET - Listar empresas distintas a partir da tabela vendas
router.get('/', async (req, res) => {
  const { id_organizacao } = req.query;
  try {
    const result = await pool.query(
      `
      SELECT DISTINCT empresa AS nome
      FROM vendas
      WHERE id_organizacao = $1 AND empresa IS NOT NULL
      ORDER BY nome
      `,
      [id_organizacao]
    );

    // Adiciona um ID fictício baseado na ordem (índice)
    const empresas = result.rows.map((row, index) => ({
      id_empresa: index + 1,
      nome: row.nome
    }));

    res.json(empresas);
  } catch (err) {
    console.error('[GET /empresas] Erro:', err);
    res.status(500).json({ erro: 'Erro ao buscar empresas', detalhes: err.message });
  }
});

module.exports = router;