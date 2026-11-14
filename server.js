const app = require('./src/app');
const db = require('./src/model');

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