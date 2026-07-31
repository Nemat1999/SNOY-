import db from '../src/lib/db';

const initialCategories = [
  {
    id: 'cat-outerwear',
    name: 'Outerwear & Jackets',
    description: 'Premium leather jackets, wool coats, and urban streetwear coats crafted for timeless elegance.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000'
  },
  {
    id: 'cat-footwear',
    name: 'Luxury Footwear',
    description: 'Handcrafted leather boots, high-top sneakers, and elegant formal shoes built with superior durability.',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000'
  },
  {
    id: 'cat-tailored',
    name: 'Tailored Apparel',
    description: 'Custom-fitted suits, blazers, and luxury formal shirts designed for sophisticated modern style.',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000'
  },
  {
    id: 'cat-accessories',
    name: 'Accessories & Leather Goods',
    description: 'Designer leather belts, minimalist wallets, silk ties, and premium handcrafted timepieces.',
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=1000'
  },
  {
    id: 'cat-streetwear',
    name: 'Streetwear & Essentials',
    description: 'High-density heavy cotton tees, luxury oversized hoodies, and designer comfortable sweatpants.',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000'
  }
];

async function seed() {
  console.log('🚀 Syncing database & seeding categories...');
  try {
    await db.sequelize.sync();

    for (const cat of initialCategories) {
      const [record, created] = await db.Category.findOrCreate({
        where: { id: cat.id },
        defaults: cat
      });

      if (!created) {
        await record.update(cat);
        console.log(`✅ Updated existing category: ${cat.name} (${cat.id})`);
      } else {
        console.log(`✨ Created new category: ${cat.name} (${cat.id})`);
      }
    }

    const categories = await db.Category.findAll();
    console.log(`\n🎉 Seeding complete! Categories in DB (${categories.length}):`);
    categories.forEach((c: any) => console.log(`- ${c.name} [${c.id}]`));
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await db.sequelize.close();
  }
}

seed();
