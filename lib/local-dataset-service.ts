// Local Dataset Service - loads from downloaded dataset
import { ProcessedFashionItem } from './huggingface-dataset'

export interface LocalDatasetItem {
  id: number
  name: string
  image: string
  category: string
  subcategory: string
  gender: string
  color: string
  season: string
  usage: string
  year: number
  articleType: string
}

export class LocalDatasetService {
  private static dataset: LocalDatasetItem[] | null = null
  private static categories: string[] = []
  private static articleTypes: string[] = []
  private static colors: string[] = []
  private static seasons: string[] = []
  private static usages: string[] = []

  static async loadDataset(): Promise<LocalDatasetItem[]> {
    if (this.dataset) {
      return this.dataset
    }

    try {
      // Check if we're running on the server or client
      const isServer = typeof window === 'undefined'
      let jsonPath: string
      
      if (isServer) {
        // Server-side: read from file system
        const fs = await import('fs/promises')
        const path = await import('path')
        const filePath = path.join(process.cwd(), 'public/dataset/dataset.json')
        const fileContent = await fs.readFile(filePath, 'utf-8')
        const data = JSON.parse(fileContent)
        
        this.dataset = data.items || []
        this.categories = data.categories || []
        this.articleTypes = data.articleTypes || []
        this.colors = data.colors || []
        this.seasons = data.seasons || []
        this.usages = data.usages || []

        return this.dataset
      } else {
        // Client-side: fetch from URL
        const response = await fetch('/dataset/dataset.json')
        if (!response.ok) {
          throw new Error('Failed to load local dataset')
        }

        const data = await response.json()
        this.dataset = data.items || []
        this.categories = data.categories || []
        this.articleTypes = data.articleTypes || []
        this.colors = data.colors || []
        this.seasons = data.seasons || []
        this.usages = data.usages || []

        return this.dataset
      }
    } catch (error) {
      console.error('Error loading local dataset:', error)
      return []
    }
  }

  static async getByGender(gender: 'Men' | 'Women' | 'Unisex', limit: number = 50): Promise<ProcessedFashionItem[]> {
    const dataset = await this.loadDataset()
    
    return dataset
      .filter(item => item.gender === gender)
      .slice(0, limit)
      .map(this.convertToProcessedItem)
  }

  static async getByCategory(category: string, limit: number = 50): Promise<ProcessedFashionItem[]> {
    const dataset = await this.loadDataset()
    
    return dataset
      .filter(item => 
        item.category.toLowerCase().includes(category.toLowerCase()) ||
        item.subcategory.toLowerCase().includes(category.toLowerCase())
      )
      .slice(0, limit)
      .map(this.convertToProcessedItem)
  }

  static async getByArticleType(articleType: string, limit: number = 30): Promise<ProcessedFashionItem[]> {
    const dataset = await this.loadDataset()
    
    return dataset
      .filter(item => 
        item.articleType.toLowerCase().includes(articleType.toLowerCase())
      )
      .slice(0, limit)
      .map(this.convertToProcessedItem)
  }

  static async getAllItems(offset: number = 0, limit: number = 50): Promise<ProcessedFashionItem[]> {
    const dataset = await this.loadDataset()
    
    return dataset
      .slice(offset, offset + limit)
      .map(this.convertToProcessedItem)
  }

  static async searchItems(query: string, limit: number = 30): Promise<ProcessedFashionItem[]> {
    const dataset = await this.loadDataset()
    const lowercaseQuery = query.toLowerCase()
    
    return dataset
      .filter(item => 
        item.name.toLowerCase().includes(lowercaseQuery) ||
        item.articleType.toLowerCase().includes(lowercaseQuery) ||
        item.color.toLowerCase().includes(lowercaseQuery) ||
        item.category.toLowerCase().includes(lowercaseQuery)
      )
      .slice(0, limit)
      .map(this.convertToProcessedItem)
  }

  static async getCategories(): Promise<{
    categories: string[]
    subcategories: string[]
    articleTypes: string[]
    seasons: string[]
    usages: string[]
    colors: string[]
    genderDistribution: { Men: number; Women: number; Unisex: number }
  }> {
    const dataset = await this.loadDataset()
    
    const genderCounts = dataset.reduce((acc, item) => {
      acc[item.gender as keyof typeof acc] = (acc[item.gender as keyof typeof acc] || 0) + 1
      return acc
    }, { Men: 0, Women: 0, Unisex: 0 })

    // Get unique values
    const subcategories = Array.from(new Set(dataset.map(item => item.subcategory).filter(Boolean))).sort()

    return {
      categories: this.categories,
      subcategories,
      articleTypes: this.articleTypes,
      seasons: this.seasons,
      usages: this.usages,
      colors: this.colors,
      genderDistribution: genderCounts
    }
  }

  private static convertToProcessedItem(item: LocalDatasetItem): ProcessedFashionItem {
    return {
      id: `local_${item.id}`,
      name: item.name,
      image: item.image,
      category: item.category,
      subcategory: item.subcategory,
      gender: item.gender as 'Men' | 'Women' | 'Unisex',
      color: item.color,
      season: item.season,
      usage: item.usage,
      year: item.year,
      articleType: item.articleType
    }
  }

  static async getStats(): Promise<{
    totalItems: number
    menItems: number
    womenItems: number
    unisexItems: number
    categories: number
    articleTypes: number
  }> {
    const dataset = await this.loadDataset()
    
    return {
      totalItems: dataset.length,
      menItems: dataset.filter(item => item.gender === 'Men').length,
      womenItems: dataset.filter(item => item.gender === 'Women').length,
      unisexItems: dataset.filter(item => item.gender === 'Unisex').length,
      categories: this.categories.length,
      articleTypes: this.articleTypes.length
    }
  }
}
