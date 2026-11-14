const router = require('express').Router();
const Funcionario = require('../controller/FuncionarioController');
router.get('/', Funcionario.index);
module.exports = router;