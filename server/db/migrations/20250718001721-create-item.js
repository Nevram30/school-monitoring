'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('item', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      i_deviceID: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      i_model: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      i_category: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      i_brand: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      i_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      i_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      item_rawstock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      i_status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '1=available, 2=borrowed, 3=maintenance, 4=damaged'
      },
      i_mr: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      i_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      i_photo: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: 'default.jpg'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('item');
  }
};
