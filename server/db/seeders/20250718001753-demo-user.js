'use strict';
const crypto = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if users already exist to prevent duplicate key errors
    const existingUsers = await queryInterface.sequelize.query(
      "SELECT username FROM user WHERE username IN ('admin', 'staff')",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    // Only insert if users don't already exist
    if (existingUsers.length === 0) {
      // Create MD5 hash for 'admin' password to match legacy system
      const adminPasswordHash = crypto.createHash('md5').update('admin').digest('hex');
      
      await queryInterface.bulkInsert('user', [
        {
          name: 'System Administrator',
          username: 'admin',
          password: adminPasswordHash,
          type: 1, // admin
          status: 1 // active
        },
        {
          name: 'Staff User',
          username: 'staff',
          password: adminPasswordHash, // same password for demo
          type: 2, // staff
          status: 1 // active
        }
      ], {});
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user', {
      username: ['admin', 'staff']
    }, {});
  }
};
