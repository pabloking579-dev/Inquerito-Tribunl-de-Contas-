const db = require('../model');

module.exports = {
    // 1. Salvar uma resposta de um funcionário
    async store(req, res) {
        // Iniciamos uma transação para garantir que grava tudo ou nada
        const t = await db.sequelize.transaction();
        
        try {
            const { funcionario_id, pergunta_id, inquerito_id, valor_resposta, opcoes_escolhidas } = req.body;

            // --- VALIDAÇÃO: Impedir respostas duplicadas ---
            const jaRespondeu = await db.Resposta.findOne({
                where: {
                    funcionario_id: funcionario_id,
                    inquerito_id: inquerito_id
                }
            });

            if (jaRespondeu) {
                await t.rollback();
                return res.status(403).json({ 
                    error: "Validação: Este funcionário já respondeu a este inquérito anteriormente." 
                });
            }
            // -----------------------------------------------

            // Criar a resposta principal
            const resposta = await db.Resposta.create({
                funcionario_id,
                pergunta_id,
                inquerito_id,
                valor_resposta
            }, { transaction: t });

            // Se for uma pergunta de múltipla escolha, salvamos as opções marcadas
            if (opcoes_escolhidas && opcoes_escolhidas.length > 0) {
                const escolhas = opcoes_escolhidas.map(opcId => ({
                    resposta_id: resposta.id,
                    opcao_id: opcId
                }));
                
                await db.RespOpcao.bulkCreate(escolhas, { transaction: t });
            }

            // Confirma todas as operações na base de dados
            await t.commit();
            return res.status(201).json(resposta);

        } catch (error) {
            // Em caso de qualquer erro, desfaz as alterações
            if (t) await t.rollback();
            return res.status(400).json({ error: "Erro ao submeter resposta: " + error.message });
        }
    },

    // 2. Ver um relatório de todas as respostas (Para o Admin)
    async relatorio(req, res) {
        try {
            const relatorio = await db.Resposta.findAll({
                include: [
                    { model: db.Funcionario },
                    { model: db.Inquerito },
                    { model: db.Pergunta },
                    { 
                        model: db.RespOpcao, 
                        include: [{ model: db.PerguntaOpc }] 
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            return res.json(relatorio);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao gerar relatório" });
        }
    }
};