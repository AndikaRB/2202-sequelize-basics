'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Transaction extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Transaction.belongsTo(models.User)
            Transaction.hasMany(models.TransactionItem)
        }
    }
    Transaction.init(
        {
            payment_proof: {
                type: DataTypes.STRING,
            },
            total_price: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: "waiting for Payment"
            },
        },
        {
            sequelize,
            modelName: 'Transaction',
        }
    );
    return Transaction;
};