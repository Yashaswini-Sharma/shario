import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from './firebase';

// const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

interface DatasetProduct {
  id: number;
  name: string;
  image: string;
  category: string;
  subcategory: string;
  gender: string;
  color: string;
  style?: string;
  season?: string;
  rating?: number;
  price?: number;
}

interface StyleAnalysis {
  outfitSuggestions: string[];
  matchingCategories: string[];
}

export interface ProductRecommendation {
  id: number;
  name: string;
  color: string;
  image: string;
  price?: number;
  category: string;
  subcategory: string;
  url: string;
}

export interface ImageData {
  url: string;
  tags: string[];
  caption: string;
  uploadedAt: number;
  type: 'mens' | 'womens' | 'other';
  outfitSuggestions?: string[];
  recommendations?: ProductRecommendation[];
  similarItems?: ProductRecommendation[];
}

export async function uploadImageAndAnalyze(
  file: File,
  type: 'mens' | 'womens' | 'other' = 'other'
): Promise<ImageData> {
  try {
    // First, get tags from the existing ML model
    const formData = new FormData();
    formData.append('file', file);
    
    const mlResponse = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      body: formData
    });
    
    if (!mlResponse.ok) {
      throw new Error('Failed to analyze image with ML model');
    }
    
    const mlResults = await mlResponse.json();
    const { tags = [], caption = '' } = mlResults;

    // Ensure tags is always an array
    const validTags = Array.isArray(tags) ? tags.filter(tag => tag && typeof tag === 'string') : [];

    // Now perform image search using the new search endpoint
    const searchFormData = new FormData();
    searchFormData.append('file', file);
    searchFormData.append('k', '10'); // Get 10 similar images
    if (validTags.length > 0) {
      searchFormData.append('text', validTags.join(' ')); // Use tags as additional text query
    }

    let similarImagePaths: string[] = [];
    try {
      const searchResponse = await fetch('http://localhost:5000/search_by_image', {
        method: 'POST',
        body: searchFormData
      });
      
      if (searchResponse.ok) {
        const searchResults = await searchResponse.json();
        similarImagePaths = searchResults.results || [];
      }
    } catch (searchError) {
      console.warn('Image search failed, continuing with basic analysis:', searchError);
    }

    // Convert file to base64 for display
    const imageUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    // Generate style analysis based on tags
    const styleAnalysis: StyleAnalysis = {
      outfitSuggestions: validTags.length > 0 ? [`Outfit based on ${validTags.join(', ')}`] : ['Casual outfit suggestion'],
      matchingCategories: validTags
    };

    // Load local dataset with error handling
    let items: DatasetProduct[] = [];
    try {
      const dataset = await import('@/public/dataset/dataset.json') as { items: DatasetProduct[] };
      items = dataset.items || [];
    } catch (error) {
      console.warn('Failed to load dataset, using empty array:', error);
    }
    
    // Helper function to convert product to recommendation
    const mapToRecommendation = (product: DatasetProduct): ProductRecommendation => ({
      id: product.id || 0,
      name: product.name || 'Unknown Product',
      color: product.color || 'Unknown',
      image: product.image || '',
      price: product.price || 0,
      category: product.category || 'Unknown',
      subcategory: product.subcategory || 'Unknown',
      url: `/products/${product.id || 0}`
    });

    // Use image search results to find similar products
    let similarItems: ProductRecommendation[] = [];
    
    if (similarImagePaths.length > 0) {
      // Try to match the similar image paths with products in our dataset
      // This assumes the image paths contain product identifiers or names
      similarItems = items
        .filter((product) => product && // Ensure product exists
          // Try to match product images with search results
          similarImagePaths.some(path => 
            path && (
              path.toLowerCase().includes(product.name?.toLowerCase().split(' ')[0] || '') ||
              path.toLowerCase().includes(product.category?.toLowerCase() || '') ||
              path.toLowerCase().includes(product.color?.toLowerCase() || '')
            )
          )
        )
        .slice(0, 4)
        .map(mapToRecommendation)
        .filter(item => item.id && item.name);
    }
    
    // If no matches from image search, fall back to tag-based matching
    if (similarItems.length === 0) {
      similarItems = items
        .filter((product) => product && // Ensure product exists
          validTags.some((tag: string) => 
            product.name?.toLowerCase().includes(tag.toLowerCase()) ||
            product.category?.toLowerCase().includes(tag.toLowerCase()) ||
            product.subcategory?.toLowerCase().includes(tag.toLowerCase()) ||
            product.color?.toLowerCase().includes(tag.toLowerCase())
          )
        )
        .slice(0, 4)
        .map(mapToRecommendation)
        .filter(item => item.id && item.name);
    }

    // Find outfit recommendations based on Gemini's suggestions
    const recommendations = items
      .filter((product) => product && // Ensure product is not null/undefined
        styleAnalysis.matchingCategories.some((category) =>
          product.category?.toLowerCase().includes(category.toLowerCase()) ||
          product.subcategory?.toLowerCase().includes(category.toLowerCase())
        ) &&
        // Match gender if this is a gendered item
        (type === 'other' || product.gender?.toLowerCase().includes(type.replace('s', '')))
      )
      .filter((product) => !similarItems.some((item) => item.id === product.id)) // Avoid duplicates
      .slice(0, 6)
      .map(mapToRecommendation)
      .filter(item => item.id && item.name); // Filter out any malformed recommendations

    const imageDoc: ImageData = {
      url: imageUrl,
      tags: validTags,
      caption: caption || '',
      type,
      uploadedAt: Date.now(),
      outfitSuggestions: styleAnalysis.outfitSuggestions || [],
      recommendations: recommendations || [],
      similarItems: similarItems || []
    };

    // Clean the object for Firestore (remove undefined values)
    const cleanImageDoc = Object.fromEntries(
      Object.entries(imageDoc).filter(([_, value]) => value !== undefined)
    );

    // Save to Firestore
    const imagesCollection = collection(db, 'products');
    const docRef = doc(imagesCollection);
    await setDoc(docRef, cleanImageDoc);

    return imageDoc;
  } catch (error) {
    console.error('Error uploading and analyzing image:', error);
    throw error;
  }
}

export async function searchImagesByText(query: string, k: number = 10): Promise<string[]> {
  try {
    const response = await fetch(`http://localhost:5000/search_by_text?q=${encodeURIComponent(query)}&k=${k}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to search images by text');
    }

    const results = await response.json();
    return results.results || [];
  } catch (error) {
    console.error('Error searching images by text:', error);
    return [];
  }
}

export async function searchImagesByImage(file: File, query?: string, k: number = 10): Promise<string[]> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('k', k.toString());
    if (query) {
      formData.append('text', query);
    }

    const response = await fetch('http://localhost:5000/search_by_image', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to search images by image');
    }

    const results = await response.json();
    return results.results || [];
  } catch (error) {
    console.error('Error searching images by image:', error);
    return [];
  }
}
