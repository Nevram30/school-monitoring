"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("returns", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      borrow_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "borrow",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      member_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "borrower",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "item",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      room_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "room",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      r_date_returned: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      r_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      r_condition: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Condition of item when returned (Good, Damaged, Lost, etc.)",
      },
      r_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Additional notes about the return",
      },
      r_late_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0,
        comment: "Late fee if applicable",
      },
      r_damage_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0,
        comment: "Damage fee if applicable",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex("returns", ["borrow_id"]);
    await queryInterface.addIndex("returns", ["member_id"]);
    await queryInterface.addIndex("returns", ["item_id"]);
    await queryInterface.addIndex("returns", ["r_date_returned"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("returns");
  },
};
