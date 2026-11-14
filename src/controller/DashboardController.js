const db = require('../model');
const PDFDocument = require('pdfkit');

module.exports = {
    /**
     * RESUMO GERAL
     * Estatísticas rápidas para os cards do topo do Dashboard.
     */
    async resumoGeral(req, res) {
        try {
            const totalInqueritos = await db.Inquerito.count();
            const totalFuncionarios = await db.Funcionario.count();
            
            // Conta quantos funcionários únicos já responderam a pelo menos 1 inquérito
            const participantesUnicos = await db.Resposta.count({
                distinct: true,
                col: 'funcionario_id'
            });

            return res.json({
                totalInqueritos,
                totalFuncionarios,
                participantesUnicos,
                taxaAdesaoGlobal: totalFuncionarios > 0 
                    ? ((participantesUnicos / totalFuncionarios) * 100).toFixed(1) + "%" 
                    : "0%"
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    /**
     * DETALHE POR INQUÉRITO
     * Quantas pessoas responderam a um inquérito específico.
     */
    async detalhesInquerito(req, res) {
        try {
            const { id } = req.params;

            // 1. Total de respostas recebidas para este inquérito
            const totalRespostas = await db.Resposta.count({
                where: { inquerito_id: id },
                distinct: true,
                col: 'funcionario_id'
            });

            // 2. Buscar o inquérito para saber o título
            const inquerito = await db.Inquerito.findByPk(id);

            return res.json({
                inquerito: inquerito ? inquerito.titulo : "N/A",
                totalRespostas,
                dataRelatorio: new Date()
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
    /**
     * RELATÓRIO ANALÍTICO
     * Retorna cada pergunta com a contagem de respostas por opção.
     */
    async relatorioAnalitico(req, res) {
        try {
            const { id } = req.params;

            const dados = await db.Inquerito.findByPk(id, {
                include: [{
                    model: db.Seccao,
                    as: 'seccoes',
                    include: [{
                        model: db.Pergunta,
                        as: 'perguntas',
                        include: [
                            {
                                model: db.PerguntaOpc,
                                as: 'opcoes'
                            },
                            {
                                model: db.RespOpcao,
                                as: 'respostas_opcoes' // Garante que este alias existe no index.js
                            }
                        ]
                    }]
                }]
            });

            if (!dados) return res.status(404).json({ error: "Inquérito não encontrado." });

            return res.json(dados);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },


// Dentro do module.exports do DashboardController:
async exportarPDF(req, res) {
    try {
        const { id } = req.params;
        const inquerito = await db.Inquerito.findByPk(id);

        if (!inquerito) return res.status(404).send("Inquérito não encontrado.");

        const doc = new PDFDocument();
        let filename = `Relatorio_${id}.pdf`;

        // Configuração do Header para o navegador entender que é um PDF
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res); // Envia o PDF diretamente para a resposta HTTP

        // Conteúdo do PDF
        doc.fontSize(20).text(`Relatório: ${inquerito.titulo}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Descrição: ${inquerito.descricao || 'Sem descrição'}`);
        doc.text(`Data de Extração: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        
        doc.text("--------------------------------------------------");
        doc.text("Resumo de métricas...");
        // Aqui podes adicionar loops para listar as perguntas e resultados

        doc.end(); // Finaliza o documento

    } catch (error) {
        return res.status(500).json({ error: "Erro ao gerar PDF: " + error.message });
    }
}
};