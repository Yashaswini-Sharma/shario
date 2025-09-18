import fs from 'fs'
import path from 'path'
import { HuggingFaceDatasetService } from '../lib/huggingface-dataset-service'
import { Product } from '../lib/types'

// Convert to CSV format
function convertProductsToCSV(products: Product[]): string {
  const headers = [
    'id', 'name', 'description', 'price', 'originalPrice', 'images', 
    'category', 'subcategory', 'brand', 'colors', 'sizes', 'inStock', 
    'rating', 'reviews', 'tags', 'createdAt', 'updatedAt'
  ]
  
  const csvRows = [headers.join(',')]
  
  products.forEach(product => {
    const row = [
      product.id,
      `"${product.name.replace(/"/g, '""')}"`,
      `"${product.description.replace(/"/g, '""')}"`,
      product.price,
      product.originalPrice || '',
      `"${product.images.join(';')}"`,
      product.category,
      product.subcategory || '',
      product.brand || '',
      `"${product.colors.join(';')}"`,
      `"${product.sizes.join(';')}"`,
      product.inStock,
      product.rating || '',
      product.reviews || '',
      `"${product.tags.join(';')}"`,
      product.createdAt.toISOString(),
      product.updatedAt.toISOString()
    ]
    csvRows.push(row.join(','))
  })
  
  return csvRows.join('\n')
}

async function main() {
  console.log('🚀 Starting Hugging Face dataset import...')
  
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    console.log('📥 Fetching products from Hugging Face dataset...')
    
    // Fetch different categories
    console.log('Fetching men\'s products...')
    const menProducts = await HuggingFaceDatasetService.fetchProductsByGender('Men', 100)
    
    console.log('Fetching women\'s products...')
    const womenProducts = await HuggingFaceDatasetService.fetchProductsByGender('Women', 100)
    
    console.log('Fetching all products...')
    const allProducts = await HuggingFaceDatasetService.getAllProducts(300)
    
    console.log(`✅ Fetched ${menProducts.length} men's products`)
    console.log(`✅ Fetched ${womenProducts.length} women's products`)  
    console.log(`✅ Fetched ${allProducts.length} total products`)
    
    // Save to CSV files
    const menCSV = convertProductsToCSV(menProducts)
    const womenCSV = convertProductsToCSV(womenProducts)
    const allCSV = convertProductsToCSV(allProducts)
    
    fs.writeFileSync(path.join(dataDir, 'mens-products.csv'), menCSV)
    fs.writeFileSync(path.join(dataDir, 'womens-products.csv'), womenCSV)
    fs.writeFileSync(path.join(dataDir, 'all-products.csv'), allCSV)
    
    console.log('💾 Saved product data to CSV files:')
    console.log('   - data/mens-products.csv')
    console.log('   - data/womens-products.csv')
    console.log('   - data/all-products.csv')
    
    // Also save as JSON for easier programmatic access
    const jsonData = {
      mens: menProducts,
      womens: womenProducts,
      all: allProducts,
      lastUpdated: new Date().toISOString()
    }
    
    fs.writeFileSync(
      path.join(dataDir, 'products.json'), 
      JSON.stringify(jsonData, null, 2)
    )
    
    console.log('   - data/products.json')
    console.log('🎉 Import completed successfully!')
    
    // Print some statistics
    const categories = [...new Set(allProducts.map(p => p.category))]
    const subcategories = [...new Set(allProducts.map(p => p.subcategory).filter(Boolean))]
    const brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))]
    
    console.log('\n📊 Statistics:')
    console.log(`   Categories: ${categories.join(', ')}`)
    console.log(`   Subcategories: ${subcategories.length}`)
    console.log(`   Brands: ${brands.length}`)
    console.log(`   Average price: $${(allProducts.reduce((sum, p) => sum + p.price, 0) / allProducts.length).toFixed(2)}`)
    
  } catch (error) {
    console.error('❌ Error during import:', error)
    process.exit(1)
  }
}

main()