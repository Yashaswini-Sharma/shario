"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Star } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Extended product data for the grid
const allProducts = [
  {
    id: 1,
    name: "Classic White Shirt",
    brand: "StyleHub Essentials",
    price: 1299,
    originalPrice: 1999,
    discount: 35,
    rating: 4.3,
    reviews: 1247,
    image: "/white-dress-shirt-professional.jpg",
    category: "Men",
    size: "M",
    color: "White",
    isNew: false,
  },
  {
    id: 2,
    name: "Floral Summer Dress",
    brand: "Trendy Collection",
    price: 2199,
    originalPrice: 3499,
    discount: 37,
    rating: 4.5,
    reviews: 892,
    image: "/floral-summer-dress-casual.jpg",
    category: "Women",
    size: "S",
    color: "Pink",
    isNew: true,
  },
  // Add more products here...
  {
    id: 9,
    name: "Leather Boots",
    brand: "Urban Style",
    price: 4299,
    originalPrice: 5999,
    discount: 28,
    rating: 4.4,
    reviews: 567,
    image: "/leather-boots-casual-style.jpg",
    category: "Footwear",
    size: "9",
    color: "Brown",
    isNew: false,
  },
  {
    id: 10,
    name: "Silk Scarf",
    brand: "Luxury Line",
    price: 1599,
    originalPrice: 2299,
    discount: 30,
    rating: 4.2,
    reviews: 234,
    image: "/silk-scarf-elegant-accessory.jpg",
    category: "Accessories",
    size: "One Size",
    color: "Blue",
    isNew: true,
  },
]

interface ProductGridProps {
  filters: {
    category: string
    priceRange: number[]
    brand: string
    size: string
    color: string
    rating: number
  }
}

export function ProductGrid({ filters }: ProductGridProps) {
  // Filter products based on active filters
  const filteredProducts = allProducts.filter((product) => {
    if (filters.category && product.category !== filters.category) return false
    if (filters.brand && product.brand !== filters.brand) return false
    if (filters.size && product.size !== filters.size) return false
    if (filters.color && product.color !== filters.color) return false
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false
    if (filters.rating > 0 && product.rating < filters.rating) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Showing {filteredProducts.length} of {allProducts.length} products
          </p>
        </div>

        <Select defaultValue="popularity">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Sort by Popularity</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Customer Rating</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="relative">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isNew && <Badge className="bg-accent text-accent-foreground">NEW</Badge>}
                <Badge variant="destructive" className="bg-green-600 hover:bg-green-700">
                  {product.discount}% OFF
                </Badge>
              </div>

              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            <CardContent className="p-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{product.brand}</p>
                <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground ml-1">
                      {product.rating} | {product.reviews.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">₹{product.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {filteredProducts.length > 0 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Products
          </Button>
        </div>
      )}

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your filters to see more results</p>
        </div>
      )}
    </div>
  )
}
