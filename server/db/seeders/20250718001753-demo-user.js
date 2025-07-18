'use strict';
const crypto = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
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
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user', null, {});
  }
};
