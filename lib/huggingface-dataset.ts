// Hugging Face Fashion Dataset Service

export interface HuggingFaceFashionItem {
  image: string; // Base64 encoded image
  label: number; // Category label
  gender: number; // Gender category
  masterCategory: string;
  subCategory: string;
  articleType: string;
  baseColour: string;
  season: string;
  year: number;
  usage: string;
  productDisplayName: string;
  id: number;
}

export interface ProcessedFashionItem {
  id: string;
  name: string;
  image: string;
  category: string;
  subcategory: string;
  gender: 'Men' | 'Women' | 'Unisex';
  color: string;
  season: string;
  usage: string;
  year: number;
  articleType: string;
}

// Category mapping based on common fashion categories
const CATEGORY_MAPPING: Record<string, string> = {
  'Topwear': 'Clothing',
  'Bottomwear': 'Clothing', 
  'Shoes': 'Footwear',
  'Watches': 'Accessories',
  'Bags': 'Accessories',
  'Eyewear': 'Accessories',
  'Jewellery': 'Accessories',
  'Fragrance': 'Beauty',
  'Innerwear': 'Clothing',
  'Loungewear and Nightwear': 'Clothing',
  'Apparel Set': 'Clothing',
  'Headwear': 'Accessories',
  'Socks': 'Clothing',
  'Wallets': 'Accessories',
  'Belts': 'Accessories',
  'Ties': 'Accessories',
  'Cufflinks': 'Accessories',
  'Scarves': 'Accessories',
  'Gloves': 'Accessories'
};

const GENDER_MAPPING: Record<number, string> = {
  0: 'Men',
  1: 'Women', 
  2: 'Unisex'
};

export class HuggingFaceDatasetService {
  private static readonly API_URL = 'https://datasets-server.huggingface.co/rows';
  private static readonly DATASET = 'ashraq/fashion-product-images-small';
  
  static async fetchFashionData(offset: number = 0, length: number = 100): Promise<HuggingFaceFashionItem[]> {
    try {
      const response = await fetch(
        `${this.API_URL}?dataset=${encodeURIComponent(this.DATASET)}&config=default&split=train&offset=${offset}&length=${length}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.rows?.map((row: any) => row.row) || [];
    } catch (error) {
      console.error('Error fetching fashion data:', error);
      return [];
    }
  }

  static async fetchFashionDataByGender(gender: 'Men' | 'Women', limit: number = 50): Promise<ProcessedFashionItem[]> {
    try {
      // Fetch a larger dataset to filter by gender
      const rawData = await this.fetchFashionData(0, 300);
      const targetGender = Object.keys(GENDER_MAPPING).find(
        key => GENDER_MAPPING[Number(key)] === gender
      );

      if (!targetGender) return [];

      const filteredData = rawData
        .filter(item => item.gender === Number(targetGender))
        .slice(0, limit)
        .map(this.processItem);

      return filteredData;
    } catch (error) {
      console.error(`Error fetching ${gender} fashion data:`, error);
      return [];
    }
  }

  static async fetchFashionDataByCategory(category: string, limit: number = 50): Promise<ProcessedFashionItem[]> {
    try {
      const rawData = await this.fetchFashionData(0, 200);
      
      const filteredData = rawData
        .filter(item => {
          const mappedCategory = CATEGORY_MAPPING[item.masterCategory] || item.masterCategory;
          return mappedCategory.toLowerCase() === category.toLowerCase() ||
                 item.masterCategory.toLowerCase().includes(category.toLowerCase()) ||
                 item.subCategory.toLowerCase().includes(category.toLowerCase());
        })
        .slice(0, limit)
        .map(this.processItem);

      return filteredData;
    } catch (error) {
      console.error(`Error fetching ${category} fashion data:`, error);
      return [];
    }
  }

  private static processItem(item: HuggingFaceFashionItem): ProcessedFashionItem {
    const gender = GENDER_MAPPING[item.gender] as 'Men' | 'Women' | 'Unisex' || 'Unisex';
    
    return {
      id: `hf_${item.id}`,
      name: item.productDisplayName || `${item.articleType} ${item.baseColour}`,
      image: `data:image/jpeg;base64,${item.image}`,
      category: CATEGORY_MAPPING[item.masterCategory] || item.masterCategory,
      subcategory: item.subCategory,
      gender,
      color: item.baseColour,
      season: item.season,
      usage: item.usage,
      year: item.year,
      articleType: item.articleType
    };
  }

  static async searchByArticleType(articleType: string, limit: number = 30): Promise<ProcessedFashionItem[]> {
    try {
      const rawData = await this.fetchFashionData(0, 200);
      
      const filteredData = rawData
        .filter(item => 
          item.articleType.toLowerCase().includes(articleType.toLowerCase())
        )
        .slice(0, limit)
        .map(this.processItem);

      return filteredData;
    } catch (error) {
      console.error(`Error fetching ${articleType} data:`, error);
      return [];
    }
  }
}
