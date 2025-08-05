"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename the table from 'member' to 'borrower'
    await queryInterface.renameTable("member", "borrower");
  },

  async down(queryInterface, Sequelize) {
    // Revert: rename the table from 'borrower' back to 'member'
    await queryInterface.renameTable("borrower", "member");
  },
};
