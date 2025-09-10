import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Star } from "lucide-react"

const featuredProducts = [
  {
    id: 1,
    name: "Premium Cotton T-Shirt",
    brand: "StyleCo",
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.5,
    reviews: 128,
    image: "/premium-cotton-t-shirt-fashion.jpg",
    isNew: true,
    discount: 25,
  },
  {
    id: 2,
    name: "Denim Jacket Classic",
    brand: "UrbanWear",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.8,
    reviews: 89,
    image: "/classic-denim-jacket-fashion.jpg",
    isNew: false,
    discount: 25,
  },
  {
    id: 3,
    name: "Elegant Summer Dress",
    brand: "ChicStyle",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.6,
    reviews: 156,
    image: "/elegant-summer-dress-fashion.jpg",
    isNew: true,
    discount: 20,
  },
  {
    id: 4,
    name: "Casual Sneakers",
    brand: "ComfortFeet",
    price: 69.99,
    originalPrice: 89.99,
    rating: 4.7,
    reviews: 203,
    image: "/casual-sneakers-shoes-fashion.jpg",
    isNew: false,
    discount: 22,
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Handpicked favorites that are trending right now. Don't miss out on these popular items.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
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

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isNew && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                        New
                      </span>
                    )}
                    {product.discount > 0 && (
                      <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full font-medium">
                        -{product.discount}%
                      </span>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>

                  {/* Quick Add Button */}
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button className="w-full" size="sm">
                      Quick Add
                    </Button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-2">
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                    <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span className="text-xs ml-1">{product.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                  </div>

                  {/* Price */}
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

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  )
}
