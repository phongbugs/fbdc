'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.customer, {
        foreignKey: 'customerId',
      });
      this.hasMany(models.subscriptionDetail)
    }
  }
  Subscription.init(
    {
      customerId: DataTypes.INTEGER,
      totalAmount: DataTypes.REAL,
      totalDay: DataTypes.INTEGER,
      status: DataTypes.BOOLEAN,
      expiredDate: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Subscription',
    }
  );
  return Subscription;
};
