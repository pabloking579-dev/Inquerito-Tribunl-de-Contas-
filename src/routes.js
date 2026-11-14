const express = require('express');
const routes = express.Router();

// Importação de TODOS os Controllers
const FuncionarioController = require('./controller/FuncionarioController');
const DepartmentController = require('./controller/DepartmentController');
const InqueritoController = require('./controller/InqueritoController');
const PerguntaController = require('./controller/PerguntaController');
const RespostaController = require('./controller/RespostaController');

// --- ROTAS ---
routes.get('/teste', (req, res) => res.json({ status: "Sistema Online" }));

// Funcionários e Departamentos
routes.get('/funcionarios', FuncionarioController.index);
routes.get('/departamentos', DepartmentController.index);
routes.post('/departamentos', DepartmentController.store);

// Inquéritos (Estrutura completa)
routes.get('/inqueritos', InqueritoController.index);

// Perguntas e Opções
routes.post('/perguntas', PerguntaController.store);

// Submissão de Respostas e Relatórios
routes.post('/respostas', RespostaController.store);
routes.get('/relatorio', RespostaController.relatorio);

module.exports = routes;