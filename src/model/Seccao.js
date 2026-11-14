const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
  class Seccao extends Model {}
  Seccao.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titulo: { type: DataTypes.STRING(100), allowNull: false },
    descricao: DataTypes.TEXT,
    ordem: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, { sequelize, modelName: 'Seccao', tableName: 'Seccoes', timestamps: false });
  return Seccao;
};