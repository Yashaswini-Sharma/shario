#!/usr/bin/env node

const fetch = require('node-fetch');

async function testAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/dataset?limit=3&gender=Women');
    const data = await response.json();
    
    console.log('API Response:');
    console.log('Success:', data.success);
    console.log('Products count:', data.products ? data.products.length : 0);
    console.log('Has uploaded products:', data.products ? data.products.filter(p => p.isUploaded).length : 0);
    
    if (data.products && data.products.length > 0) {
      console.log('\nFirst product:');
      console.log(JSON.stringify(data.products[0], null, 2));
      
      console.log('\nUploaded products:');
      const uploaded = data.products.filter(p => p.isUploaded);
      uploaded.forEach(product => {
        console.log(`- ${product.name} (${product.articleType}) - Uploaded: ${product.isUploaded}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
