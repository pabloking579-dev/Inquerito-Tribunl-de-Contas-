const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
  class PerguntaOpc extends Model {}
  PerguntaOpc.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    texto_opcao: { type: DataTypes.STRING(255), allowNull: false },
    valor: DataTypes.INTEGER,
    ordem: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, { sequelize, modelName: 'PerguntaOpc', tableName: 'Pergunta_Opc', timestamps: false });
  return PerguntaOpc;
};