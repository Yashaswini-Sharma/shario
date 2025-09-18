import { Product } from './types'

// Sample product data for fallback
export const sampleProducts: Product[] = [
  {
    id: "prod_1",
    name: "Classic Denim Jacket",
    description: "A timeless denim jacket perfect for any season. Made with premium cotton denim and classic styling.",
    price: 89.99,
    originalPrice: 129.99,
    images: ["/placeholder.jpg"],
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
    images: ["/placeholder.jpg"],
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
    images: ["/placeholder.jpg"],
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

// Cache for loaded products
let cachedProductData: {
  all: Product[]
  mens: Product[]
  womens: Product[]
} | null = null

// Function to load products from API
async function loadProducts(): Promise<{
  all: Product[]
  mens: Product[]
  womens: Product[]
}> {
  if (cachedProductData) {
    return cachedProductData
  }

  try {
    const response = await fetch('/api/products')
    if (response.ok) {
      const data = await response.json()
      
      // Convert date strings back to Date objects
      const convertDates = (products: any[]): Product[] => {
        return products.map(p => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }))
      }
      
      cachedProductData = {
        all: convertDates(data.all || []),
        mens: convertDates(data.mens || []),
        womens: convertDates(data.womens || [])
      }
      
      return cachedProductData
    }
  } catch (error) {
    console.warn('Could not load products from API:', error)
  }
  
  // Fallback to sample products
  const fallbackData = {
    all: sampleProducts,
    mens: sampleProducts.filter(p => p.tags.includes('men') || p.tags.includes('male') || p.tags.includes('unisex')),
    womens: sampleProducts.filter(p => p.tags.includes('women') || p.tags.includes('female') || p.tags.includes('unisex'))
  }
  
  cachedProductData = fallbackData
  return fallbackData
}

// Export functions to get products (async versions)
export async function getAllProducts(): Promise<Product[]> {
  const products = await loadProducts()
  return products.all
}

export async function getMensProducts(): Promise<Product[]> {
  const products = await loadProducts()
  return products.mens
}

export async function getWomensProducts(): Promise<Product[]> {
  const products = await loadProducts()
  return products.womens
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await loadProducts()
  return products.all.filter(p => 
    p.category.toLowerCase() === category.toLowerCase() ||
    p.subcategory?.toLowerCase() === category.toLowerCase()
  )
}

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

export async function getFeaturedProducts(limit = 12): Promise<Product[]> {
  const products = await loadProducts()
  
  return products.all
    .filter(p => p.rating && p.rating >= 4.0 || p.originalPrice)
    .sort((a, b) => {
      const aScore = (a.rating || 0) + (a.originalPrice ? 1 : 0)
      const bScore = (b.rating || 0) + (b.originalPrice ? 1 : 0)
      return bScore - aScore
    })
    .slice(0, limit)
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await loadProducts()
  return products.all.find(p => p.id === id) || null
}

// Synchronous versions for components that need immediate data
export function getAllProductsSync(): Product[] {
  return cachedProductData?.all || sampleProducts
}

export function getMensProductsSync(): Product[] {
  return cachedProductData?.mens || sampleProducts.filter(p => 
    p.tags.includes('men') || p.tags.includes('male') || p.tags.includes('unisex')
  )
}

export function getWomensProductsSync(): Product[] {
  return cachedProductData?.womens || sampleProducts.filter(p => 
    p.tags.includes('women') || p.tags.includes('female') || p.tags.includes('unisex')
  )
}

export function getFeaturedProductsSync(limit = 12): Product[] {
  const allProducts = getAllProductsSync()
  
  return allProducts
    .filter(p => p.rating && p.rating >= 4.0 || p.originalPrice)
    .sort((a, b) => {
      const aScore = (a.rating || 0) + (a.originalPrice ? 1 : 0)
      const bScore = (b.rating || 0) + (b.originalPrice ? 1 : 0)
      return bScore - aScore
    })
    .slice(0, limit)
}

export function getProductByIdSync(id: string): Product | null {
  const allProducts = getAllProductsSync()
  return allProducts.find(p => p.id === id) || null
}

// Function to seed products to Firebase (for initial setup)
export const seedProductsToFirebase = async () => {
  // This would be used to populate Firebase with products
  // Implementation depends on Firebase setup
  console.log('Seeding products to Firebase...')
}