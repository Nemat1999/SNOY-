'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.STRING,
        allowNull: false
      },
      items: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      subtotal: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      shipping: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      total: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      shippingAddress: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {}
      },
      status: {
        type: Sequelize.STRING, // Using string instead of enum directly in PG migration to avoid enum creation issues, or enum
        allowNull: false,
        defaultValue: 'Processing'
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
    await queryInterface.dropTable('Orders');
  }
};
