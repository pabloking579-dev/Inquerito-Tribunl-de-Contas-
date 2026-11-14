const db = require('../model');
const { Op } = require('sequelize');

module.exports = {
    /**
     * 1. ROTA DE TESTE
     * Verifica se o controller e os modelos estão carregados.
     */
    async teste(req, res) {
        try {
            return res.json({ 
                mensagem: "O Controller de Inquéritos está a responder!",
                modelos_carregados: Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize')
            });
        } catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    },

    /**
     * 2. LISTAR DISPONÍVEIS
     * Filtra inquéritos por Departamento do funcionário OU Acesso Direto.
     */
    async listarDisponiveis(req, res) {
        try {
            const { funcionarioId } = req.params;

            const funcionario = await db.Funcionario.findByPk(funcionarioId);
            if (!funcionario) {
                return res.status(404).json({ error: "Funcionário não encontrado." });
            }

            const condicoes = [];
            if (funcionario.id_departamento) {
                condicoes.push({ '$departamentos.id$': funcionario.id_departamento });
            }
            condicoes.push({ '$autorizados.id$': funcionarioId });

            const inqueritos = await db.Inquerito.findAll({
                include: [
                    { model: db.Department, as: 'departamentos', required: false },
                    { model: db.Funcionario, as: 'autorizados', required: false }
                ],
                where: { [Op.or]: condicoes },
                subQuery: false
            });

            return res.json(inqueritos);
        } catch (error) {
            console.error("Erro ao listar disponíveis:", error);
            return res.status(500).json({ error: error.message });
        }
    },

    /**
     * 3. CRIAR INQUÉRITO (STORE)
     * Cria o Inquérito, Secções e Perguntas de uma só vez (Cascata).
     */
    async store(req, res) {
        try {
            const novoInquerito = await db.Inquerito.create(req.body, {
                include: [
                    {
                        model: db.Seccao,
                        as: 'seccoes',
                        include: [
                            {
                                model: db.Pergunta,
                                as: 'perguntas'
                            }
                        ]
                    }
                ]
            });
            return res.status(201).json(novoInquerito);
        } catch (error) {
            return res.status(400).json({ error: "Erro ao criar estrutura: " + error.message });
        }
    },

    /**
     * 4. EXIBIR QUESTIONÁRIO COMPLETO
     * Traz a árvore completa: Inquérito > Secções > Perguntas > Opções.
     */
   async exibirQuestionario(req, res) {
    try {
        const { id } = req.params;

        const inquerito = await db.Inquerito.findByPk(id, {
            include: [
                {
                    model: db.Seccao,
                    as: 'seccoes',
                    include: [
                        {
                            model: db.Pergunta,
                            as: 'perguntas',
                            include: [
                                {
                                    model: db.PerguntaOpc,
                                    as: 'opcoes'
                                }
                            ]
                        }
                    ]
                }
            ],
            // Ordenação para garantir que as fases (secções) apareçam na sequência correta
            order: [
                [{ model: db.Seccao, as: 'seccoes' }, 'ordem', 'ASC'],
                [{ model: db.Seccao, as: 'seccoes' }, { model: db.Pergunta, as: 'perguntas' }, 'id', 'ASC']
            ]
        });

        if (!inquerito) {
            return res.status(404).json({ error: "Inquérito não encontrado." });
        }

        return res.json(inquerito);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao carregar dados: " + error.message });
    }
},
/**
     * 5. PESQUISAR / LISTAR PARA REUTILIZAÇÃO
     * Se não vier 'titulo', lista todos. Se vier, filtra.
     */
    async pesquisar(req, res) {
        try {
            const { titulo } = req.query;

            // Se o 'titulo' estiver vazio, o Sequelize ignora o filtro e traz tudo
            const filtro = titulo 
                ? { titulo: { [Op.like]: `%${titulo}%` } } 
                : {};

            const inqueritos = await db.Inquerito.findAll({
                where: filtro,
                attributes: ['id', 'titulo', 'descricao', 'status', 'createdAt'], // Trazemos apenas o essencial para a lista
                order: [['createdAt', 'DESC']]
            });

            return res.json(inqueritos);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao carregar lista: " + error.message });
        }
    },
    /**
     * 6. PREPARAR REUTILIZAÇÃO
     * Busca os dados de um inquérito antigo para servirem de base para um novo.
     */
    async prepararReutilizacao(req, res) {
        try {
            const { id } = req.params;

            const inqueritoBase = await db.Inquerito.findByPk(id, {
                include: [
                    {
                        model: db.Seccao,
                        as: 'seccoes',
                        include: [{ model: db.Pergunta, as: 'perguntas' }]
                    }
                ]
            });

            if (!inqueritoBase) {
                return res.status(404).json({ error: "Inquérito base não encontrado." });
            }

            // Criamos uma cópia dos dados, mas limpamos os IDs e campos de data
            // para o Sequelize entender que será um NOVO registo ao salvar.
            const novoInqueritoLayout = {
                titulo: `${inqueritoBase.titulo} (Cópia)`,
                descricao: inqueritoBase.descricao,
                status: 'Rascunho', // Começa como rascunho por segurança
                seccoes: inqueritoBase.seccoes.map(s => ({
                    titulo: s.titulo,
                    ordem: s.ordem,
                    perguntas: s.perguntas.map(p => ({
                        texto: p.texto,
                        tipo: p.tipo,
                        obrigatoria: p.obrigatoria
                    }))
                }))
            };

            return res.json(novoInqueritoLayout);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao duplicar: " + error.message });
        }
    },
    /**
 * VERIFICAR PENDENTES (Para o Pop-up do Front-end)
 */
async verificarPendentes(req, res) {
    try {
        const { funcionarioId } = req.params;

        // 1. Buscar inquéritos que o funcionário PODE responder (mesma lógica que já tens)
        const funcionario = await db.Funcionario.findByPk(funcionarioId);
        const condicoes = [
            { '$departamentos.id$': funcionario.id_departamento },
            { '$autorizados.id$': funcionarioId }
        ];

        const disponiveis = await db.Inquerito.findAll({
            include: [
                { model: db.Department, as: 'departamentos', required: false },
                { model: db.Funcionario, as: 'autorizados', required: false }
            ],
            where: { [Op.or]: condicoes, status: 'Ativo' },
            attributes: ['id']
        });

        // 2. Filtrar os que ele JÁ respondeu
        const respondidos = await db.Resposta.findAll({
            where: { funcionario_id: funcionarioId },
            attributes: ['inquerito_id']
        });

        const idsRespondidos = respondidos.map(r => r.inquerito_id);
        const pendentes = disponiveis.filter(inq => !idsRespondidos.includes(inq.id));

        return res.json({
            totalPendentes: pendentes.length,
            temPendentes: pendentes.length > 0,
            primeiroPendenteId: pendentes.length > 0 ? pendentes[0].id : null
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

};