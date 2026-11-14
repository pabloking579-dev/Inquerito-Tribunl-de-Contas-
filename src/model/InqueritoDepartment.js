const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
  class InqueritoDepartment extends Model {}
  InqueritoDepartment.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data_vinculo: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { sequelize, modelName: 'InqueritoDepartment', tableName: 'Inquerito_Department', timestamps: false });
  return InqueritoDepartment;
};