const express = require('express');
const router = express.Router();
const pool = require('../db');

// Função auxiliar para construir cláusula IN para nomes de empresa
function tratarListaEmpresas(empresaStr) {
  return empresaStr.split(',').map(e => e.trim());
}

// [GET] Vendas por ANO
router.get('/ano', async (req, res) => {
  const { id_organizacao, tipo, empresas } = req.query;
  try {
    let query = `
      SELECT 
        EXTRACT(YEAR FROM data_emissao) AS ano,
        SUM(valor_venda) AS total_venda,
        empresa
      FROM vendas
      WHERE id_organizacao = $1
    `;
    const params = [id_organizacao];

    if (tipo) {
      params.push(tipo);
      query += ` AND tipo = $${params.length}`;
    }

    if (empresas) {
      const empresasArr = tratarListaEmpresas(empresas);
      query += ` AND empresa = ANY($${params.length + 1})`;
      params.push(empresasArr);
    }

    query += ' GROUP BY ano, empresa ORDER BY ano, empresa';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[GET /vendas/ano] Erro:', err);
    res.status(500).json({ erro: 'Erro ao buscar vendas por ano' });
  }
});

// [GET] Vendas por MÊS
router.get('/mes', async (req, res) => {
  const { id_organizacao, ano, tipo, empresas } = req.query;
  try {
    let query = `
      SELECT 
        EXTRACT(MONTH FROM data_emissao) AS mes,
        SUM(valor_venda) AS total_venda,
        empresa
      FROM vendas
      WHERE id_organizacao = $1 AND EXTRACT(YEAR FROM data_emissao) = $2
    `;
    const params = [id_organizacao, ano];

    if (tipo) {
      params.push(tipo);
      query += ` AND tipo = $${params.length}`;
    }

    if (empresas) {
      const empresasArr = tratarListaEmpresas(empresas);
      query += ` AND empresa = ANY($${params.length + 1})`;
      params.push(empresasArr);
    }

    query += ' GROUP BY mes, empresa ORDER BY mes, empresa';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[GET /vendas/mes] Erro:', err);
    res.status(500).json({ erro: 'Erro ao buscar vendas por mês' });
  }
});

// [GET] Vendas por DIA
router.get('/dia', async (req, res) => {
  const { id_organizacao, ano, mes, tipo, empresas } = req.query;
  try {
    let query = `
      SELECT 
        EXTRACT(DAY FROM data_emissao) AS dia,
        SUM(valor_venda) AS total_venda,
        empresa
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

    if (empresas) {
      const empresasArr = tratarListaEmpresas(empresas);
      query += ` AND empresa = ANY($${params.length + 1})`;
      params.push(empresasArr);
    }

    query += ' GROUP BY dia, empresa ORDER BY dia, empresa';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[GET /vendas/dia] Erro:', err);
    res.status(500).json({ erro: 'Erro ao buscar vendas por dia' });
  }
});

module.exports = router;