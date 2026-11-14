const db = require('../model');

module.exports = {
    // Esta função chama-se "index" por convenção para listar coisas
    async index(req, res) {
        try {
            const funcionarios = await db.Funcionario.findAll();
            return res.json(funcionarios);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao aceder à base de dados" });
        }
    }
};