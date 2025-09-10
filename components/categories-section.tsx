import { Card, CardContent } from "@/components/ui/card"

const categories = [
  {
    name: "Men's Fashion",
    image: "/men-s-fashion-clothing-collection.jpg",
    description: "Discover the latest in men's style",
  },
  {
    name: "Women's Fashion",
    image: "/women-s-fashion-clothing-collection.jpg",
    description: "Elegant and trendy women's wear",
  },
  {
    name: "Kids Collection",
    image: "/kids-fashion-clothing-collection.jpg",
    description: "Comfortable and stylish kids wear",
  },
  {
    name: "Accessories",
    image: "/fashion-accessories-bags-shoes-jewelry.jpg",
    description: "Complete your look with accessories",
  },
  {
    name: "Footwear",
    image: "/trendy-shoes-sneakers-boots-collection.jpg",
    description: "Step out in style",
  },
  {
    name: "Activewear",
    image: "/athletic-sportswear-fitness-clothing.jpg",
    description: "Performance meets style",
  },
]

export function CategoriesSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our diverse collection of fashion categories, each carefully curated to match your unique style and
            preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Card
              key={index}
              className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-card"
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.description}</p>
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
