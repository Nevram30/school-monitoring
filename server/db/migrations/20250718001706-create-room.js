'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('room', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      r_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      r_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      r_status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '1=active, 2=inactive'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('room');
  }
};
