"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { sampleProducts } from '@/lib/products-data'
import { ShoppingCart, Heart, Star } from 'lucide-react'

export function ProductDemo() {
  const { addToCart, loading } = useCart()
  const { user } = useAuth()
  const [selectedProduct, setSelectedProduct] = useState(sampleProducts[0])
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')

  const handleAddToCart = async () => {
    if (!user) {
      // This would normally trigger a sign-in modal
      alert('Please sign in to add items to your cart')
      return
    }

    if (!selectedColor && selectedProduct.colors.length > 1) {
      alert('Please select a color')
      return
    }

    if (!selectedSize && selectedProduct.sizes.length > 1) {
      alert('Please select a size')
      return
    }

    await addToCart(
      selectedProduct.id,
      1,
      selectedColor || selectedProduct.colors[0] || 'default',
      selectedSize || selectedProduct.sizes[0] || 'default'
    )

    // Reset selections
    setSelectedColor('')
    setSelectedSize('')
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Try Our Cart System</h2>
        <p className="text-muted-foreground">
          Select a product below and add it to your cart to test the functionality
        </p>
      </div>

      {/* Product Selection */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {sampleProducts.slice(0, 3).map((product) => (
          <Card 
            key={product.id} 
            className={`cursor-pointer transition-all ${
              selectedProduct.id === product.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => {
              setSelectedProduct(product)
              setSelectedColor('')
              setSelectedSize('')
            }}
          >
            <CardHeader className="pb-2">
              <div className="relative h-48 bg-muted rounded-lg mb-2">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{product.rating}</span>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Selected Product Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {selectedProduct.name}
            <Badge variant="secondary">{selectedProduct.category}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative h-96 bg-muted rounded-lg">
              <Image
                src={selectedProduct.images[0]}
                alt={selectedProduct.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-muted-foreground mb-4">{selectedProduct.description}</p>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold">${selectedProduct.price}</div>
                  {selectedProduct.originalPrice && (
                    <div className="text-xl text-muted-foreground line-through">
                      ${selectedProduct.originalPrice}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < Math.floor(selectedProduct.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({selectedProduct.reviews} reviews)
                  </span>
                </div>
              </div>

              {/* Color Selection */}
              {selectedProduct.colors.length > 1 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Color</label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct.colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Size Selection */}
              {selectedProduct.sizes.length > 1 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Size</label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct.sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={loading}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {loading ? 'Adding...' : 'Add to Cart'}
                </Button>
                
                <Button variant="outline" className="w-full" size="lg">
                  <Heart className="h-5 w-5 mr-2" />
                  Add to Wishlist
                </Button>
              </div>

              {/* Product Tags */}
              <div>
                <div className="text-sm font-medium mb-2">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}