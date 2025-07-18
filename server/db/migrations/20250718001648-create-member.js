'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('member', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      m_school_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      m_fname: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      m_lname: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      m_gender: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      m_contact: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      m_department: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      m_year_section: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      m_type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '1=student, 2=faculty, 3=staff'
      },
      m_password: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      m_status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '1=active, 2=inactive'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('member');
  }
};
