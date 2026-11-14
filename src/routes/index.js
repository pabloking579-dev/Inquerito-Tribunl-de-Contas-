const express = require('express');
const routes = express.Router();

// Importação de todos os ficheiros de rotas
const funcionarioRoutes = require('./funcionario.routes');
const departmentRoutes = require('./department.routes');
const inqueritoRoutes = require('./inquerito.routes');
const perguntaRoutes = require('./pergunta.routes');
const respostaRoutes = require('./resposta.routes');
const dashboardRoutes = require('./dashboard.routes');

// Configuração dos prefixos das URLs
routes.use('/funcionarios', funcionarioRoutes);
routes.use('/departamentos', departmentRoutes);
routes.use('/inqueritos', inqueritoRoutes);
routes.use('/perguntas', perguntaRoutes);
routes.use('/respostas', respostaRoutes);
routes.use('/dashboard', dashboardRoutes);

// Rota de Teste para confirmar que o roteador central está vivo
routes.get('/status', (req, res) => res.json({ status: "API Modular Online" }));

module.exports = routes;