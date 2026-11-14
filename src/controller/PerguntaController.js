const db = require('../model');

module.exports = {
    // Criar uma pergunta com opções
    async store(req, res) {
        try {
            const { texto, tipo, seccao_id, opcoes } = req.body;

            // Criar a pergunta na tabela Pergunta
            const pergunta = await db.Pergunta.create({ texto, tipo, seccao_id });

            // Se o JSON enviado tiver um array de "opcoes", criamos cada uma delas
            if (opcoes && opcoes.length > 0) {
                const opcoesComId = opcoes.map(opt => ({
                    ...opt,
                    pergunta_id: pergunta.id
                }));
                await db.PerguntaOpc.bulkCreate(opcoesComId);
            }

            return res.status(201).json({ message: "Pergunta e opções criadas!", pergunta });
        } catch (error) {
            return res.status(400).json({ error: "Erro ao criar pergunta: " + error.message });
        }
    }
};