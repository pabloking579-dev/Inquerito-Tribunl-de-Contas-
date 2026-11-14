const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
  class Pergunta extends Model {}
  Pergunta.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tipo: { type: DataTypes.STRING(50), allowNull: false },
    enunciado: { type: DataTypes.TEXT, allowNull: false },
    opcoes_json: { type: DataTypes.TEXT },
    obrigatorio: { type: DataTypes.BOOLEAN, defaultValue: true },
    ordem: { type: DataTypes.INTEGER, defaultValue: 0 },
    activa: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { sequelize, modelName: 'Pergunta', tableName: 'Pergunta', timestamps: false });
  return Pergunta;
};