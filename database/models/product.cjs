'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      if (models.Category) {
        Product.belongsTo(models.Category, {
          foreignKey: 'categoryId',
          as: 'categoryDetails',
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        });
      }
    }
  }

  Product.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    categoryId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      }
    },
    categoryName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    compareAtPrice: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    sizes: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    colors: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('active', 'draft', 'out_of_stock'),
      allowNull: false,
      defaultValue: 'active'
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 5.0
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'Products',
    timestamps: true
  });

  return Product;
};
