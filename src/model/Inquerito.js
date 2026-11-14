const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
  class Inquerito extends Model {}
  Inquerito.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titulo: { type: DataTypes.STRING(255), allowNull: false },
    descricao: DataTypes.TEXT,
    data_inicio: {
    type: DataTypes.DATE, // O Sequelize trata da conversão para o MSSQL
    allowNull: true
},
data_final: {
    type: DataTypes.DATE,
    allowNull: true
},
  
    anonimato: { type: DataTypes.BOOLEAN, defaultValue: true },
    status: { type: DataTypes.STRING(50), defaultValue: 'rascunho' }
  }, { sequelize, modelName: 'Inquerito', tableName: 'Inquerito', timestamps: false });
  return Inquerito;
};