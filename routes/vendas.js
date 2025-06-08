// backend/routes/vendas.js

const express = require('express');
const router = express.Router();
const pool = require('../db');

// [GET] - Vendas agregadas por ano
router.get('/ano', async (req, res) => {
  const { id_organizacao, tipo, empresa } = req.query;
  try {
    let query = `
      SELECT EXTRACT(YEAR FROM data_emissao) AS ano,
             SUM(valor_venda) AS total_venda
      FROM vendas
      WHERE id_organizacao = $1
    `;
    const params = [id_organizacao];

    if (tipo) {
      params.push(tipo);
      query += ` AND tipo = $${params.length}`;
    }

    if (empresa) {
      params.push(empresa);
      query += ` AND empresa = $${params.length}`;
    }

    query += ' GROUP BY ano ORDER BY ano';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[GET /vendas/ano] Erro:', err);
    res.status(500).json({ erro: 'Erro ao buscar vendas por ano' });
  }
});

// [GET] - Vendas agregadas por mês de um ano
router.get('/mes', async (req, res) => {
  const { id_organizacao, ano, tipo, empresa } = req.query;
  try {
    let query = `
      SELECT EXTRACT(MONTH FROM data_emissao) AS mes,
             SUM(valor_venda) AS total_venda
      FROM vendas
      WHERE id_organizacao = $1 AND EXTRACT(YEAR FROM data_emissao) = $2
    `;
    const params = [id_organizacao, ano];

    if (tipo) {
      params.push(tipo);
      query += ` AND tipo = $${params.length}`;
    }

    if (empresa) {
      params.push(empresa);
      query += ` AND empresa = $${params.length}`;
    }

    query += ' GROUP BY mes ORDER BY mes';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[GET /vendas/mes] Erro:', err);
    res.status(500).json({ erro: 'Erro ao buscar vendas por mês' });
  }
});

// [GET] - Vendas por dia de um mês e ano
router.get('/dia', async (req, res) => {
  const { id_organizacao, ano, mes, tipo, empresa } = req.query;
  try {
    let query = `
      SELECT EXTRACT(DAY FROM data_emissao) AS dia,
             SUM(valor_venda) AS total_venda
      FROM vendas
      WHERE id_organizacao = $1
        AND EXTRACT(YEAR FROM data_emissao) = $2
        AND EXTRACT(MONTH FROM data_emissao) = $3
    `;
    const params = [id_organizacao, ano, mes];

    if (tipo) {
      params.push(tipo);
      query += ` AND tipo = $${params.length}`;
    }

    if (empresa) {
      params.push(empresa);
      query += ` AND empresa = $${params.length}`;
    }

    query += ' GROUP BY dia ORDER BY dia';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[GET /vendas/dia] Erro:', err);
    res.status(500).json({ erro: 'Erro ao buscar vendas por dia' });
  }
});

module.exports = router;
