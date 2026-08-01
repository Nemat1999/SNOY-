import db from '../src/lib/db';

async function verifyCRUD() {
  console.log('🧪 Starting Category CRUD End-to-End Verification...\n');

  try {
    // 1. READ (GET All)
    console.log('1️⃣ READ: Fetching all categories from DB...');
    const allCategories = await db.Category.findAll({
      order: [['createdAt', 'DESC']]
    });
    console.log(`✅ Found ${allCategories.length} categories in DB.`);
    allCategories.forEach((cat: any) => console.log(`   - [${cat.id}] ${cat.name}`));

    // 2. CREATE (POST Test)
    console.log('\n2️⃣ CREATE: Creating a new test category...');
    const testId = `cat-test-${Date.now()}`;
    const newCat = await db.Category.create({
      id: testId,
      name: `Test Activewear ${Date.now()}`,
      description: 'High-performance activewear and gym essentials.',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000'
    });
    console.log(`✅ Category Created: [${(newCat as any).id}] ${(newCat as any).name}`);

    // 3. UPDATE (PUT Test)
    console.log('\n3️⃣ UPDATE: Modifying the created test category...');
    const fetchedCat = await db.Category.findByPk(testId);
    if (!fetchedCat) throw new Error('Created category not found for update');
    
    await fetchedCat.update({
      description: 'Updated activewear description with breathable fabrics.',
      name: `Updated Activewear ${Date.now()}`
    });
    console.log(`✅ Category Updated: [${(fetchedCat as any).id}] ${(fetchedCat as any).name}`);

    // 4. DELETE (DELETE Test)
    console.log('\n4️⃣ DELETE: Removing test category from DB...');
    await fetchedCat.destroy();
    console.log(`✅ Category Destroyed: [${testId}]`);

    // Final check
    const finalCount = await db.Category.count();
    console.log(`\n🎉 Verification Successful! Total active categories remaining in DB: ${finalCount}`);
  } catch (error) {
    console.error('❌ Verification Failed:', error);
  } finally {
    await db.sequelize.close();
  }
}

verifyCRUD();
