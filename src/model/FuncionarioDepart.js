const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
  class FuncionarioDepart extends Model {}
  FuncionarioDepart.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nivel: DataTypes.INTEGER,
    status: { type: DataTypes.BIGINT, defaultValue: 0 },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    nivel_master: DataTypes.INTEGER,
    perfil_acesso: { type: DataTypes.INTEGER, defaultValue: 1 }
  }, { sequelize, modelName: 'FuncionarioDepart', tableName: 'tb_funcionario_depart', timestamps: false });
  return FuncionarioDepart;
};