"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Star, Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw, Share2 } from "lucide-react"

// Mock product data
const productData = {
  id: 1,
  name: "Premium Cotton T-Shirt",
  brand: "StyleCo",
  price: 29.99,
  originalPrice: 39.99,
  rating: 4.5,
  reviews: 128,
  description:
    "Experience ultimate comfort with our premium cotton t-shirt. Made from 100% organic cotton, this versatile piece features a classic fit that's perfect for everyday wear. The soft, breathable fabric ensures all-day comfort while maintaining its shape wash after wash.",
  images: [
    "/premium-cotton-t-shirt-fashion.jpg",
    "/premium-cotton-t-shirt-back.jpg",
    "/premium-cotton-t-shirt-detail.jpg",
    "/premium-cotton-t-shirt-lifestyle.jpg",
  ],
  colors: [
    { name: "White", value: "white", hex: "#ffffff" },
    { name: "Black", value: "black", hex: "#000000" },
    { name: "Navy", value: "navy", hex: "#1e3a8a" },
    { name: "Gray", value: "gray", hex: "#6b7280" },
  ],
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  features: ["100% Organic Cotton", "Pre-shrunk fabric", "Reinforced seams", "Machine washable", "Tagless design"],
  specifications: {
    Material: "100% Organic Cotton",
    Fit: "Regular",
    Care: "Machine wash cold, tumble dry low",
    Origin: "Made in USA",
    Weight: "180 GSM",
  },
  isNew: true,
  discount: 25,
  inStock: true,
  stockCount: 15,
}

const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    date: "2024-01-15",
    comment:
      "Amazing quality! The fabric is so soft and comfortable. Fits perfectly and the color hasn't faded after multiple washes.",
    verified: true,
  },
  {
    id: 2,
    name: "Mike Chen",
    rating: 4,
    date: "2024-01-10",
    comment: "Great t-shirt for the price. Good quality cotton and nice fit. Would definitely buy again.",
    verified: true,
  },
  {
    id: 3,
    name: "Emma Davis",
    rating: 5,
    date: "2024-01-08",
    comment: "Love this t-shirt! It's become my go-to for casual wear. The organic cotton feels great on the skin.",
    verified: false,
  },
]

const relatedProducts = [
  {
    id: 2,
    name: "Classic Polo Shirt",
    brand: "StyleCo",
    price: 39.99,
    originalPrice: 49.99,
    rating: 4.6,
    image: "/classic-polo-shirt-fashion.jpg",
  },
  {
    id: 3,
    name: "Casual Hoodie",
    brand: "StyleCo",
    price: 59.99,
    originalPrice: 79.99,
    rating: 4.4,
    image: "/casual-hoodie-fashion.jpg",
  },
  {
    id: 4,
    name: "Denim Jeans",
    brand: "StyleCo",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.7,
    image: "/denim-jeans-fashion.jpg",
  },
]

interface ProductDetailProps {
  productId: string
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(productData.colors[0].value)
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= productData.stockCount) {
      setQuantity(newQuantity)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-8">
        <span>Home</span> / <span>Men</span> / <span>T-Shirts</span> /{" "}
        <span className="text-foreground">{productData.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={productData.images[selectedImage] || "/placeholder.svg"}
              alt={productData.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-4">
            {productData.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                  selectedImage === index ? "border-primary" : "border-border"
                }`}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${productData.name} view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {productData.brand}
              </Badge>
              {productData.isNew && <Badge className="text-xs">New</Badge>}
              {productData.discount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  -{productData.discount}%
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{productData.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(productData.rating) ? "fill-primary text-primary" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{productData.rating}</span>
              <span className="text-sm text-muted-foreground">({productData.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">${productData.price}</span>
              {productData.originalPrice > productData.price && (
                <span className="text-xl text-muted-foreground line-through">${productData.originalPrice}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-muted-foreground leading-relaxed">{productData.description}</p>
          </div>

          {/* Color Selection */}
          <div>
            <h3 className="font-semibold mb-3">
              Color: {productData.colors.find((c) => c.value === selectedColor)?.name}
            </h3>
            <div className="flex gap-3">
              {productData.colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-10 h-10 rounded-full border-2 transition-colors ${
                    selectedColor === color.value ? "border-primary" : "border-border"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <h3 className="font-semibold mb-3">Size</h3>
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a size" />
              </SelectTrigger>
              <SelectContent>
                {productData.sizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div>
            <h3 className="font-semibold mb-3">Quantity</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-md">
                <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= productData.stockCount}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">{productData.stockCount} items left</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button className="flex-1" size="lg" disabled={!selectedSize || !productData.inStock}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg" onClick={() => setIsWishlisted(!isWishlisted)}>
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <Button variant="outline" className="w-full bg-transparent" size="lg">
              Buy Now
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-primary" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RotateCcw className="h-4 w-4 text-primary" />
              <span>30-Day Returns</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span>2-Year Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="details" className="mb-16">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({productData.reviews})</TabsTrigger>
          <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product Features</h3>
              <ul className="space-y-2">
                {productData.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Specifications</h3>
              <div className="space-y-2">
                {Object.entries(productData.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="space-y-6">
            {/* Review Summary */}
            <div className="flex items-center gap-8 p-6 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold">{productData.rating}</div>
                <div className="flex items-center justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(productData.rating) ? "fill-primary text-primary" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{productData.reviews} reviews</div>
              </div>
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-2 mb-1">
                    <span className="text-sm w-8">{stars}★</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.random() * 80 + 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{review.name}</span>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Shipping Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Free Standard Shipping:</strong> 5-7 business days on orders over $50
                </div>
                <div>
                  <strong>Express Shipping:</strong> 2-3 business days for $9.99
                </div>
                <div>
                  <strong>Next Day Delivery:</strong> Order by 2 PM for $19.99
                </div>
                <div>
                  <strong>International Shipping:</strong> Available to select countries
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Returns & Exchanges</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>30-Day Return Policy:</strong> Items must be unworn with tags attached
                </div>
                <div>
                  <strong>Free Returns:</strong> Use our prepaid return label
                </div>
                <div>
                  <strong>Exchange Policy:</strong> Free size and color exchanges
                </div>
                <div>
                  <strong>Refund Processing:</strong> 3-5 business days after we receive your return
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      <div>
        <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedProducts.map((product) => (
            <Card
              key={product.id}
              className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 bg-background border-0"
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                    <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <span className="text-xs">{product.rating}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">${product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
