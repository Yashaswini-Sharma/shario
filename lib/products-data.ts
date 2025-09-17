import { Product } from './types'

// Sample product data for demonstration
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
    price: 149.99,
    images: [
      "/placeholder.jpg"
    ],
    category: "Footwear",
    subcategory: "Sneakers",
    brand: "StyleHub",
    colors: ["White", "Black", "Brown"],
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"],
    inStock: true,
    rating: 4.7,
    reviews: 245,
    tags: ["leather", "sneakers", "premium", "comfortable"],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: "prod_4",
    name: "Elegant Summer Dress",
    description: "Light and airy summer dress with floral print. Perfect for warm weather occasions.",
    price: 79.99,
    originalPrice: 99.99,
    images: [
      "/placeholder.jpg"
    ],
    category: "Clothing",
    subcategory: "Dresses",
    brand: "StyleHub",
    colors: ["Floral Blue", "Floral Pink", "Solid White"],
    sizes: ["XS", "S", "M", "L", "XL"],
    inStock: true,
    rating: 4.4,
    reviews: 67,
    tags: ["dress", "summer", "floral", "elegant"],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-28')
  },
  {
    id: "prod_5",
    name: "Classic Chino Pants",
    description: "Versatile chino pants that work for both casual and semi-formal occasions.",
    price: 59.99,
    images: [
      "/placeholder.jpg"
    ],
    category: "Clothing",
    subcategory: "Pants",
    brand: "StyleHub",
    colors: ["Khaki", "Navy", "Black", "Olive"],
    sizes: ["28", "30", "32", "34", "36", "38", "40"],
    inStock: true,
    rating: 4.2,
    reviews: 156,
    tags: ["chinos", "pants", "versatile", "casual"],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-22')
  }
]

// Helper function to get product by ID
export const getProductById = (id: string): Product | undefined => {
  return sampleProducts.find(product => product.id === id)
}

// Helper function to get products by category
export const getProductsByCategory = (category: string): Product[] => {
  return sampleProducts.filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  )
}

// Helper function to search products
export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase()
  return sampleProducts.filter(product =>
    product.name.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery) ||
    product.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    product.brand?.toLowerCase().includes(lowerQuery)
  )
}

// Function to seed products to Firebase (for initial setup)
export const seedProductsToFirebase = async () => {
  const { collection, doc, setDoc } = await import('firebase/firestore')
  const { db } = await import('./firebase')

  try {
    for (const product of sampleProducts) {
      await setDoc(doc(db, 'products', product.id), {
        ...product,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      })
    }
    console.log('Products seeded to Firebase successfully')
  } catch (error) {
    console.error('Error seeding products to Firebase:', error)
  }
}
