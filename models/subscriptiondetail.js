'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SubscriptionDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.subscription, {
        foreignKey: 'subscriptionId',
      });
    }
  }
  SubscriptionDetail.init({
    subscriptionId: DataTypes.INTEGER,
    amount: DataTypes.REAL,
    subscriptionDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'SubscriptionDetail',
  });
  return SubscriptionDetail;
};
