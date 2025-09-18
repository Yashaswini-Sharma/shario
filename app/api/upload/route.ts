import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { enhanceProductMetadata, generateProductName, ProductMetadata } from '@/lib/gemini-service';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

// Helper function to save uploaded image
async function saveImageFile(file: File, id: number): Promise<string> {
  try {
    const imageDir = path.join(process.cwd(), 'public', 'dataset', 'images');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }
    
    const fileName = `item_${id}.jpg`;
    const filePath = path.join(imageDir, fileName);
    
    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);
    
    return `/dataset/images/${fileName}`;
  } catch (error) {
    console.error('Error saving image:', error);
    return `/dataset/images/item_${id}.jpg`; // Return expected path even if save fails
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No image uploaded' }, { status: 400 });
    }

    // Generate a new unique ID
    const newId = Date.now() + Math.floor(Math.random() * 1000);

    // Forward image to Python backend for ML tagging
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:5000/predict';
    const imageBuffer = Buffer.from(await file.arrayBuffer());
    
    let tags: string[] = [];
    let caption = '';
    
    try {
      const fetchRes = await fetch(pythonApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: imageBuffer,
      });
      
      if (fetchRes.ok) {
        const tagResult = await fetchRes.json();
        tags = tagResult.tags || [];
        caption = tagResult.caption || '';
      } else {
        console.warn('Python ML service unavailable, proceeding with manual metadata');
        caption = 'Fashion Item';
      }
    } catch (mlError) {
      console.warn('ML service error:', mlError);
      caption = 'Fashion Item';
    }

    // Get any existing metadata from form
    const existingMetadata: Partial<ProductMetadata> = {
      category: formData.get('category') as string || undefined,
      subcategory: formData.get('subcategory') as string || undefined,
      gender: formData.get('gender') as string || undefined,
      color: formData.get('color') as string || undefined,
      season: formData.get('season') as string || undefined,
      usage: formData.get('usage') as string || undefined,
      articleType: formData.get('articleType') as string || undefined,
    };

    // Use Gemini AI to enhance metadata based on caption and tags
    const enhancedMetadata = await enhanceProductMetadata(caption, tags, existingMetadata);
    
    // Generate a better product name using Gemini
    const productName = await generateProductName(caption, enhancedMetadata);

    // Save the uploaded image file
    const imagePath = await saveImageFile(file as File, newId);

    // Create new item in dataset.json format
    const newItem = {
      id: newId,
      name: productName,
      image: imagePath,
      category: enhancedMetadata.category!,
      subcategory: enhancedMetadata.subcategory!,
      gender: enhancedMetadata.gender!,
      color: enhancedMetadata.color!,
      season: enhancedMetadata.season!,
      usage: enhancedMetadata.usage!,
      year: new Date().getFullYear(),
      articleType: enhancedMetadata.articleType!,
      tags: tags, // ML-generated tags
      caption: caption, // Store the original caption
      uploadedAt: new Date().toISOString(),
    };

    // Save to MongoDB
    const { db } = await connectToDatabase();
    await db.collection('products').insertOne(newItem);
    
    console.log('Successfully created product:', {
      id: newItem.id,
      name: newItem.name,
      tags: newItem.tags,
      metadata: {
        gender: newItem.gender,
        category: newItem.category,
        color: newItem.color
      }
    });

    return NextResponse.json({ 
      success: true, 
      item: newItem,
      message: 'Product uploaded and tagged successfully!' 
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}
