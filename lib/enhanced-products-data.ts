import fs from 'fs'
import path from 'path'
import { Product } from './types'
import { HuggingFaceDatasetService } from './huggingface-dataset-service'

// Cache for loaded products
let cachedProducts: {
  all: Product[]
  mens: Product[]
  womens: Product[]
  lastLoaded?: Date
} | null = null

/**
 * Load products from cached JSON file or fetch from Hugging Face
 */
async function loadProducts(): Promise<{
  all: Product[]
  mens: Product[]
  womens: Product[]
}> {
  // Return cached data if available and recent (less than 1 hour old)
  if (cachedProducts && cachedProducts.lastLoaded && 
      Date.now() - cachedProducts.lastLoaded.getTime() < 3600000) {
    return cachedProducts
  }

  const dataPath = path.join(process.cwd(), 'data', 'products.json')
  
  try {
    // Try to load from cached file first
    if (fs.existsSync(dataPath)) {
      console.log('Loading products from cached file...')
      const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
      
      // Convert date strings back to Date objects
      const convertDates = (products: any[]): Product[] => {
        return products.map(p => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }))
      }
      
      cachedProducts = {
        all: convertDates(jsonData.all),
        mens: convertDates(jsonData.mens),
        womens: convertDates(jsonData.womens),
        lastLoaded: new Date()
      }
      
      return cachedProducts
    }
  } catch (error) {
    console.warn('Could not load cached products, fetching fresh data...')
  }
  
  // Fetch fresh data from Hugging Face
  console.log('Fetching fresh products from Hugging Face...')
  try {
    const [mensProducts, womensProducts, allProducts] = await Promise.all([
      HuggingFaceDatasetService.fetchProductsByGender('Men', 50),
      HuggingFaceDatasetService.fetchProductsByGender('Women', 50),
      HuggingFaceDatasetService.getAllProducts(150)
    ])
    
    cachedProducts = {
      all: allProducts,
      mens: mensProducts,
      womens: womensProducts,
      lastLoaded: new Date()
    }
    
    // Cache the results
    try {
      const dataDir = path.join(process.cwd(), 'data')
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      
      const jsonData = {
        ...cachedProducts,
        lastUpdated: new Date().toISOString()
      }
      
      fs.writeFileSync(dataPath, JSON.stringify(jsonData, null, 2))
      console.log('Cached products to file for future use')
    } catch (cacheError) {
      console.warn('Could not cache products to file:', cacheError)
    }
    
    return cachedProducts
  } catch (error) {
    console.error('Failed to fetch from Hugging Face, falling back to sample data')
    return {
      all: sampleProducts,
      mens: sampleProducts.filter(p => p.tags.includes('men') || p.tags.includes('male')),
      womens: sampleProducts.filter(p => p.tags.includes('women') || p.tags.includes('female'))
    }
  }
}

/**
 * Get all products
 */
export async function getAllProducts(): Promise<Product[]> {
  const products = await loadProducts()
  return products.all
}

/**
 * Get products by gender
 */
export async function getProductsByGender(gender: 'men' | 'women'): Promise<Product[]> {
  const products = await loadProducts()
  return gender === 'men' ? products.mens : products.womens
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await loadProducts()
  return products.all.filter(p => 
    p.category.toLowerCase() === category.toLowerCase() ||
    p.subcategory?.toLowerCase() === category.toLowerCase()
  )
}

/**
 * Search products
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const products = await loadProducts()
  const lowerQuery = query.toLowerCase()
  
  return products.all.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    p.category.toLowerCase().includes(lowerQuery) ||
    p.subcategory?.toLowerCase().includes(lowerQuery) ||
    p.brand?.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get featured products (high rated or discounted)
 */
export async function getFeaturedProducts(limit = 12): Promise<Product[]> {
  const products = await loadProducts()
  
  return products.all
    .filter(p => p.rating && p.rating >= 4.0 || p.originalPrice)
    .sort((a, b) => {
      // Sort by rating and discount
      const aScore = (a.rating || 0) + (a.originalPrice ? 1 : 0)
      const bScore = (b.rating || 0) + (b.originalPrice ? 1 : 0)
      return bScore - aScore
    })
    .slice(0, limit)
}

/**
 * Get product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const products = await loadProducts()
  return products.all.find(p => p.id === id) || null
}

// Sample product data for fallback
export const sampleProducts: Product[] = [
  {
    id: "prod_1",
    name: "Classic Denim Jacket",
    description: "A timeless denim jacket perfect for any season. Made with premium cotton denim and classic styling.",
    price: 89.99,
    originalPrice: 129.99,
    images: [
      "/placeholder.jpg"
    ],
    category: "Clothing",
    subcategory: "Jackets",
    brand: "StyleHub",
    colors: ["Blue", "Black", "White"],
    sizes: ["XS", "S", "M", "L", "XL"],
    inStock: true,
    rating: 4.5,
    reviews: 128,
    tags: ["denim", "jacket", "casual", "unisex"],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: "prod_2",
    name: "Comfortable Cotton T-Shirt",
    description: "Soft, breathable cotton t-shirt with a relaxed fit. Perfect for everyday wear.",
    price: 24.99,
    originalPrice: 34.99,
    images: [
      "/placeholder.jpg"
    ],
    category: "Clothing",
    subcategory: "T-Shirts",
    brand: "StyleHub",
    colors: ["White", "Black", "Gray", "Navy", "Red"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
    rating: 4.3,
    reviews: 89,
    tags: ["cotton", "t-shirt", "casual", "basic"],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: "prod_3",
    name: "Premium Leather Sneakers",
    description: "Handcrafted leather sneakers with cushioned sole. Combines style with comfort.",
    price: 129.99,
    images: [
      "/placeholder.jpg"
    ],
    category: "Shoes",
    subcategory: "Sneakers",
    brand: "ComfortStep",
    colors: ["White", "Black", "Brown"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    inStock: true,
    rating: 4.7,
    reviews: 203,
    tags: ["leather", "sneakers", "comfortable", "premium"],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25')
  }
]

// Export the original sample products array for backward compatibility
export { sampleProducts as originalSampleProducts }