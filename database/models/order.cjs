'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // Define associations if necessary
    }
  }

  Order.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    subtotal: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    shipping: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    shippingAddress: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    status: {
      type: DataTypes.ENUM('Processing', 'Shipped', 'Delivered'),
      allowNull: false,
      defaultValue: 'Processing'
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'Orders',
    timestamps: true
  });

  return Order;
};
