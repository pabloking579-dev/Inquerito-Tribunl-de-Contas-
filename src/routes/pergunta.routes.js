const router = require('express').Router();
const Pergunta = require('../controller/PerguntaController');
router.post('/', Pergunta.store);
module.exports = router;