const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
  class Department extends Model {}
  Department.init({
    DepartmentId: { type: DataTypes.INTEGER, primaryKey: true },
    Name: { type: DataTypes.STRING(70), allowNull: false },
    Description: DataTypes.STRING(150),
    Email: DataTypes.STRING(80),
    Contact: DataTypes.STRING(20),
    CreatedBy: { type: DataTypes.STRING(256), allowNull: false },
    CreationDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    departParent: DataTypes.STRING(200),
    status: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, { sequelize, modelName: 'Department', tableName: 'Department', timestamps: false });
  return Department;
};