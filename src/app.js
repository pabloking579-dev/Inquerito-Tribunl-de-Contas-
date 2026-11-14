const express = require('express');
const routes = require('./routes/index');
const db = require('./model');
require('./model'); // Isto executa o teste de conexão que fizemos no index.js

const app = express();

// Middlewares
app.use(express.json()); // Permite que a API entenda JSON no corpo das requisições
app.use(express.urlencoded({ extended: true }));
// Usar as rotas que definimos
app.use(routes);

const PORT = process.env.PORT || 3000;
async function startServer() {
    try {
        // Agora o db.testConnection existe porque o exportámos no passo 1
        await db.testConnection();
        
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error.message);
    }
}
startServer();


module.exports = app;