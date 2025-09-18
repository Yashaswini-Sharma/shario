import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ProductMetadata {
  gender?: string;
  category?: string;
  subcategory?: string;
  color?: string;
  season?: string;
  usage?: string;
  articleType?: string;
}

// Smart tag analysis function to determine article type from ML tags
function analyzeTagsForArticleType(tags: string[]): {
  articleType: string;
  subcategory: string;
  category: string;
} {
  const tagText = tags.join(' ').toLowerCase();
  
  // Bottomwear patterns
  if (tagText.includes('jeans') || tagText.includes('denim')) {
    return { articleType: 'Jeans', subcategory: 'Bottomwear', category: 'Apparel' };
  }
  if (tagText.includes('pants') || tagText.includes('trousers')) {
    return { articleType: 'Trousers', subcategory: 'Bottomwear', category: 'Apparel' };
  }
  if (tagText.includes('shorts')) {
    return { articleType: 'Shorts', subcategory: 'Bottomwear', category: 'Apparel' };
  }
  if (tagText.includes('skirt')) {
    return { articleType: 'Skirts', subcategory: 'Bottomwear', category: 'Apparel' };
  }
  
  // Topwear patterns
  if (tagText.includes('shirt') || tagText.includes('blouse')) {
    return { articleType: 'Shirts', subcategory: 'Topwear', category: 'Apparel' };
  }
  if (tagText.includes('t-shirt') || tagText.includes('tshirt') || tagText.includes('tee')) {
    return { articleType: 'Tshirts', subcategory: 'Topwear', category: 'Apparel' };
  }
  if (tagText.includes('dress')) {
    return { articleType: 'Dresses', subcategory: 'Topwear', category: 'Apparel' };
  }
  if (tagText.includes('jacket') || tagText.includes('blazer')) {
    return { articleType: 'Jackets', subcategory: 'Topwear', category: 'Apparel' };
  }
  if (tagText.includes('hoodie') || tagText.includes('sweatshirt')) {
    return { articleType: 'Sweatshirts', subcategory: 'Topwear', category: 'Apparel' };
  }
  if (tagText.includes('sweater') || tagText.includes('pullover')) {
    return { articleType: 'Sweaters', subcategory: 'Topwear', category: 'Apparel' };
  }
  
  // Footwear patterns
  if (tagText.includes('shoes') || tagText.includes('sneakers') || tagText.includes('boots')) {
    return { articleType: 'Casual Shoes', subcategory: 'Shoes', category: 'Footwear' };
  }
  if (tagText.includes('sandals') || tagText.includes('flip flop')) {
    return { articleType: 'Sandals', subcategory: 'Shoes', category: 'Footwear' };
  }
  
  // Accessories patterns
  if (tagText.includes('watch')) {
    return { articleType: 'Watches', subcategory: 'Watches', category: 'Accessories' };
  }
  if (tagText.includes('bag') || tagText.includes('handbag') || tagText.includes('backpack')) {
    return { articleType: 'Handbags', subcategory: 'Bags', category: 'Accessories' };
  }
  if (tagText.includes('belt')) {
    return { articleType: 'Belts', subcategory: 'Belts', category: 'Accessories' };
  }
  if (tagText.includes('hat') || tagText.includes('cap')) {
    return { articleType: 'Caps', subcategory: 'Headwear', category: 'Accessories' };
  }
  
  // Default fallback
  return { articleType: 'Shirts', subcategory: 'Topwear', category: 'Apparel' };
}

// Smart tag analysis for colors
function extractColorFromTags(tags: string[]): string {
  const tagText = tags.join(' ').toLowerCase();
  const colors = [
    'black', 'white', 'blue', 'red', 'green', 'yellow', 'orange', 'purple', 
    'pink', 'brown', 'grey', 'gray', 'navy', 'beige', 'maroon', 'olive',
    'khaki', 'turquoise', 'violet', 'indigo', 'crimson', 'gold', 'silver'
  ];
  
  for (const color of colors) {
    if (tagText.includes(color)) {
      return color.charAt(0).toUpperCase() + color.slice(1);
    }
  }
  return 'Blue'; // Default fallback
}

export async function enhanceProductMetadata(
  caption: string,
  tags: string[],
  existingMetadata: Partial<ProductMetadata> = {}
): Promise<ProductMetadata> {
  // First, use smart tag analysis as base
  const tagAnalysis = analyzeTagsForArticleType(tags);
  const colorFromTags = extractColorFromTags(tags);
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    Analyze this fashion product and extract metadata. PAY CLOSE ATTENTION TO THE TAGS - they contain the most accurate information about what the item actually is.
    
    Caption: "${caption}"
    Tags: ${tags.join(', ')}
    
    IMPORTANT: The tags are from ML image recognition and are very accurate. If tags say "jeans", it's jeans NOT shirts. If tags say "dress", it's a dress, etc.
    
    Based on the description and ESPECIALLY THE TAGS, determine:
    
    Gender: Men, Women, or Unisex (look for gender clues in tags/caption, if unclear randomly choose)
    Category: Apparel, Footwear, Accessories, Personal Care, Free Gifts, Sporting Goods, or Home & Living
    Subcategory: For Apparel (Topwear, Bottomwear, Innerwear, Loungewear, Nightwear, Saree, etc.), 
                For Footwear (Casual Shoes, Formal Shoes, Sports Shoes, Sandals, etc.),
                For Accessories (Watches, Bags, Belts, Jewelry, etc.)
    Color: Primary color visible (check tags first: ${tags.filter(t => ['black', 'white', 'blue', 'red', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'grey', 'gray', 'navy'].some(c => t.toLowerCase().includes(c))).join(', ')})
    Season: Summer, Winter, Fall, Spring
    Usage: Casual, Formal, Sports, Party, Ethnic, or Travel
    ArticleType: MUST match what the tags indicate - if tags mention "jeans" = Jeans, "dress" = Dresses, "shirt" = Shirts, "shoes" = Casual Shoes, etc.
    
    Smart analysis suggests: ${JSON.stringify(tagAnalysis)}
    Detected color from tags: ${colorFromTags}
    
    Existing metadata (don't override if already provided):
    ${JSON.stringify(existingMetadata)}
    
    Return ONLY a valid JSON object:
    {
      "gender": "Men|Women|Unisex",
      "category": "category_name",
      "subcategory": "subcategory_name", 
      "color": "color_name",
      "season": "season_name",
      "usage": "usage_type",
      "articleType": "article_type"
    }
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();
    
    // Parse JSON response
    let metadata: ProductMetadata;
    try {
      // Remove any markdown code block formatting
      const jsonText = text.replace(/```json\n?|```\n?/g, '').trim();
      metadata = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      // Use smart tag analysis as fallback
      metadata = {
        gender: Math.random() > 0.5 ? 'Men' : 'Women',
        category: tagAnalysis.category,
        subcategory: tagAnalysis.subcategory,
        color: colorFromTags,
        season: 'Fall',
        usage: 'Casual',
        articleType: tagAnalysis.articleType
      };
    }

    // Merge with existing metadata, prioritizing tag analysis for key fields
    const enhancedMetadata: ProductMetadata = {
      gender: existingMetadata.gender || metadata.gender || (Math.random() > 0.5 ? 'Men' : 'Women'),
      category: existingMetadata.category || metadata.category || tagAnalysis.category,
      subcategory: existingMetadata.subcategory || metadata.subcategory || tagAnalysis.subcategory,
      color: existingMetadata.color || metadata.color || colorFromTags,
      season: existingMetadata.season || metadata.season || 'Fall',
      usage: existingMetadata.usage || metadata.usage || 'Casual',
      articleType: existingMetadata.articleType || metadata.articleType || tagAnalysis.articleType
    };

    return enhancedMetadata;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Use smart tag analysis as fallback when Gemini fails
    return {
      gender: existingMetadata.gender || (Math.random() > 0.5 ? 'Men' : 'Women'),
      category: existingMetadata.category || tagAnalysis.category,
      subcategory: existingMetadata.subcategory || tagAnalysis.subcategory,
      color: existingMetadata.color || colorFromTags,
      season: existingMetadata.season || 'Fall',
      usage: existingMetadata.usage || 'Casual',
      articleType: existingMetadata.articleType || tagAnalysis.articleType
    };
  }
}

export async function generateProductName(
  caption: string,
  metadata: ProductMetadata
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    Generate a product name for a fashion item based on:
    
    Caption: "${caption}"
    Gender: ${metadata.gender}
    Category: ${metadata.category}
    Article Type: ${metadata.articleType}
    Color: ${metadata.color}
    
    Create a concise product name in the format:
    "[Gender] [Color] [Article Type]"
    
    Examples:
    - "Women Blue Jeans" (for jeans)
    - "Men Black Shirts" (for shirts)  
    - "Women Red Dresses" (for dresses)
    - "Men White Sneakers" (for shoes)
    
    IMPORTANT: Use the EXACT article type provided: ${metadata.articleType}
    
    Return ONLY the product name, no quotes or extra text.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const productName = response.text().trim().replace(/"/g, '');
    
    return productName || `${metadata.gender} ${metadata.color} ${metadata.articleType}`;
  } catch (error) {
    console.error('Error generating product name:', error);
    // Use template-based fallback that respects the correct article type
    return `${metadata.gender} ${metadata.color} ${metadata.articleType}`;
  }
}
