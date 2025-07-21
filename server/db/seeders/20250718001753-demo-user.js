'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if users already exist to prevent duplicate key errors
    const existingUsers = await queryInterface.sequelize.query(
      "SELECT username FROM user WHERE username IN ('admin', 'staff', 'faculty')",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    // Only insert if users don't already exist
    if (existingUsers.length === 0) {
      // Create bcrypt hash for 'admin' password
      const saltRounds = 10;
      const adminPasswordHash = await bcrypt.hash('admin', saltRounds);
      const staffPasswordHash = await bcrypt.hash('staff', saltRounds);
      const facultyPasswordHash = await bcrypt.hash('faculty', saltRounds);
      await queryInterface.bulkInsert('user', [
        {
          name: 'System Administrator',
          username: 'admin',
          password: adminPasswordHash,
          role: 'admin',
          status: 1 // active
        },
        {
          name: 'Staff User',
          username: 'staff',
          password: staffPasswordHash, // same password for demo
          role: 'staff', // using correct enum value
          status: 1 // active
        },
        {
          name: 'Faculty User',
          username: 'faculty',
          password: facultyPasswordHash, // same password for demo
          role: 'faculty',
          status: 1 // active
        }
      ], {});
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user', {
      username: ['admin', 'staff', 'faculty']
    }, {});
  }
};
