import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '50')
    const gender = searchParams.get('gender') as 'Men' | 'Women' | null
    const category = searchParams.get('category')
    const articleType = searchParams.get('articleType')
    const search = searchParams.get('search')

    // Read static dataset from file system
    const filePath = path.join(process.cwd(), 'public/dataset/dataset.json')
    let staticItems = []
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      const datasetJson = JSON.parse(fileContent)
      staticItems = datasetJson.items || []
    } catch (error) {
      console.warn('Could not read static dataset:', error)
      staticItems = []
    }

    // Fetch uploaded products from MongoDB
    let mongoItems: any[] = []
    try {
      const { db } = await connectToDatabase()
      const uploadedProducts = await db.collection('products').find({}).toArray()
      
      console.log(`Found ${uploadedProducts.length} products in MongoDB`) // Debug log
      
      // Convert MongoDB items to match dataset format
      mongoItems = uploadedProducts.map((item: any) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        category: item.category,
        subcategory: item.subcategory,
        gender: item.gender,
        color: item.color,
        season: item.season,
        usage: item.usage,
        year: item.year,
        articleType: item.articleType,
        tags: item.tags || [],
        isUploaded: true // Mark as uploaded product
      }))
      
      console.log(`Converted ${mongoItems.length} MongoDB items`) // Debug log
    } catch (error) {
      console.warn('Could not fetch uploaded products from MongoDB:', error)
      mongoItems = []
    }

    // Combine both datasets - PUT UPLOADED ITEMS FIRST so they appear on first page
    let items = [...mongoItems, ...staticItems]
    
    console.log(`Static items: ${staticItems.length}, MongoDB items: ${mongoItems.length}, Combined: ${items.length}`) // Debug log

    // Apply filters
    if (search) {
      const lowercaseQuery = search.toLowerCase()
      items = items.filter((item: any) => 
        item.name.toLowerCase().includes(lowercaseQuery) ||
        item.articleType.toLowerCase().includes(lowercaseQuery) ||
        item.color.toLowerCase().includes(lowercaseQuery) ||
        item.category.toLowerCase().includes(lowercaseQuery)
      )
    }

    if (gender) {
      const beforeFilter = items.length
      items = items.filter((item: any) => item.gender === gender)
      console.log(`Gender filter (${gender}): ${beforeFilter} -> ${items.length} items`) // Debug log
      
      // Show uploaded items that match gender filter
      const uploadedAfterFilter = items.filter(item => item.isUploaded)
      console.log(`Uploaded items after gender filter: ${uploadedAfterFilter.length}`) // Debug log
      if (uploadedAfterFilter.length > 0) {
        console.log('Uploaded items:', uploadedAfterFilter.map(item => `${item.name} (${item.gender})`).join(', '))
      }
    }

    if (category) {
      items = items.filter((item: any) => 
        item.category.toLowerCase().includes(category.toLowerCase()) ||
        item.subcategory.toLowerCase().includes(category.toLowerCase())
      )
    }

    if (articleType) {
      items = items.filter((item: any) => 
        item.articleType.toLowerCase().includes(articleType.toLowerCase())
      )
    }

    // Apply pagination
    const paginatedItems = items.slice(offset, offset + limit)
    
    console.log(`Pagination: offset=${offset}, limit=${limit}, total=${items.length}, paginated=${paginatedItems.length}`) // Debug log
    const uploadedInPagination = paginatedItems.filter(item => item.isUploaded)
    console.log(`Uploaded in pagination: ${uploadedInPagination.length}`) // Debug log

    // Convert to ProcessedFashionItem format
    const data = paginatedItems.map((item: any) => ({
      id: `local_${item.id}`,
      name: item.name,
      image: item.image,
      category: item.category,
      subcategory: item.subcategory,
      gender: item.gender,
      color: item.color,
      season: item.season,
      usage: item.usage,
      year: item.year,
      articleType: item.articleType,
      isUploaded: item.isUploaded || false // Preserve the isUploaded flag
    }))

    return NextResponse.json({ 
      success: true, 
      products: data, // Changed from 'data' to 'products' to match expected format
      count: data.length,
      offset,
      limit
    })
  } catch (error) {
    console.error('Dataset API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dataset items',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
