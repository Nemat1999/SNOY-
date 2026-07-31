'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const categories = [
      {
        id: 'cat-outerwear',
        name: 'Outerwear & Jackets',
        description: 'Premium leather jackets, wool coats, and urban streetwear coats crafted for timeless elegance.',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cat-footwear',
        name: 'Luxury Footwear',
        description: 'Handcrafted leather boots, high-top sneakers, and elegant formal shoes built with superior durability.',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cat-tailored',
        name: 'Tailored Apparel',
        description: 'Custom-fitted suits, blazers, and luxury formal shirts designed for sophisticated modern style.',
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cat-accessories',
        name: 'Accessories & Leather Goods',
        description: 'Designer leather belts, minimalist wallets, silk ties, and premium handcrafted timepieces.',
        image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=1000',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cat-streetwear',
        name: 'Streetwear & Essentials',
        description: 'High-density heavy cotton tees, luxury oversized hoodies, and designer comfortable sweatpants.',
        image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const cat of categories) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM "Categories" WHERE id = '${cat.id}' OR name = '${cat.name.replace(/'/g, "''")}';`
      );

      if (!existing || existing.length === 0) {
        await queryInterface.bulkInsert('Categories', [cat], {});
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};
