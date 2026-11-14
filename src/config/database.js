require('dotenv').config();

module.exports = {
  // Configurações vindas do seu .env
  username: process.env.DB_USER || 'hp',          // No SSMS o padrão costuma ser 'sa'
  password: process.env.DB_PASSWORD || 'Djablesty', 
  database: process.env.DB_NAME || 'Base1',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,    // Porta padrão do SQL Server é 1433
  dialect: 'mssql', 
  
  // Configurações específicas do SQL Server (Tedious)
  dialectOptions: {
    options: {
      encrypt: true, // true para Azure, false para local (mas true geralmente funciona)
      trustServerCertificate: true, // Obrigatório para rodar em Localhost
      enableArithAbort: true
    }
  },

  // Configuração do Pool (O Sequelize faz o que o teu código antigo fazia)
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  logging: false // Define como true se quiseres ver os comandos SQL no terminal
};
// No final do seu src/model/index.js
const testarConexao = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com SQL Server (SSMS) estabelecida com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar com o SQL Server:', error.message);
  }
};

testarConexao();