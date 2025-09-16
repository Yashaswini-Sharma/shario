import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Star } from "lucide-react"

const featuredProducts = [
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
    isNew: true,
  },
  {
    id: 3,
    name: "Denim Jacket",
    brand: "Urban Style",
    price: 2999,
    originalPrice: 4299,
    discount: 30,
    rating: 4.2,
    reviews: 634,
    image: "/denim-jacket-casual-wear.jpg",
    category: "Men",
    isNew: false,
  },
  {
    id: 4,
    name: "Sneakers Pro",
    brand: "SportMax",
    price: 3499,
    originalPrice: 4999,
    discount: 28,
    rating: 4.6,
    reviews: 1523,
    image: "/white-sneakers-athletic-shoes.jpg",
    category: "Footwear",
    isNew: true,
  },
  {
    id: 5,
    name: "Elegant Handbag",
    brand: "Luxury Line",
    price: 4599,
    originalPrice: 6999,
    discount: 34,
    rating: 4.4,
    reviews: 456,
    image: "/leather-handbag-elegant-style.jpg",
    category: "Accessories",
    isNew: false,
  },
  {
    id: 6,
    name: "Casual T-Shirt",
    brand: "Comfort Wear",
    price: 799,
    originalPrice: 1299,
    discount: 38,
    rating: 4.1,
    reviews: 2134,
    image: "/casual-t-shirt-cotton-blend.jpg",
    category: "Men",
    isNew: false,
  },
  {
    id: 7,
    name: "Maxi Dress",
    brand: "Elegant Styles",
    price: 2799,
    originalPrice: 3999,
    discount: 30,
    rating: 4.3,
    reviews: 723,
    image: "/maxi-dress-elegant-evening.jpg",
    category: "Women",
    isNew: true,
  },
  {
    id: 8,
    name: "Running Shoes",
    brand: "ActiveFit",
    price: 2899,
    originalPrice: 3999,
    discount: 28,
    rating: 4.5,
    reviews: 1876,
    image: "/running-shoes-athletic-performance.jpg",
    category: "Footwear",
    isNew: false,
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-balance">Featured Products</h2>
          <Button variant="outline">View All</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
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
      </div>
    </section>
  )
}
