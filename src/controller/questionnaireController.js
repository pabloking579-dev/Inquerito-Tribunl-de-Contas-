const { pool } = require('../config/database');

// ============================================
// GET /api/questionario/:id
// Retorna questionário com perguntas e opções
// ============================================
const getQuestionario = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;

    // Buscar questionário
    const [questionarios] = await connection.query(
      `SELECT q.*, e.nome as empresa_nome 
       FROM questionarios q
       INNER JOIN empresas e ON q.empresa_id = e.id
       WHERE q.id = ? AND q.ativo = 1 AND q.publicado = 1`,
      [id]
    );

    if (questionarios.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Questionário não encontrado ou não está publicado'
      });
    }

    const questionario = questionarios[0];

    // Buscar perguntas com opções usando JOIN
    const [perguntas] = await connection.query(
      `SELECT 
         p.id as pergunta_id,
         p.tipo,
         p.enunciado,
         p.obrigatoria,
         p.ordem,
         po.id as opcao_id,
         po.texto_opcao,
         po.valor
       FROM perguntas p
       LEFT JOIN perguntas_opcoes po ON p.id = po.pergunta_id AND po.ativa = 1
       WHERE p.questionario_id = ? AND p.ativa = 1
       ORDER BY p.ordem, po.ordem`,
      [id]
    );

    // Estruturar perguntas com suas opções
    const perguntasEstruturadas = [];
    const perguntasMap = new Map();

    for (const pergunta of perguntas) {
      if (!perguntasMap.has(pergunta.pergunta_id)) {
        perguntasMap.set(pergunta.pergunta_id, {
          id: pergunta.pergunta_id,
          tipo: pergunta.tipo,
          enunciado: pergunta.enunciado,
          obrigatoria: pergunta.obrigatoria === 1,
          ordem: pergunta.ordem,
          opcoes: []
        });
      }

      if (pergunta.opcao_id) {
        perguntasMap.get(pergunta.pergunta_id).opcoes.push({
          id: pergunta.opcao_id,
          texto: pergunta.texto_opcao,
          valor: pergunta.valor
        });
      }
    }

    // Converter Map para Array ordenado
    perguntasEstruturadas.push(...perguntasMap.values());
    perguntasEstruturadas.sort((a, b) => a.ordem - b.ordem);

    res.json({
      success: true,
      data: {
        questionario: {
          id: questionario.id,
          titulo: questionario.titulo,
          descricao: questionario.descricao,
          empresa: questionario.empresa_nome,
          data_inicio: questionario.data_inicio,
          data_fim: questionario.data_fim
        },
        perguntas: perguntasEstruturadas
      }
    });

  } catch (error) {
    console.error('Erro ao buscar questionário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar questionário',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// ============================================
// POST /api/responder
// Salva respostas do questionário
// ============================================
const responderQuestionario = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { usuario_id, questionario_id, respostas } = req.body;

    // Validações básicas
    if (!usuario_id || !questionario_id || !respostas || !Array.isArray(respostas)) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos. É necessário: usuario_id, questionario_id e array de respostas'
      });
    }

    // Iniciar transação
    await connection.beginTransaction();

    // Verificar se questionário existe e está ativo
    const [questionarios] = await connection.query(
      `SELECT id, data_fim FROM questionarios WHERE id = ? AND ativo = 1 AND publicado = 1`,
      [questionario_id]
    );

    if (questionarios.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Questionário não encontrado ou não está disponível'
      });
    }

    // Verificar se questionário não expirou
    const questionario = questionarios[0];
    if (questionario.data_fim && new Date(questionario.data_fim) < new Date()) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Este questionário já expirou'
      });
    }

    // Verificar se usuário já respondeu
    const [respostasExistentes] = await connection.query(
      `SELECT id FROM respostas_master WHERE usuario_id = ? AND questionario_id = ?`,
      [usuario_id, questionario_id]
    );

    if (respostasExistentes.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Você já respondeu este questionário'
      });
    }

    // Inserir na tabela respostas_master
    const [masterResult] = await connection.query(
      `INSERT INTO respostas_master (usuario_id, questionario_id, data_resposta, ip_address, completo) 
       VALUES (?, ?, NOW(), ?, ?)`,
      [usuario_id, questionario_id, req.ip || 'unknown', 1]
    );

    const resposta_master_id = masterResult.insertId;

    // Inserir cada resposta na tabela respostas_detalhe
    for (const resposta of respostas) {
      const { pergunta_id, tipo_resposta, valor_resposta, opcao_ids } = resposta;

      // Verificar se pergunta existe
      const [perguntas] = await connection.query(
        `SELECT id, obrigatoria FROM perguntas WHERE id = ? AND questionario_id = ?`,
        [pergunta_id, questionario_id]
      );

      if (perguntas.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Pergunta ID ${pergunta_id} não encontrada neste questionário`
        });
      }

      // Verificar se pergunta obrigatória foi respondida
      if (perguntas[0].obrigatoria === 1 && !valor_resposta && (!opcao_ids || opcao_ids.length === 0)) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `A pergunta ID ${pergunta_id} é obrigatória e não foi respondida`
        });
      }

      // Para checkbox (múltiplas opções)
      if (tipo_resposta === 'checkbox' && opcao_ids && opcao_ids.length > 0) {
        for (const opcao_id of opcao_ids) {
          await connection.query(
            `INSERT INTO respostas_detalhe (resposta_master_id, pergunta_id, opcao_id, valor_texto, data_resposta) 
             VALUES (?, ?, ?, NULL, NOW())`,
            [resposta_master_id, pergunta_id, opcao_id]
          );
        }
      } 
      // Para texto, radio, select (única resposta)
      else {
        await connection.query(
          `INSERT INTO respostas_detalhe (resposta_master_id, pergunta_id, opcao_id, valor_texto, data_resposta) 
           VALUES (?, ?, ?, ?, NOW())`,
          [resposta_master_id, pergunta_id, opcao_ids ? opcao_ids[0] : null, valor_resposta || null]
        );
      }
    }

    // Commit da transação
    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Respostas salvas com sucesso!',
      data: {
        resposta_master_id,
        questionario_id,
        usuario_id,
        total_respostas: respostas.length
      }
    });

  } catch (error) {
    // Rollback em caso de erro
    await connection.rollback();
    
    console.error('Erro ao salvar respostas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao salvar respostas',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// ============================================
// GET /api/questionarios
// Lista todos os questionários ativos
// ============================================
const listarQuestionarios = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { empresa_id } = req.query;

    let query = `
      SELECT 
        q.id,
        q.titulo,
        q.descricao,
        q.data_criacao,
        q.data_inicio,
        q.data_fim,
        e.nome as empresa_nome,
        COUNT(DISTINCT rm.id) as total_respostas
      FROM questionarios q
      INNER JOIN empresas e ON q.empresa_id = e.id
      LEFT JOIN respostas_master rm ON q.id = rm.questionario_id
      WHERE q.ativo = 1 AND q.publicado = 1
    `;

    const params = [];

    if (empresa_id) {
      query += ' AND q.empresa_id = ?';
      params.push(empresa_id);
    }

    query += ' GROUP BY q.id ORDER BY q.data_criacao DESC';

    const [questionarios] = await connection.query(query, params);

    res.json({
      success: true,
      data: questionarios,
      total: questionarios.length
    });

  } catch (error) {
    console.error('Erro ao listar questionários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar questionários',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getQuestionario,
  responderQuestionario,
  listarQuestionarios
};