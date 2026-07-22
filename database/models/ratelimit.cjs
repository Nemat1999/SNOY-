'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RateLimit extends Model {
    static associate(models) {
      // No associations needed
    }
  }
  RateLimit.init({
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    windowStart: {
      type: DataTypes.DATE,
      allowNull: false
    },
    blockedUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    }
  }, {
    sequelize,
    modelName: 'RateLimit',
    tableName: 'RateLimits',
    timestamps: true
  });
  return RateLimit;
};
