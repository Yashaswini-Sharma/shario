import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '50')
    const gender = searchParams.get('gender') as 'Men' | 'Women' | null
    const category = searchParams.get('category')
    const articleType = searchParams.get('articleType')
    const search = searchParams.get('search')

    // Read dataset directly from file system
    const filePath = path.join(process.cwd(), 'public/dataset/dataset.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const datasetJson = JSON.parse(fileContent)
    
    let items = datasetJson.items || []

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
      items = items.filter((item: any) => item.gender === gender)
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
      articleType: item.articleType
    }))

    return NextResponse.json({ 
      success: true, 
      data,
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
