"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("item", "no_of_items", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn("item", "remarks", {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("item", "no_of_items");
    await queryInterface.removeColumn("item", "remarks");
  },
};
