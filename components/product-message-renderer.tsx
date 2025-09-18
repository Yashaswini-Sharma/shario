"use client"

import { useState } from 'react'

interface ProductMessageRendererProps {
  content: string
  pageUrl?: string
  userName: string
  timestamp: number
}

export function ProductMessageRenderer({ content, pageUrl, userName, timestamp }: ProductMessageRendererProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Extract image URL from message content
  const extractImageUrl = (text: string): string | null => {
    const imageMatch = text.match(/🖼️ \*\*Image\*\*: (https?:\/\/[^\s]+)/i)
    return imageMatch ? imageMatch[1] : null
  }

  // Extract product details
  const extractProductDetails = (text: string) => {
    const nameMatch = text.match(/\*\*([^*]+)\*\*/)
    const priceMatch = text.match(/💰 \*\*Price\*\*: ₹([0-9,]+\.?[0-9]*)/i)
    const brandMatch = text.match(/👔 \*\*Brand\*\*: ([^\n]+)/i)
    const categoryMatch = text.match(/🏷️ \*\*Category\*\*: ([^\n]+)/i)

    return {
      name: nameMatch ? nameMatch[1] : 'Unknown Product',
      price: priceMatch ? priceMatch[1] : 'N/A',
      brand: brandMatch ? brandMatch[1] : null,
      category: categoryMatch ? categoryMatch[1] : null
    }
  }

  const imageUrl = extractImageUrl(content)
  const productDetails = extractProductDetails(content)

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-3 max-w-sm">
      {/* Product Header */}
      <div className="font-medium text-sm flex items-center gap-2">
        🛍️ Shared a product
      </div>

      {/* Product Image */}
      {imageUrl && (
        <div className="rounded-lg overflow-hidden border">
          <img
            src={imageUrl}
            alt={productDetails.name}
            className="w-full h-48 object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        </div>
      )}

      {/* Product Details Card */}
      <div className="bg-background/50 rounded-lg p-3 border">
        <h4 className="font-semibold text-sm mb-2">{productDetails.name}</h4>
        
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium">Price:</span>
            <span className="text-green-600 font-semibold">₹{productDetails.price}</span>
          </div>
          
          {productDetails.brand && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Brand:</span>
              <span>{productDetails.brand}</span>
            </div>
          )}
          
          {productDetails.category && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Category:</span>
              <span>{productDetails.category}</span>
            </div>
          )}
        </div>

        {pageUrl && (
          <div className="mt-3 pt-2 border-t">
            <a
              href={pageUrl}
              className="text-xs text-blue-600 hover:text-blue-800 underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Product Details →
            </a>
          </div>
        )}
      </div>

      {/* Message Footer */}
      <div className="text-xs opacity-70">
        <div>💭 What do you think about this piece? ✨</div>
        <div className="mt-1">
          {userName} • {formatTime(timestamp)}
        </div>
      </div>
    </div>
  )
}
