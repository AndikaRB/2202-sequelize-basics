'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Expense)
      User.hasMany(models.Post)
      User.hasMany(models.Comment)
      User.hasMany(models.Transaction)
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      login_attempts: {
        defaultValue: 0,
        type: DataTypes.INTEGER,
      },
      is_suspended: {
        defaultValue: false,
        type: DataTypes.BOOLEAN
      },
      profile_picture: DataTypes.STRING,
      is_verified: {
        defaultValue: false,
        type: DataTypes.BOOLEAN
      },
      is_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};