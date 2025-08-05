"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, let's get all constraints for the borrow table
    const [constraints] = await queryInterface.sequelize.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'borrow' 
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%member_id%'
    `);

    // Drop existing foreign key constraint for member_id if it exists
    if (constraints.length > 0) {
      const constraintName = constraints[0].constraint_name;
      await queryInterface.removeConstraint("borrow", constraintName);
    }

    // Add the foreign key constraint with correct table reference
    await queryInterface.addConstraint("borrow", {
      fields: ["member_id"],
      type: "foreign key",
      name: "borrow_borrower_id_fkey",
      references: {
        table: "borrower",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop the corrected foreign key constraint
    await queryInterface.removeConstraint("borrow", "borrow_borrower_id_fkey");

    // Recreate the old foreign key constraint (referencing member table)
    await queryInterface.addConstraint("borrow", {
      fields: ["member_id"],
      type: "foreign key",
      name: "borrow_member_id_fkey",
      references: {
        table: "member",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },
};
