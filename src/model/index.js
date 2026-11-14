const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// 1. Configuração da Conexão com SQL Server (SSMS)
const sequelize = new Sequelize(
    process.env.DB_NAME || 'Base1',
    process.env.DB_USER || 'hp',
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 1433,
        dialect: 'mssql',
        dialectOptions: {
            options: {
                encrypt: true,
                trustServerCertificate: true, // Importante para conexão local
                enableArithAbort: true
            }
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: false // Mudar para console.log para ver as queries SQL
    }
);

const db = {};

// 2. Definição/Importação dos Modelos (Os 12 Ficheiros)
db.Funcionario = require('./Funcionario')(sequelize);
db.Department = require('./Department')(sequelize);
db.FuncionarioDepart = require('./FuncionarioDepart')(sequelize);
db.Inquerito = require('./Inquerito')(sequelize);
db.Seccao = require('./Seccao')(sequelize);
db.InqueritoSeccao = require('./InqueritoSeccao')(sequelize);
db.Pergunta = require('./Pergunta')(sequelize);
db.SeccaoPergunta = require('./SeccaoPergunta')(sequelize);
db.PerguntaOpc = require('./PerguntaOpc')(sequelize);
db.Resposta = require('./Resposta')(sequelize);
db.RespOpcao = require('./RespOpcao')(sequelize);
db.InqueritoDepartment = require('./InqueritoDepartment')(sequelize);
db.InqueritoFuncionario = require('./InqueritoFuncionario')(sequelize);
// 3. Associações (Relacionamentos)

// --- Relações Muitos-para-Muitos (N:M) ---

// Funcionário <-> Departamento
db.Funcionario.belongsToMany(db.Department, { 
    through: db.FuncionarioDepart, 
    foreignKey: 'id_funcionario',
    otherKey: 'id_departamento'
});
db.Department.belongsToMany(db.Funcionario, { 
    through: db.FuncionarioDepart, 
    foreignKey: 'id_departamento',
    otherKey: 'id_funcionario'
});

// Inquérito <-> Departamento (Regra 1)
db.Inquerito.belongsToMany(db.Department, { 
    through: db.InqueritoDepartment, 
    as: 'departamentos',
    foreignKey: 'inquerito_id',
    otherKey: 'department_id'
});
db.Department.belongsToMany(db.Inquerito, { 
    through: db.InqueritoDepartment, 
    foreignKey: 'department_id',
    otherKey: 'inquerito_id'
});
// Inquérito <-> Funcionario (Regra 2 - Acesso Direto)
db.Inquerito.belongsToMany(db.Funcionario, { 
    through: db.InqueritoFuncionario, 
    as: 'autorizados',
    foreignKey: 'inquerito_id',
    otherKey: 'funcionario_id' 
});
db.Funcionario.belongsToMany(db.Inquerito, { 
    through: db.InqueritoFuncionario, 
    as: 'acessos_diretos',
    foreignKey: 'funcionario_id',
    otherKey: 'inquerito_id'
});
// Inquérito <-> Secção
db.Inquerito.belongsToMany(db.Seccao, { 
    through: db.InqueritoSeccao, 
    as: 'seccoes',
    foreignKey: 'inquerito_id',
    otherKey: 'seccao_id'
});
db.Seccao.belongsToMany(db.Inquerito, { 
    through: db.InqueritoSeccao, 
    as: 'inqueritos',
    foreignKey: 'seccao_id',
    otherKey: 'inquerito_id'
});

// Secção <-> Pergunta
db.Seccao.belongsToMany(db.Pergunta, { 
    through: db.SeccaoPergunta, 
    as: 'perguntas',
    foreignKey: 'seccao_id',
    otherKey: 'pergunta_id'
});
db.Pergunta.belongsToMany(db.Seccao, { 
    through: db.SeccaoPergunta, 
    as: 'seccoes',
    foreignKey: 'pergunta_id',
    otherKey: 'seccao_id'
});

// --- Relações Um-para-Muitos (1:N) ---

// Pergunta <-> Opções
db.Pergunta.hasMany(db.PerguntaOpc, { foreignKey: 'pergunta_id' });
db.PerguntaOpc.belongsTo(db.Pergunta, { foreignKey: 'pergunta_id' });

// Inquérito (Quem criou)
db.Inquerito.belongsTo(db.Funcionario, { foreignKey: 'criado_por', as: 'Criador' });

// Fluxo de Respostas
db.Resposta.belongsTo(db.Funcionario, { foreignKey: 'usuario_id' });
db.Resposta.belongsTo(db.Inquerito, { foreignKey: 'inquerito_id' });
db.Resposta.belongsTo(db.Seccao, { foreignKey: 'seccao_id' });
db.Resposta.belongsTo(db.Pergunta, { foreignKey: 'pergunta_id' });

// Detalhe das Respostas
db.Resposta.hasMany(db.RespOpcao, { foreignKey: 'resposta_id' });
db.RespOpcao.belongsTo(db.Resposta, { foreignKey: 'resposta_id' });
db.RespOpcao.belongsTo(db.PerguntaOpc, { foreignKey: 'opcao_id' });

// 4. Teste de Autenticação
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexão com SQL Server (SSMS) estabelecida com sucesso!');
        
        // OPCIONAL: sequelize.sync() se quiseres que o Sequelize tente criar as tabelas
        // await sequelize.sync({ alter: false }); 
        
    } catch (error) {
        console.error('❌ Erro crítico ao conectar com o SQL Server:', error.message);
    }
};

testConnection();

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.testConnection = testConnection;

module.exports = db;