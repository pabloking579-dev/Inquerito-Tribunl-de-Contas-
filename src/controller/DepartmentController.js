const db = require('../model');

module.exports = {
    // Listar todos os departamentos
    async index(req, res) {
        try {
            const departamentos = await db.Department.findAll();
            return res.json(departamentos);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar departamentos' });
        }
    },

    // Criar um novo departamento (para usares no Postman/Insomnia)
    async store(req, res) {
        try {
            const novo = await db.Department.create(req.body);
            return res.status(201).json(novo);
        } catch (error) {
            return res.status(400).json({ error: 'Erro ao criar departamento' });
        }
    }
};