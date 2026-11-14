const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
  class RespOpcao extends Model {}
  RespOpcao.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    valor_texto: DataTypes.TEXT
  }, { sequelize, modelName: 'RespOpcao', tableName: 'Resp_Opcao', timestamps: false });
  return RespOpcao;
};