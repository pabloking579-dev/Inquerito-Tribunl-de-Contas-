const router = require('express').Router();
const Inquerito = require('../controller/InqueritoController');

// ROTA DE DIAGNÓSTICO (Abre esta no Chrome/Edge)
router.get('/teste', Inquerito.teste);
// 1. Listagem e Pesquisa (Aba de Reutilização)
router.get('/pesquisa', Inquerito.pesquisar);
// Outras rotas
router.get('/completo/:id', Inquerito.exibirQuestionario);
router.get('/disponiveis/:funcionarioId', Inquerito.listarDisponiveis);
router.post('/', Inquerito.store);
// 2. Preparar os dados para o formulário de clonagem
router.get('/reutilizar/:id', Inquerito.prepararReutilizacao);
module.exports = router;