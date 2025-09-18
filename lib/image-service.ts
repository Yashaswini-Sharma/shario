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
    // Get tags from your ML model
    const formData = new FormData();
    formData.append('file', file);
    
    const mlResponse = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      body: formData
    });
    
    const mlResults = await mlResponse.json();
    const { tags, caption } = mlResults;

    // Convert file to base64 for display
    const imageUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    // TODO: Call local Python ML model for recommendations here
    // For now, fallback to basic structure
    const styleAnalysis: StyleAnalysis = {
      outfitSuggestions: [`Outfit based on ${tags.join(', ')}`],
      matchingCategories: tags
    };

    // Load local dataset
    const { items } = await import('@/public/dataset/dataset.json') as { items: DatasetProduct[] };
    
    // Helper function to convert product to recommendation
    const mapToRecommendation = (product: DatasetProduct): ProductRecommendation => ({
      id: product.id,
      name: product.name,
      color: product.color,
      image: product.image,
      price: product.price,
      category: product.category,
      subcategory: product.subcategory,
      url: `/products/${product.id}`
    });

    // Find similar items based on direct tag matches
    const similarItems = items
      .filter((product) => 
        tags.some((tag: string) => 
          product.name.toLowerCase().includes(tag.toLowerCase()) ||
          product.category.toLowerCase().includes(tag.toLowerCase()) ||
          product.subcategory.toLowerCase().includes(tag.toLowerCase()) ||
          product.color.toLowerCase().includes(tag.toLowerCase())
        )
      )
      .slice(0, 4)
      .map(mapToRecommendation);

    // Find outfit recommendations based on Gemini's suggestions
    const recommendations = items
      .filter((product) => 
        styleAnalysis.matchingCategories.some((category) =>
          product.category.toLowerCase().includes(category.toLowerCase()) ||
          product.subcategory.toLowerCase().includes(category.toLowerCase())
        ) &&
        // Match gender if this is a gendered item
        (type === 'other' || product.gender.toLowerCase().includes(type.replace('s', '')))
      )
      .filter((product) => !similarItems.some((item) => item.id === product.id)) // Avoid duplicates
      .slice(0, 6)
      .map(mapToRecommendation);

    const imageDoc: ImageData = {
      url: imageUrl,
      tags,
      caption,
      type,
      uploadedAt: Date.now(),
      outfitSuggestions: styleAnalysis.outfitSuggestions,
      recommendations,
      similarItems
    };

    // Save to Firestore
    const imagesCollection = collection(db, 'products');
    const docRef = doc(imagesCollection);
    await setDoc(docRef, imageDoc);

    return imageDoc;
  } catch (error) {
    console.error('Error uploading and analyzing image:', error);
    throw error;
  }
}
