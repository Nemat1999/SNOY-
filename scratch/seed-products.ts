import db from '../src/lib/db';

const sampleProducts = [
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
    details: ['100% Italian Calfskin Leather', 'Satin interior lining', 'Asymmetric zip closure', 'Dry clean only'],
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Onyx Black', hex: '#111111' }, { name: 'Espresso', hex: '#3D2314' }],
    featured: true,
    status: 'active',
    rating: 4.9,
    reviewCount: 28
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
    details: ['80% Virgin Wool, 20% Cashmere', 'Horn button closure', 'Removable waist belt'],
    images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000'],
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: 'Camel', hex: '#C19A6B' }, { name: 'Midnight Navy', hex: '#000080' }],
    featured: true,
    status: 'active',
    rating: 4.8,
    reviewCount: 19
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
    details: ['Full-grain upper leather', 'Goodyear welt construction', 'Elastic side gussets'],
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000'],
    sizes: ['40', '41', '42', '43', '44'],
    colors: [{ name: 'Chestnut Brown', hex: '#5C4033' }, { name: 'Jet Black', hex: '#0A0A0A' }],
    featured: true,
    status: 'active',
    rating: 5.0,
    reviewCount: 42
  },
  {
    id: 'prod-monk-straps',
    sku: 'SN-FTW-002',
    name: 'Double Monk Strap Dress Shoes',
    slug: 'double-monk-strap-dress-shoes',
    categoryId: 'cat-footwear',
    categoryName: 'Luxury Footwear',
    price: 259.00,
    compareAtPrice: 310.00,
    stock: 15,
    description: 'Polished calfskin leather monk straps featuring silver brass buckles and hand-burnished toe.',
    details: ['Hand-burnished calfskin', 'Silver buckle detail', 'Leather sole with rubber insert'],
    images: ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1000'],
    sizes: ['41', '42', '43', '44'],
    colors: [{ name: 'Oxblood Red', hex: '#4A0E17' }, { name: 'Cognac', hex: '#9E4714' }],
    featured: false,
    status: 'active',
    rating: 4.7,
    reviewCount: 15
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
    details: ['Super 120s Italian Wool', 'Half-canvas construction', 'Flat-front trousers'],
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000'],
    sizes: ['38R', '40R', '42R', '44R'],
    colors: [{ name: 'Charcoal Grey', hex: '#36454F' }, { name: 'Deep Navy', hex: '#1B263B' }],
    featured: true,
    status: 'active',
    rating: 4.9,
    reviewCount: 34
  },
  {
    id: 'prod-leather-belt',
    sku: 'SN-ACC-001',
    name: 'Full-Grain Leather Dress Belt',
    slug: 'full-grain-leather-dress-belt',
    categoryId: 'cat-accessories',
    categoryName: 'Accessories & Leather Goods',
    price: 79.99,
    compareAtPrice: 95.00,
    stock: 50,
    description: 'Hand-stitched vegetable-tanned leather belt with brushed stainless steel buckle.',
    details: ['Vegetable-tanned leather', '35mm width', 'Made in Italy'],
    images: ['https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=1000'],
    sizes: ['32', '34', '36', '38'],
    colors: [{ name: 'Classic Black', hex: '#000000' }, { name: 'Mahogany', hex: '#4A2511' }],
    featured: false,
    status: 'active',
    rating: 4.8,
    reviewCount: 52
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
    details: ['500 GSM 100% Organic Cotton', 'Pre-shrunk fabric', 'Kangaroo pocket'],
    images: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Washed Black', hex: '#1C1C1C' }, { name: 'Heather Grey', hex: '#D3D3D3' }],
    featured: true,
    status: 'active',
    rating: 4.9,
    reviewCount: 61
  }
];

async function seedProducts() {
  console.log('🚀 Seeding sample professional products into Neon DB...');

  try {
    await db.sequelize.sync();

    for (const prod of sampleProducts) {
      const [record, created] = await db.Product.findOrCreate({
        where: { id: prod.id },
        defaults: prod
      });

      if (!created) {
        await record.update(prod);
        console.log(`✅ Updated Product: ${prod.name} (${prod.id})`);
      } else {
        console.log(`✨ Created Product: ${prod.name} (${prod.id})`);
      }
    }

    const total = await db.Product.count();
    console.log(`\n🎉 Product Seeding Complete! Total products in DB: ${total}`);
  } catch (error) {
    console.error('❌ Product Seeding Failed:', error);
  } finally {
    await db.sequelize.close();
  }
}

seedProducts();
