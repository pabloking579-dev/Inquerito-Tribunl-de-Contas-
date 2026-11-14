const router = require('express').Router();
const Resposta = require('../controller/RespostaController');
router.post('/', Resposta.store);
router.get('/relatorio', Resposta.relatorio);
module.exports = router;