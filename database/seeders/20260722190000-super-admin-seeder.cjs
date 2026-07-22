'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@snoy.com';
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Upsert or check if user already exists
    const [existingUsers] = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = '${adminEmail}' LIMIT 1;`
    );

    if (!existingUsers || existingUsers.length === 0) {
      await queryInterface.bulkInsert('Users', [{
        name: adminName,
        email: adminEmail.toLowerCase().trim(),
        password: hashedPassword,
        role: 'super_admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
      console.log(`\n✅ Super Admin created successfully:`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}\n`);
    } else {
      console.log(`\n⚠️ Super Admin with email ${adminEmail} already exists. Skipping insertion.\n`);
    }
  },

  async down(queryInterface, Sequelize) {
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@snoy.com';
    await queryInterface.bulkDelete('Users', { email: adminEmail }, {});
  }
};
