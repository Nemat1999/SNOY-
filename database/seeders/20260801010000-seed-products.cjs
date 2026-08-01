'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const products = [
      {
        id: 'prod-biker-jacket',
        sku: 'SN-OUT-001',
        name: 'Italian Leather Biker Jacket',
        slug: 'italian-leather-biker-jacket',
        categoryId: 'cat-outerwear',
        categoryName: 'Outerwear & Jackets',
        price: 349.99,
        compareAtPrice: 420.00,
        stock: 25,
        description: 'Handcrafted from 100% Italian calfskin leather with asymmetric YKK zippers and satin lining.',
        details: JSON.stringify(['100% Italian Calfskin Leather', 'Satin interior lining', 'Asymmetric zip closure', 'Dry clean only']),
        images: JSON.stringify(['https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify([{ name: 'Onyx Black', hex: '#111111' }, { name: 'Espresso', hex: '#3D2314' }]),
        featured: true,
        status: 'active',
        rating: 4.9,
        reviewCount: 28,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod-trench-coat',
        sku: 'SN-OUT-002',
        name: 'Minimalist Wool Trench Coat',
        slug: 'minimalist-wool-trench-coat',
        categoryId: 'cat-outerwear',
        categoryName: 'Outerwear & Jackets',
        price: 289.00,
        compareAtPrice: 350.00,
        stock: 18,
        description: 'Double-breasted trench coat fashioned from heavyweight virgin wool blend for refined winter warmth.',
        details: JSON.stringify(['80% Virgin Wool, 20% Cashmere', 'Horn button closure', 'Removable waist belt']),
        images: JSON.stringify(['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000']),
        sizes: JSON.stringify(['M', 'L', 'XL']),
        colors: JSON.stringify([{ name: 'Camel', hex: '#C19A6B' }, { name: 'Midnight Navy', hex: '#000080' }]),
        featured: true,
        status: 'active',
        rating: 4.8,
        reviewCount: 19,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod-chelsea-boots',
        sku: 'SN-FTW-001',
        name: 'Artisanal Chelsea Boots',
        slug: 'artisanal-chelsea-boots',
        categoryId: 'cat-footwear',
        categoryName: 'Luxury Footwear',
        price: 229.50,
        compareAtPrice: 280.00,
        stock: 40,
        description: 'Goodyear welted Chelsea boots crafted with full-grain leather and stacked wooden heel.',
        details: JSON.stringify(['Full-grain upper leather', 'Goodyear welt construction', 'Elastic side gussets']),
        images: JSON.stringify(['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000']),
        sizes: JSON.stringify(['40', '41', '42', '43', '44']),
        colors: JSON.stringify([{ name: 'Chestnut Brown', hex: '#5C4033' }, { name: 'Jet Black', hex: '#0A0A0A' }]),
        featured: true,
        status: 'active',
        rating: 5.0,
        reviewCount: 42,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod-slim-suit',
        sku: 'SN-TLR-001',
        name: 'Executive Slim-Fit Wool Suit',
        slug: 'executive-slim-fit-wool-suit',
        categoryId: 'cat-tailored',
        categoryName: 'Tailored Apparel',
        price: 499.00,
        compareAtPrice: 650.00,
        stock: 12,
        description: 'Two-piece tailored suit tailored from Super 120s Italian wool with notch lapels.',
        details: JSON.stringify(['Super 120s Italian Wool', 'Half-canvas construction', 'Flat-front trousers']),
        images: JSON.stringify(['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000']),
        sizes: JSON.stringify(['38R', '40R', '42R', '44R']),
        colors: JSON.stringify([{ name: 'Charcoal Grey', hex: '#36454F' }, { name: 'Deep Navy', hex: '#1B263B' }]),
        featured: true,
        status: 'active',
        rating: 4.9,
        reviewCount: 34,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod-heavy-hoodie',
        sku: 'SN-STR-001',
        name: 'Heavyweight French Terry Hoodie',
        slug: 'heavyweight-french-terry-hoodie',
        categoryId: 'cat-streetwear',
        categoryName: 'Streetwear & Essentials',
        price: 119.00,
        compareAtPrice: 140.00,
        stock: 60,
        description: '500 GSM organic cotton French terry oversized hoodie with double-walled hood.',
        details: JSON.stringify(['500 GSM 100% Organic Cotton', 'Pre-shrunk fabric', 'Kangaroo pocket']),
        images: JSON.stringify(['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify([{ name: 'Washed Black', hex: '#1C1C1C' }, { name: 'Heather Grey', hex: '#D3D3D3' }]),
        featured: true,
        status: 'active',
        rating: 4.9,
        reviewCount: 61,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const prod of products) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM "Products" WHERE id = '${prod.id}' OR sku = '${prod.sku}';`
      );

      if (!existing || existing.length === 0) {
        await queryInterface.bulkInsert('Products', [prod], {});
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {});
  }
};
