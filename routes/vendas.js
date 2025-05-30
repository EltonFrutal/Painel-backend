const express = require('express');
const router = express.Router();
const pool = require('../db'); // Ajuste se o caminho do db for diferente

// Rota GET /vendas/:id_empresa
router.get('/:id_empresa', async (req, res) => {
  const { id_empresa } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM vendas WHERE numero_organizacao = $1 ORDER BY data_emissao DESC',
      [id_empresa]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
