import db from '../src/lib/db';

async function verifyProductCRUD() {
  console.log('🧪 Starting Product CRUD & Category Association Verification...\n');

  try {
    // 1. READ (GET Products with Category Association)
    console.log('1️⃣ READ: Fetching all products from Neon DB with category details...');
    const products = await db.Product.findAll({
      order: [['createdAt', 'DESC']],
      include: db.Category
        ? [
            {
              model: db.Category,
              as: 'categoryDetails',
              attributes: ['id', 'name', 'image']
            }
          ]
        : []
    });

    console.log(`✅ Total products in DB: ${products.length}`);
    products.forEach((p: any) => {
      console.log(
        `   - [${p.id}] ${p.name} | SKU: ${p.sku} | Price: $${p.price} | Category: ${p.categoryName || p.categoryDetails?.name || 'N/A'}`
      );
    });

    // 2. CREATE Product
    console.log('\n2️⃣ CREATE: Adding a new test product linked to Category [cat-outerwear]...');
    const testId = `prod-test-${Date.now()}`;
    const newProduct = await db.Product.create({
      id: testId,
      sku: `SN-TEST-${Date.now().toString().slice(-4)}`,
      name: `Test Puffer Jacket ${Date.now()}`,
      slug: `test-puffer-jacket-${Date.now()}`,
      categoryId: 'cat-outerwear',
      categoryName: 'Outerwear & Jackets',
      price: 199.99,
      compareAtPrice: 249.99,
      stock: 50,
      description: 'Waterproof down puffer jacket engineered for extreme cold weather.',
      details: ['Waterproof shell', '800 fill power goose down', 'Internal storm cuffs'],
      images: ['https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000'],
      sizes: ['M', 'L', 'XL'],
      colors: [{ name: 'Matte Black', hex: '#111' }],
      featured: true,
      status: 'active'
    });
    console.log(`✅ Product Created: [${(newProduct as any).id}] ${(newProduct as any).name}`);

    // 3. UPDATE Product
    console.log('\n3️⃣ UPDATE: Updating price and stock of the created product...');
    const fetchedProduct = await db.Product.findByPk(testId);
    if (!fetchedProduct) throw new Error('Test product not found');

    await fetchedProduct.update({
      price: 179.99,
      stock: 45,
      description: 'Updated description: Heavyweight waterproof down puffer jacket.'
    });
    console.log(`✅ Product Updated: Price $${(fetchedProduct as any).price}, Stock: ${(fetchedProduct as any).stock}`);

    // 4. DELETE Product
    console.log('\n4️⃣ DELETE: Destroying test product...');
    await fetchedProduct.destroy();
    console.log(`✅ Product Deleted: [${testId}]`);

    const finalCount = await db.Product.count();
    console.log(`\n🎉 Verification Passed! Remaining active products in DB: ${finalCount}`);
  } catch (error) {
    console.error('❌ Verification Failed:', error);
  } finally {
    await db.sequelize.close();
  }
}

verifyProductCRUD();
