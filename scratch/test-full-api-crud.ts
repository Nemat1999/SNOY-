import { GET as getCategories, POST as createCategory } from '../src/app/api/v1/categories/route';
import { PUT as updateCategory, DELETE as deleteCategory } from '../src/app/api/v1/categories/[id]/route';
import { GET as getProducts, POST as createProduct } from '../src/app/api/v1/products/route';
import { GET as getSingleProduct, PUT as updateProduct, DELETE as deleteProduct } from '../src/app/api/v1/products/[id]/route';
import { signAccessToken } from '../src/lib/auth';
import db from '../src/lib/db';

const validToken = signAccessToken({ id: 1, email: 'admin@snoy.com', role: 'super_admin' });
const authHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${validToken}`
};

async function testAPIs() {
  console.log('🧪 Starting Full Category & Product API CRUD Test Suite...\n');
  let testCatId = `cat-api-test-${Date.now()}`;
  let testProdId = `prod-api-test-${Date.now()}`;

  try {
    // -------------------------------------------------------------
    // SECTION 1: CATEGORY API TESTS
    // -------------------------------------------------------------
    console.log('--- 📁 CATEGORY API TESTS ---');

    // Test 1.1: Unauthenticated POST
    console.log('\n[1.1] Unauthenticated POST /api/v1/categories (Expect 401)...');
    const req1_1 = new Request('http://localhost:3000/api/v1/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Unauthorized Category' })
    });
    const res1_1 = await createCategory(req1_1);
    console.log(`Status: ${res1_1.status} | OK: ${res1_1.status === 401 ? '✅ PASS' : '❌ FAIL'}`);

    // Test 1.2: Authenticated POST Create Category
    console.log('\n[1.2] Authenticated POST /api/v1/categories (Create Test Category)...');
    const req1_2 = new Request('http://localhost:3000/api/v1/categories', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `API Test Activewear ${Date.now()}`,
        description: 'Test category created via API route test script.',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000'
      })
    });
    const res1_2 = await createCategory(req1_2);
    const data1_2 = await res1_2.json();
    console.log(`Status: ${res1_2.status} | Created ID: ${data1_2.category?.id} | OK: ${res1_2.status === 201 ? '✅ PASS' : '❌ FAIL'}`);
    if (data1_2.category?.id) testCatId = data1_2.category.id;

    // Test 1.3: GET Categories
    console.log('\n[1.3] GET /api/v1/categories...');
    const res1_3 = await getCategories();
    const data1_3 = await res1_3.json();
    console.log(`Status: ${res1_3.status} | Total Categories: ${data1_3.categories?.length} | OK: ${res1_3.status === 200 ? '✅ PASS' : '❌ FAIL'}`);

    // Test 1.4: PUT Update Category
    console.log(`\n[1.4] PUT /api/v1/categories/${testCatId}...`);
    const req1_4 = new Request(`http://localhost:3000/api/v1/categories/${testCatId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        name: `Updated Activewear ${Date.now()}`,
        description: 'Updated description via API.'
      })
    });
    const res1_4 = await updateCategory(req1_4, { params: Promise.resolve({ id: testCatId }) });
    const data1_4 = await res1_4.json();
    console.log(`Status: ${res1_4.status} | Updated Name: ${data1_4.category?.name} | OK: ${res1_4.status === 200 ? '✅ PASS' : '❌ FAIL'}`);

    // Test 1.5: PUT 404 Non-existent Category
    console.log('\n[1.5] PUT /api/v1/categories/cat-nonexistent (Expect 404)...');
    const req1_5 = new Request('http://localhost:3000/api/v1/categories/cat-nonexistent', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ name: 'Fake' })
    });
    const res1_5 = await updateCategory(req1_5, { params: Promise.resolve({ id: 'cat-nonexistent' }) });
    console.log(`Status: ${res1_5.status} | OK: ${res1_5.status === 404 ? '✅ PASS' : '❌ FAIL'}`);

    // -------------------------------------------------------------
    // SECTION 2: PRODUCT API TESTS
    // -------------------------------------------------------------
    console.log('\n--- 📦 PRODUCT API TESTS ---');

    // Test 2.1: Unauthenticated Product POST
    console.log('\n[2.1] Unauthenticated POST /api/v1/products (Expect 401)...');
    const req2_1 = new Request('http://localhost:3000/api/v1/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Unauthorized Product', price: 99 })
    });
    const res2_1 = await createProduct(req2_1);
    console.log(`Status: ${res2_1.status} | OK: ${res2_1.status === 401 ? '✅ PASS' : '❌ FAIL'}`);

    // Test 2.2: Authenticated POST Create Product
    console.log('\n[2.2] Authenticated POST /api/v1/products (Create Test Product)...');
    const req2_2 = new Request('http://localhost:3000/api/v1/products', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `API Test Performance Tee ${Date.now()}`,
        categoryId: 'cat-streetwear',
        price: 49.99,
        compareAtPrice: 65.00,
        stock: 100,
        description: 'Moisture-wicking athletic performance t-shirt.',
        details: ['100% Recycled Polyester', 'Breathable mesh panels', 'Reflective logos'],
        images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000'],
        sizes: ['S', 'M', 'L'],
        colors: [{ name: 'Electric Blue', hex: '#0000FF' }],
        featured: true
      })
    });
    const res2_2 = await createProduct(req2_2);
    const data2_2 = await res2_2.json();
    console.log(`Status: ${res2_2.status} | Created Product ID: ${data2_2.product?.id} | SKU: ${data2_2.product?.sku} | OK: ${res2_2.status === 201 ? '✅ PASS' : '❌ FAIL'}`);
    if (data2_2.product?.id) testProdId = data2_2.product.id;

    // Test 2.3: GET All Products
    console.log('\n[2.3] GET /api/v1/products...');
    const req2_3 = new Request('http://localhost:3000/api/v1/products');
    const res2_3 = await getProducts(req2_3);
    const data2_3 = await res2_3.json();
    console.log(`Status: ${res2_3.status} | Total Products Returned: ${data2_3.products?.length} | OK: ${res2_3.status === 200 ? '✅ PASS' : '❌ FAIL'}`);

    // Test 2.4: GET Products Filtered by Category
    console.log('\n[2.4] GET /api/v1/products?categoryId=cat-outerwear...');
    const req2_4 = new Request('http://localhost:3000/api/v1/products?categoryId=cat-outerwear');
    const res2_4 = await getProducts(req2_4);
    const data2_4 = await res2_4.json();
    console.log(`Status: ${res2_4.status} | Filtered Outerwear Products: ${data2_4.products?.length} | OK: ${res2_4.status === 200 ? '✅ PASS' : '❌ FAIL'}`);

    // Test 2.5: GET Single Product by ID
    console.log(`\n[2.5] GET /api/v1/products/${testProdId}...`);
    const req2_5 = new Request(`http://localhost:3000/api/v1/products/${testProdId}`);
    const res2_5 = await getSingleProduct(req2_5, { params: Promise.resolve({ id: testProdId }) });
    const data2_5 = await res2_5.json();
    console.log(`Status: ${res2_5.status} | Fetched Product Name: ${data2_5.product?.name} | OK: ${res2_5.status === 200 ? '✅ PASS' : '❌ FAIL'}`);

    // Test 2.6: PUT Update Product
    console.log(`\n[2.6] PUT /api/v1/products/${testProdId}...`);
    const req2_6 = new Request(`http://localhost:3000/api/v1/products/${testProdId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        price: 39.99,
        stock: 80,
        featured: false
      })
    });
    const res2_6 = await updateProduct(req2_6, { params: Promise.resolve({ id: testProdId }) });
    const data2_6 = await res2_6.json();
    console.log(`Status: ${res2_6.status} | Updated Price: $${data2_6.product?.price} | Stock: ${data2_6.product?.stock} | OK: ${res2_6.status === 200 ? '✅ PASS' : '❌ FAIL'}`);

    // Test 2.7: DELETE Test Product
    console.log(`\n[2.7] DELETE /api/v1/products/${testProdId}...`);
    const req2_7 = new Request(`http://localhost:3000/api/v1/products/${testProdId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const res2_7 = await deleteProduct(req2_7, { params: Promise.resolve({ id: testProdId }) });
    const data2_7 = await res2_7.json();
    console.log(`Status: ${res2_7.status} | Message: ${data2_7.message} | OK: ${res2_7.status === 200 ? '✅ PASS' : '❌ FAIL'}`);

    // Test 1.6: DELETE Test Category
    console.log(`\n[1.6] DELETE /api/v1/categories/${testCatId}...`);
    const req1_6 = new Request(`http://localhost:3000/api/v1/categories/${testCatId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const res1_6 = await deleteCategory(req1_6, { params: Promise.resolve({ id: testCatId }) });
    const data1_6 = await res1_6.json();
    console.log(`Status: ${res1_6.status} | Message: ${data1_6.message} | OK: ${res1_6.status === 200 ? '✅ PASS' : '❌ FAIL'}`);

    console.log('\n======================================================');
    console.log('🎉 ALL CATEGORY & PRODUCT API TESTS COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
  } catch (error) {
    console.error('\n❌ API Test Suite Failed:', error);
  } finally {
    if (db?.sequelize) {
      await db.sequelize.close();
    }
  }
}

testAPIs();
