const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
  class Resposta extends Model {}
  Resposta.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data_resposta: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    ip_address: DataTypes.STRING(45),
    completo: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, { sequelize, modelName: 'Resposta', tableName: 'Resposta', timestamps: false });
  return Resposta;
};