const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
  class Funcionario extends Model {}
  Funcionario.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: DataTypes.STRING(200),
    login: DataTypes.STRING(200),
    status: { type: DataTypes.INTEGER, defaultValue: 0 },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    img: DataTypes.STRING(1000),
    dataNascimento: DataTypes.STRING(50),
    contato: DataTypes.STRING(50),
    ordy: DataTypes.INTEGER
  }, { sequelize, modelName: 'Funcionario', tableName: 'Funcionario', timestamps: false });
  return Funcionario;
};