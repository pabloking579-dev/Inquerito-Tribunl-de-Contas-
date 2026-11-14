const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const InqueritoFuncionario = sequelize.define('InqueritoFuncionario', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        inquerito_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        funcionario_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'InqueritoFuncionario',
        timestamps: false
    });

    return InqueritoFuncionario;
};