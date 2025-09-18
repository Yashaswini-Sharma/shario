"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Star, ShoppingCart, Timer, Share2 } from "lucide-react"
import { getAllProducts, getProductsByGender, getProductsByCategory } from "@/lib/enhanced-products-data"
import { Product } from "@/lib/types"
import { useGame } from '@/lib/game-context'
import { useCart } from '@/lib/cart-context'
import { useProductSharing } from '@/lib/product-sharing-context-new'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Convert Product to the expected format for the grid
function convertProduct(product: Product) {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand || 'Fashion Brand',
    price: Math.round(product.price * 100), // Convert to paise/cents
    originalPrice: product.originalPrice ? Math.round(product.originalPrice * 100) : undefined,
    discount: product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0,
    rating: product.rating || 4.0,
    reviews: product.reviews || 50,
    image: product.images[0] || "/placeholder.jpg",
    category: product.tags.includes('men') ? 'Men' : product.tags.includes('women') ? 'Women' : 'Unisex',
    size: product.sizes[0] || 'M',
    color: product.colors[0] || 'Multi',
    isNew: (new Date().getTime() - new Date(product.createdAt).getTime()) < (30 * 24 * 60 * 60 * 1000), // New if less than 30 days old
  }
}

interface ProductGridProps {
  filters?: {
    category?: string
    priceRange?: number[]
    brand?: string
    size?: string
    color?: string
    rating?: number
  }
  searchQuery?: string
  gender?: 'men' | 'women' | 'all'
  limit?: number
}

export function ProductGrid({ 
  filters = {}, 
  searchQuery = '', 
  gender = 'all',
  limit
}: ProductGridProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Cart functionality
  const { gamePhase, addToGameCart, currentRoom } = useGame?.() || {}
  const { addToCart } = useCart()
  const { setCurrentProduct } = useProductSharing()

  // Determine if we're in game mode with active timer
  const isGameMode = gamePhase === 'styling' && currentRoom?.status === 'active'

  const handleAddToCart = async (product: any) => {
    if (isGameMode && addToGameCart) {
      await addToGameCart({
        productId: product.id.toString(),
        name: product.name,
        price: product.price,
        imageUrl: product.image,
        category: product.category,
        quantity: 1,
        selectedSize: product.selectedSize,
        selectedColor: product.selectedColor,
      })
    } else if (addToCart) {
      await addToCart(
        product.id.toString(),
        1,
        product.selectedColor,
        product.selectedSize
      )
    }
  }

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        let rawProducts: Product[] = []
        
        // Get products based on gender filter
        if (gender === 'men') {
          rawProducts = await getProductsByGender('men')
        } else if (gender === 'women') {
          rawProducts = await getProductsByGender('women')
        } else {
          rawProducts = await getAllProducts()
        }

        // Apply search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          rawProducts = rawProducts.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.tags.some(tag => tag.toLowerCase().includes(query)) ||
            product.brand?.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
          )
        }

        // Apply category filter
        if (filters.category) {
          rawProducts = rawProducts.filter(product => 
            product.category.toLowerCase() === filters.category?.toLowerCase() ||
            product.subcategory?.toLowerCase() === filters.category?.toLowerCase()
          )
        }

        // Apply brand filter
        if (filters.brand) {
          rawProducts = rawProducts.filter(product => 
            product.brand?.toLowerCase() === filters.brand?.toLowerCase()
          )
        }

        // Apply rating filter
        if (filters.rating && filters.rating > 0) {
          rawProducts = rawProducts.filter(product => 
            (product.rating || 0) >= filters.rating!
          )
        }

        // Apply price range filter
        if (filters.priceRange && filters.priceRange.length === 2) {
          const [minPrice, maxPrice] = filters.priceRange
          rawProducts = rawProducts.filter(product => {
            const priceInPaise = product.price * 100
            return priceInPaise >= minPrice && priceInPaise <= maxPrice
          })
        }

        // Convert to grid format
        let convertedProducts = rawProducts.map(convertProduct)

        // Apply limit
        if (limit) {
          convertedProducts = convertedProducts.slice(0, limit)
        }

        setProducts(convertedProducts)
      } catch (error) {
        console.error('Error loading products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [filters, searchQuery, gender, limit])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found matching your criteria.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="group hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.jpg"
                }}
              />
              {product.isNew && (
                <Badge className="absolute top-2 left-2 bg-green-500">
                  New
                </Badge>
              )}
              {product.discount > 0 && (
                <Badge className="absolute top-2 right-2 bg-red-500">
                  -{product.discount}%
                </Badge>
              )}
              <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setCurrentProduct({
                    id: product.id,
                    name: product.name,
                    price: product.price / 100, // Convert back from paise
                    image: product.image
                  })}
                  className="h-8 w-8 p-0"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-sm leading-tight line-clamp-2">
                  {product.name}
                </h3>
              </div>

              <p className="text-xs text-gray-500">{product.brand}</p>

              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs">{product.rating}</span>
                <span className="text-xs text-gray-500">({product.reviews})</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg">₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Select value={product.selectedSize} onValueChange={(value) => {
                  const updatedProducts = products.map(p => 
                    p.id === product.id ? {...p, selectedSize: value} : p
                  )
                  setProducts(updatedProducts)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes?.map((size: string) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={product.selectedColor} onValueChange={(value) => {
                  const updatedProducts = products.map(p => 
                    p.id === product.id ? {...p, selectedColor: value} : p
                  )
                  setProducts(updatedProducts)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Color" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.colors?.map((color: string) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full" 
                size="sm"
                onClick={() => handleAddToCart(product)}
                variant={isGameMode ? "secondary" : "default"}
              >
                {isGameMode ? (
                  <>
                    <Timer className="w-4 h-4 mr-2" />
                    Add to Game Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ProductGrid