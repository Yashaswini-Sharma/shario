const fs = require('fs')
const path = require('path')

// Helper functions
function generatePrice(articleType, masterCategory) {
  const priceRanges = {
    'Shirts': [25, 80],
    'Jeans': [40, 120],
    'Watches': [50, 300],
    'Shoes': [60, 200],
    'Bags': [30, 150],
    'Jackets': [60, 200],
    'Dresses': [35, 120],
    'Tops': [20, 60],
    'Tshirts': [15, 45]
  }
  
  const [min, max] = priceRanges[articleType] || [20, 100]
  return Math.floor(Math.random() * (max - min) + min)
}

function generateSizes(masterCategory, articleType, gender) {
  if (masterCategory === 'Footwear') {
    return gender === 'Men' ? ['7', '8', '9', '10', '11', '12'] : ['5', '6', '7', '8', '9', '10']
  }
  
  if (articleType === 'Watches' || masterCategory === 'Accessories') {
    return ['One Size']
  }

  return ['XS', 'S', 'M', 'L', 'XL']
}

function generateTags(data) {
  const tags = [
    data.gender?.toLowerCase(),
    data.masterCategory?.toLowerCase(),
    data.subCategory?.toLowerCase(),
    data.articleType?.toLowerCase(),
    data.baseColour?.toLowerCase().replace(' ', '-'),
    data.season?.toLowerCase(),
    data.usage?.toLowerCase()
  ]

  return [...new Set(tags.filter(tag => tag && tag !== 'null'))]
}

function generateDescription(data) {
  const templates = [
    `Stylish ${data.articleType?.toLowerCase()} in ${data.baseColour?.toLowerCase()} perfect for ${data.season?.toLowerCase()} ${data.usage?.toLowerCase()} wear.`,
    `Premium ${data.baseColour?.toLowerCase()} ${data.articleType?.toLowerCase()} designed for ${data.usage?.toLowerCase()} occasions during ${data.season?.toLowerCase()}.`,
    `Comfortable and trendy ${data.articleType?.toLowerCase()} featuring ${data.baseColour?.toLowerCase()} color, ideal for ${data.usage?.toLowerCase()} activities.`
  ]
  
  return templates[Math.floor(Math.random() * templates.length)]
}

function extractBrand(productName) {
  const knownBrands = ['Nike', 'Adidas', 'Puma', 'Reebok', 'Levis', 'Peter England', 'Arrow', 'Allen Solly', 'Turtle', 'Roadster', 'HRX', 'Wrangler']
  
  for (const brand of knownBrands) {
    if (productName?.toLowerCase().includes(brand.toLowerCase())) {
      return brand
    }
  }
  
  return 'Fashion Brand'
}

// Convert HF data to our product format
function convertToProduct(row) {
  const data = row.row
  
  // Map categories
  const categoryMapping = {
    'Apparel': 'Clothing',
    'Accessories': 'Accessories',
    'Personal Care': 'Beauty',
    'Footwear': 'Shoes'
  }

  // Generate pricing
  const basePrice = generatePrice(data.articleType, data.masterCategory)
  const discount = Math.random() > 0.7 ? Math.random() * 0.3 + 0.1 : 0
  const originalPrice = discount > 0 ? basePrice : undefined
  const finalPrice = discount > 0 ? basePrice * (1 - discount) : basePrice

  const sizes = generateSizes(data.masterCategory, data.articleType, data.gender)
  const tags = generateTags(data)

  return {
    id: `hf_${data.id}`,
    name: data.productDisplayName || 'Fashion Item',
    description: generateDescription(data),
    price: Math.round(finalPrice * 100) / 100,
    originalPrice: originalPrice ? Math.round(originalPrice * 100) / 100 : undefined,
    images: [data.image?.src || '/placeholder.jpg'],
    category: categoryMapping[data.masterCategory] || data.masterCategory || 'Fashion',
    subcategory: data.subCategory || '',
    brand: extractBrand(data.productDisplayName) || 'Fashion Brand',
    colors: [data.baseColour || 'Multi'],
    sizes: sizes,
    inStock: Math.random() > 0.1,
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
    reviews: Math.floor(Math.random() * 200) + 10,
    tags: tags,
    createdAt: new Date(data.year || 2024, 0, 1).toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// Convert products to CSV
function convertToCSV(products) {
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
      product.createdAt,
      product.updatedAt
    ]
    csvRows.push(row.join(','))
  })
  
  return csvRows.join('\n')
}

// Main processing
console.log('🔄 Processing Hugging Face data...')

const allProducts = []
const menProducts = []
const womenProducts = []

// Process each batch file
for (let i = 0; i < 3; i++) {
  const filePath = path.join(__dirname, '..', 'data', `batch_${i}.json`)
  
  if (fs.existsSync(filePath)) {
    console.log(`Processing batch_${i}.json...`)
    
    const batchData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    
    batchData.rows.forEach(row => {
      const product = convertToProduct(row)
      allProducts.push(product)
      
      if (row.row.gender === 'Men') {
        menProducts.push(product)
      } else if (row.row.gender === 'Women') {
        womenProducts.push(product)
      }
    })
  }
}

console.log(`✅ Processed ${allProducts.length} total products`)
console.log(`   - ${menProducts.length} men's products`)
console.log(`   - ${womenProducts.length} women's products`)

// Save processed data
const dataDir = path.join(__dirname, '..', 'data')

// Save as JSON
const jsonData = {
  all: allProducts,
  mens: menProducts,
  womens: womenProducts,
  lastUpdated: new Date().toISOString()
}

fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(jsonData, null, 2))

// Save as CSV
fs.writeFileSync(path.join(dataDir, 'all-products.csv'), convertToCSV(allProducts))
fs.writeFileSync(path.join(dataDir, 'mens-products.csv'), convertToCSV(menProducts))
fs.writeFileSync(path.join(dataDir, 'womens-products.csv'), convertToCSV(womenProducts))

console.log('💾 Saved processed data:')
console.log('   - data/products.json')
console.log('   - data/all-products.csv')
console.log('   - data/mens-products.csv')
console.log('   - data/womens-products.csv')

// Statistics
const categories = [...new Set(allProducts.map(p => p.category))]
const brands = [...new Set(allProducts.map(p => p.brand))]
const avgPrice = allProducts.reduce((sum, p) => sum + p.price, 0) / allProducts.length

console.log('\n📊 Statistics:')
console.log(`   Categories: ${categories.join(', ')}`)
console.log(`   Brands: ${brands.length} unique brands`)
console.log(`   Average price: $${avgPrice.toFixed(2)}`)
console.log(`   In stock: ${allProducts.filter(p => p.inStock).length}/${allProducts.length}`)

console.log('\n🎉 Processing complete!')