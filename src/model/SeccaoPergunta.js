const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
  class SeccaoPergunta extends Model {}
  SeccaoPergunta.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
  }, { sequelize, modelName: 'SeccaoPergunta', tableName: 'Seccao_Pergunta', timestamps: false });
  return SeccaoPergunta;
};