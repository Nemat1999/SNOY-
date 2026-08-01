'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      categoryId: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'Categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      categoryName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      compareAtPrice: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      details: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      sizes: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      colors: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      featured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active'
      },
      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 5.0
      },
      reviewCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
};
