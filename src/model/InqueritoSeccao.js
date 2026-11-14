const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
  class InqueritoSeccao extends Model {}
  InqueritoSeccao.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
  }, { sequelize, modelName: 'InqueritoSeccao', tableName: 'Inq_Seccao', timestamps: false });
  return InqueritoSeccao;
};