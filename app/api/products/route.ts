import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'products.json')
    
    if (fs.existsSync(dataPath)) {
      const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
      return NextResponse.json(jsonData)
    } else {
      // Return sample data if no cached data exists
      return NextResponse.json({
        all: [],
        mens: [],
        womens: [],
        lastUpdated: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Error reading products data:', error)
    return NextResponse.json(
      { error: 'Failed to load products' },
      { status: 500 }
    )
  }
}