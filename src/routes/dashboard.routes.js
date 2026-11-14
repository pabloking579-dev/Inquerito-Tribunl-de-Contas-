const router = require('express').Router();
const Dashboard = require('../controller/DashboardController');

router.get('/resumo', Dashboard.resumoGeral);
router.get('/inquerito/:id', Dashboard.detalhesInquerito);
// Ver relatório completo (JSON para gráficos)
router.get('/relatorio-analitico/:id', Dashboard.relatorioAnalitico);
// Baixar PDF
router.get('/exportar-pdf/:id', Dashboard.exportarPDF);

module.exports = router;