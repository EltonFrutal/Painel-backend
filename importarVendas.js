const fs = require('fs');
const readline = require('readline');
const iconv = require('iconv-lite');
const pool = require('./db');

async function importarVendas(caminhoArquivo) {
  try {
    console.log('🔄 Excluindo registros da tabela vendas...');
    await pool.query('DELETE FROM vendas');
    await pool.query('ALTER SEQUENCE vendas_id_seq RESTART WITH 1');
    console.log('✅ Registros excluídos e ID resetado.');

    const fileStream = fs.createReadStream(caminhoArquivo).pipe(iconv.decodeStream('latin1'));
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    const lote = [];
    const TAMANHO_LOTE = 5000;

    for await (const linha of rl) {
      const campos = linha.split(';');

      if (campos.length < 11) {
        console.log('⚠️ Linha ignorada (faltando campos):', linha);
        continue;
      }

      const [
        numero_organizacao,
        nome_organizacao,
        empresa,
        pedido,
        cliente,
        data_emissao,
        valor_custo,
        valor_venda,
        valor_lucro,
        tipo,
        vendedor
      ] = campos;

      lote.push([
        parseInt(numero_organizacao),
        nome_organizacao.trim(),
        empresa.trim(),
        pedido.trim(),
        cliente.trim(),
        data_emissao.split('/').reverse().join('-'),
        parseFloat(valor_custo.replace(',', '.')),
        parseFloat(valor_venda.replace(',', '.')),
        parseFloat(valor_lucro.replace(',', '.')),
        tipo ? tipo.trim() : null,
        vendedor ? vendedor.trim() : null
      ]);

      if (lote.length >= TAMANHO_LOTE) {
        await inserirLote(lote);
        lote.length = 0; // Limpa o array
      }
    }

    // Insere o que sobrar no final
    if (lote.length > 0) {
      await inserirLote(lote);
    }

    console.log('✅ Importação concluída.');
  } catch (error) {
    console.error('Erro geral:', error.message);
  } finally {
    process.exit();
  }
}

async function inserirLote(lote) {
  const valores = lote.map((linha, i) => 
    `($${i * 11 + 1}, $${i * 11 + 2}, $${i * 11 + 3}, $${i * 11 + 4}, $${i * 11 + 5}, $${i * 11 + 6}, $${i * 11 + 7}, $${i * 11 + 8}, $${i * 11 + 9}, $${i * 11 + 10}, $${i * 11 + 11})`
  ).join(',');

  const params = lote.flat();

  const sql = `
    INSERT INTO vendas
    (numero_organizacao, nome_organizacao, empresa, pedido, cliente, data_emissao, valor_custo, valor_venda, valor_lucro, tipo, vendedor)
    VALUES ${valores}
  `;

  try {
    await pool.query(sql, params);
    console.log(`✅ Inserido lote com ${lote.length} registros`);
  } catch (error) {
    console.error('❌ Erro ao inserir lote:', error.message);
  }
}

// 🔥 Defina o caminho do arquivo .txt
const caminhoArquivo = './vendas.txt';
importarVendas(caminhoArquivo);
