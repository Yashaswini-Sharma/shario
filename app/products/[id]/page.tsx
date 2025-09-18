"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Heart, Share2, ArrowLeft, Star, Truck, Shield, RotateCcw } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useCommunity } from "@/lib/community-context"
import { getProductPrice, formatPrice } from "@/lib/pricing-utils"
import { toast } from "@/hooks/use-toast"

interface ProductData {
  id: string
  name: string
  articleType: string
  gender: string
  category: string
  subcategory?: string
  color: string
  season: string
  usage: string
  year: string
  image: string
  brand?: string
}

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const { shareProductToCommunity, currentCommunity } = useCommunity()
  
  const [product, setProduct] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('')
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadProductDetails(params.id as string)
    }
  }, [params.id])

  const loadProductDetails = async (productId: string) => {
    try {
      setLoading(true)
      // Try to fetch from API first
      const response = await fetch(`/api/dataset?limit=1000`)
      const data = await response.json()
      
      if (data.success && data.products) {
        const foundProduct = data.products.find((p: any) => p.id === productId || p.id === `hf_${productId}`)
        if (foundProduct) {
          setProduct(foundProduct)
          setSelectedColor(foundProduct.color)
        } else {
          // If not found, create a mock product (for demo purposes)
          setProduct({
            id: productId,
            name: "Product Details",
            articleType: "Fashion Item",
            gender: "Unisex",
            category: "Clothing",
            color: "Various",
            season: "All Season",
            usage: "Casual",
            year: "2024",
            image: "/placeholder-product.jpg"
          })
        }
      }
    } catch (error) {
      console.error('Error loading product:', error)
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    setIsAddingToCart(true)
    try {
      await addToCart(product.id, 1, selectedColor, selectedSize)
      toast({
        title: "Added to Cart!",
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleShare = async () => {
    if (!product) return
    
    setIsSharing(true)
    try {
      await shareProductToCommunity(product)
      toast({
        title: "Product Shared!",
        description: currentCommunity 
          ? `Shared to ${currentCommunity.name}` 
          : "Product shared successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share product",
        variant: "destructive"
      })
    } finally {
      setIsSharing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="aspect-square bg-gray-300 rounded-lg"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const productPrice = getProductPrice(product)
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const colors = [product.color, 'Black', 'White', 'Navy', 'Gray'].filter((color, index, arr) => arr.indexOf(color) === index)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <button onClick={() => router.back()} className="hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span>Home</span>
            <span>/</span>
            <span>{product.gender}</span>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <span className="text-gray-900">{product.articleType}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-white shadow-sm">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-product.jpg'
                  }}
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.brand && (
                    <Badge variant="outline" className="text-xs">
                      {product.brand}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {product.articleType}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl font-bold text-green-600">
                    {formatPrice(productPrice)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 text-gray-300" />
                    <span className="text-sm text-gray-600 ml-1">(4.2)</span>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Color:</span> {product.color}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span> {product.category}
                  </div>
                  <div>
                    <span className="font-medium">Season:</span> {product.season}
                  </div>
                  <div>
                    <span className="font-medium">Usage:</span> {product.usage}
                  </div>
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="font-medium mb-3">Size</h3>
                <div className="flex gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <h3 className="font-medium mb-3">Color</h3>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                        selectedColor === color
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {isAddingToCart ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Adding to Cart...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </div>
                  )}
                </Button>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-12">
                    <Heart className="w-4 h-4 mr-2" />
                    Wishlist
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12"
                    onClick={handleShare}
                    disabled={isSharing}
                  >
                    {isSharing ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Share2 className="w-4 h-4 mr-2" />
                    )}
                    Share
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 pt-6 border-t">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span>Free delivery on orders above ₹999</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  <span>Easy 30-day returns</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>100% authentic products</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Product Info */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Article Type:</span>
                  <span className="font-medium">{product.articleType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gender:</span>
                  <span className="font-medium">{product.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                {product.subcategory && (
                  <div className="flex justify-between">
                    <span>Subcategory:</span>
                    <span className="font-medium">{product.subcategory}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Year:</span>
                  <span className="font-medium">{product.year}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery & Returns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="font-medium">Standard Delivery</div>
                  <div className="text-gray-600">5-7 business days</div>
                </div>
                <Separator />
                <div>
                  <div className="font-medium">Express Delivery</div>
                  <div className="text-gray-600">2-3 business days</div>
                </div>
                <Separator />
                <div>
                  <div className="font-medium">Easy Returns</div>
                  <div className="text-gray-600">30-day return policy</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Size Guide</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 font-medium border-b pb-2">
                    <span>Size</span>
                    <span>Chest</span>
                    <span>Length</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span>S</span>
                    <span>36"</span>
                    <span>27"</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span>M</span>
                    <span>38"</span>
                    <span>28"</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span>L</span>
                    <span>40"</span>
                    <span>29"</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span>XL</span>
                    <span>42"</span>
                    <span>30"</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
