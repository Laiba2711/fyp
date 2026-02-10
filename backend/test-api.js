// Test script for product API endpoints
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAPIEndpoints() {
  console.log('Testing Product API Endpoints...\n');
  
  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test get all products
    console.log('\n2. Testing get all products...');
    const allProductsResponse = await axios.get(`${API_BASE_URL}/products`);
    console.log('✅ All products count:', allProductsResponse.data.total);
    
    // Test get featured products
    console.log('\n3. Testing get featured products...');
    const featuredResponse = await axios.get(`${API_BASE_URL}/products/featured`);
    console.log('✅ Featured products count:', featuredResponse.data.length);
    
    // Test get product by ID
    console.log('\n4. Testing get product by ID...');
    if (allProductsResponse.data.products.length > 0) {
      const productId = allProductsResponse.data.products[0]._id;
      const productResponse = await axios.get(`${API_BASE_URL}/products/${productId}`);
      console.log('✅ Product found:', productResponse.data.name);
    }
    
    // Test get recommendations
    console.log('\n5. Testing get recommendations...');
    if (allProductsResponse.data.products.length > 0) {
      const productId = allProductsResponse.data.products[0]._id;
      const recommendationsResponse = await axios.get(`${API_BASE_URL}/products/${productId}/recommendations`);
      console.log('✅ Recommendations count:', recommendationsResponse.data.length);
    }
    
    // Test get categories with stats
    console.log('\n6. Testing get categories with stats...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/products/categories/stats`);
    console.log('✅ Categories count:', categoriesResponse.data.length);
    
    // Test get price stats
    console.log('\n7. Testing get price stats...');
    const priceStatsResponse = await axios.get(`${API_BASE_URL}/products/price-stats`);
    console.log('✅ Price stats:', priceStatsResponse.data);
    
    // Test filtering
    console.log('\n8. Testing filtering by category...');
    const menProductsResponse = await axios.get(`${API_BASE_URL}/products?category=men`);
    console.log('✅ Men products count:', menProductsResponse.data.total);
    
    // Test search
    console.log('\n9. Testing search functionality...');
    const searchResponse = await axios.get(`${API_BASE_URL}/products?search=cotton`);
    console.log('✅ Search results count:', searchResponse.data.total);
    
    // Test pagination
    console.log('\n10. Testing pagination...');
    const paginatedResponse = await axios.get(`${API_BASE_URL}/products?page=1&limit=4`);
    console.log('✅ Paginated results count:', paginatedResponse.data.products.length);
    console.log('✅ Total pages:', paginatedResponse.data.pages);
    
    console.log('\n🎉 All API endpoints tested successfully!');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error: Could not reach the server');
      console.error('Please make sure the backend server is running on port 5000');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Run the tests
testAPIEndpoints();