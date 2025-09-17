import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // Read dataset directly from file system on server
    const filePath = path.join(process.cwd(), 'public/dataset/dataset.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(fileContent)
    
    const items = data.items || []
    
    // Calculate statistics
    const genderCounts = items.reduce((acc: any, item: any) => {
      acc[item.gender] = (acc[item.gender] || 0) + 1
      return acc
    }, { Men: 0, Women: 0, Unisex: 0 })

    // Get unique values
    const categories = Array.from(new Set(items.map((item: any) => item.category).filter(Boolean))).sort()
    const subcategories = Array.from(new Set(items.map((item: any) => item.subcategory).filter(Boolean))).sort()
    const articleTypes = Array.from(new Set(items.map((item: any) => item.articleType).filter(Boolean))).sort()
    const seasons = Array.from(new Set(items.map((item: any) => item.season).filter(Boolean))).sort()
    const usages = Array.from(new Set(items.map((item: any) => item.usage).filter(Boolean))).sort()
    const colors = Array.from(new Set(items.map((item: any) => item.color).filter(Boolean))).sort()

    return NextResponse.json({ 
      success: true, 
      categories,
      subcategories,
      articleTypes,
      seasons,
      usages,
      colors,
      genderDistribution: genderCounts,
      totalItems: items.length
    })
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
