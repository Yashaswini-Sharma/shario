import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const trendingCategories = [
  {
    id: 1,
    name: "Ethnic Wear",
    description: "Traditional & Contemporary",
    image: "/ethnic-wear-traditional-clothing.jpg",
    itemCount: "2000+ items",
  },
  {
    id: 2,
    name: "Athleisure",
    description: "Comfort meets style",
    image: "/athleisure-sportswear-casual.jpg",
    itemCount: "1500+ items",
  },
  {
    id: 3,
    name: "Formal Wear",
    description: "Professional attire",
    image: "/formal-wear-business-attire.jpg",
    itemCount: "1200+ items",
  },
  {
    id: 4,
    name: "Street Style",
    description: "Urban fashion trends",
    image: "/street-style-urban-fashion.jpg",
    itemCount: "1800+ items",
  },
]

export function TrendingCategories() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-balance">Trending Categories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the latest fashion trends and styles that are making waves this season
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingCategories.map((category) => (
            <Card
              key={category.id}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="relative">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                  <p className="text-sm opacity-90 mb-2">{category.description}</p>
                  <p className="text-xs opacity-75">{category.itemCount}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button size="lg" variant="outline">
            Explore All Categories
          </Button>
        </div>
      </div>
    </section>
  )
}
