import { Product } from './types'
import { getProductPrice } from './pricing-utils'

// Hugging Face dataset interfaces
export interface HuggingFaceDatasetRow {
  row_idx: number
  row: {
    id: number
    gender: string
    masterCategory: string
    subCategory: string
    articleType: string
    baseColour: string
    season: string
    year: number
    usage: string
    productDisplayName: string
    image: {
      src: string
      height: number
      width: number
    }
  }
  truncated_cells: any[]
}

export interface HuggingFaceDatasetResponse {
  features: any[]
  rows: HuggingFaceDatasetRow[]
  num_rows_total: number
  num_rows_per_page: number
  partial: boolean
}

export class HuggingFaceDatasetService {
  private static readonly BASE_URL = 'https://datasets-server.huggingface.co/rows'
  private static readonly DATASET = 'ashraq%2Ffashion-product-images-small'
  private static readonly CONFIG = 'default'
  private static readonly SPLIT = 'train'

  /**
   * Fetch products from Hugging Face dataset
   */
  static async fetchProducts(offset = 0, length = 100): Promise<HuggingFaceDatasetRow[]> {
    const url = `${this.BASE_URL}?dataset=${this.DATASET}&config=${this.CONFIG}&split=${this.SPLIT}&offset=${offset}&length=${length}`
    
    try {
      // Use dynamic import for fetch in Node.js environment
      let fetchFn: typeof fetch
      if (typeof fetch === 'undefined') {
        // @ts-ignore
        const { default: nodeFetch } = await import('node-fetch')
        fetchFn = nodeFetch as any
      } else {
        fetchFn = fetch
      }

      const response = await fetchFn(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch from Hugging Face: ${response.statusText}`)
      }
      
      const data: HuggingFaceDatasetResponse = await response.json()
      return data.rows
    } catch (error) {
      console.error('Error fetching from Hugging Face dataset:', error)
      throw error
    }
  }

  /**
   * Convert Hugging Face dataset row to our Product interface
   */
  static convertToProduct(row: HuggingFaceDatasetRow): Product {
    const { row: data } = row
    
    // Map categories to match your existing structure
    const categoryMapping: Record<string, string> = {
      'Apparel': 'Clothing',
      'Accessories': 'Accessories',
      'Personal Care': 'Beauty',
      'Footwear': 'Shoes'
    }

    // Generate consistent price based on product category
    const basePrice = getProductPrice({
      articleType: data.articleType,
      category: data.masterCategory,
      subcategory: data.subCategory,
      gender: data.gender
    })
    const discount = Math.random() > 0.7 ? Math.random() * 0.3 + 0.1 : 0 // 30% chance of discount
    const originalPrice = discount > 0 ? basePrice : undefined
    const finalPrice = discount > 0 ? basePrice * (1 - discount) : basePrice

    // Generate sizes based on category
    const sizes = this.generateSizes(data.masterCategory, data.articleType, data.gender)
    
    // Generate tags
    const tags = this.generateTags(data)

    return {
      id: `hf_${data.id}`,
      name: data.productDisplayName,
      description: this.generateDescription(data),
      price: Math.round(finalPrice * 100) / 100,
      originalPrice: originalPrice ? Math.round(originalPrice * 100) / 100 : undefined,
      images: [data.image.src],
      category: categoryMapping[data.masterCategory] || data.masterCategory,
      subcategory: data.subCategory,
      brand: this.extractBrand(data.productDisplayName) || 'Fashion Brand',
      colors: [data.baseColour],
      sizes: sizes,
      inStock: Math.random() > 0.1, // 90% in stock
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
      reviews: Math.floor(Math.random() * 200) + 10, // 10 to 210 reviews
      tags: tags,
      createdAt: new Date(data.year || 2024, 0, 1),
      updatedAt: new Date()
    }
  }

  /**
   * Fetch products by gender filter
   */
  static async fetchProductsByGender(gender: 'Men' | 'Women' | 'Boys' | 'Girls', limit = 50): Promise<Product[]> {
    const allRows: HuggingFaceDatasetRow[] = []
    let offset = 0
    const batchSize = 100

    // Fetch in batches until we have enough products of the desired gender
    while (allRows.length < limit) {
      const rows = await this.fetchProducts(offset, batchSize)
      
      if (rows.length === 0) break // No more data
      
      const filteredRows = rows.filter(row => row.row.gender === gender)
      allRows.push(...filteredRows)
      
      offset += batchSize
      
      // Safety break to avoid infinite loop
      if (offset > 1000) break
    }

    return allRows.slice(0, limit).map(row => this.convertToProduct(row))
  }

  /**
   * Fetch products by category
   */
  static async fetchProductsByCategory(masterCategory: string, limit = 50): Promise<Product[]> {
    const allRows: HuggingFaceDatasetRow[] = []
    let offset = 0
    const batchSize = 100

    while (allRows.length < limit) {
      const rows = await this.fetchProducts(offset, batchSize)
      
      if (rows.length === 0) break
      
      const filteredRows = rows.filter(row => row.row.masterCategory === masterCategory)
      allRows.push(...filteredRows)
      
      offset += batchSize
      
      if (offset > 1000) break
    }

    return allRows.slice(0, limit).map(row => this.convertToProduct(row))
  }

  /**
   * Get all available products and convert to our format
   */
  static async getAllProducts(limit = 200): Promise<Product[]> {
    const allRows: HuggingFaceDatasetRow[] = []
    let offset = 0
    const batchSize = 100

    while (allRows.length < limit) {
      const rows = await this.fetchProducts(offset, batchSize)
      
      if (rows.length === 0) break
      
      allRows.push(...rows)
      offset += batchSize
      
      if (offset > 2000) break // Safety limit
    }

    return allRows.slice(0, limit).map(row => this.convertToProduct(row))
  }

  // Helper methods
  private static generatePrice(articleType: string, masterCategory: string): number {
    const priceRanges: Record<string, [number, number]> = {
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

  private static generateSizes(masterCategory: string, articleType: string, gender: string): string[] {
    if (masterCategory === 'Footwear') {
      return gender === 'Men' ? ['7', '8', '9', '10', '11', '12'] : ['5', '6', '7', '8', '9', '10']
    }
    
    if (articleType === 'Watches' || masterCategory === 'Accessories') {
      return ['One Size']
    }

    return ['XS', 'S', 'M', 'L', 'XL']
  }

  private static generateTags(data: any): string[] {
    const tags = [
      data.gender.toLowerCase(),
      data.masterCategory.toLowerCase(),
      data.subCategory.toLowerCase(),
      data.articleType.toLowerCase(),
      data.baseColour.toLowerCase().replace(' ', '-'),
      data.season.toLowerCase(),
      data.usage.toLowerCase()
    ]

    return [...new Set(tags.filter(tag => tag && tag !== 'null'))]
  }

  private static generateDescription(data: any): string {
    const templates = [
      `Stylish ${data.articleType.toLowerCase()} in ${data.baseColour.toLowerCase()} perfect for ${data.season.toLowerCase()} ${data.usage.toLowerCase()} wear.`,
      `Premium ${data.baseColour.toLowerCase()} ${data.articleType.toLowerCase()} designed for ${data.usage.toLowerCase()} occasions during ${data.season.toLowerCase()}.`,
      `Comfortable and trendy ${data.articleType.toLowerCase()} featuring ${data.baseColour.toLowerCase()} color, ideal for ${data.usage.toLowerCase()} activities.`
    ]
    
    return templates[Math.floor(Math.random() * templates.length)]
  }

  private static extractBrand(productName: string): string | null {
    const knownBrands = ['Nike', 'Adidas', 'Puma', 'Reebok', 'Levis', 'Peter England', 'Arrow', 'Allen Solly', 'Turtle', 'Roadster', 'HRX', 'Wrangler']
    
    for (const brand of knownBrands) {
      if (productName.toLowerCase().includes(brand.toLowerCase())) {
        return brand
      }
    }
    
    return null
  }
}