import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const categories = [
  {
    id: 1,
    name: "Men's Fashion",
    image: "/category-4.png",
    description: "Trendy styles for him",
    cta: "For Him",
  },
  {
    id: 2,
    name: "Women's Fashion",
    image: "/category-1.png",
    description: "Elegant styles for her",
    cta: "For Her",
  },
  {
    id: 3,
    name: "Kids Collection",
    image: "/kids-fashion.png",
    description: "Cute & comfortable",
    cta: "For Kids",
  },
  {
    id: 4,
    name: "Footwear",
    image: "/fashion-footwear-shoes.jpg",
    description: "Step in style",
    cta: "Shop Shoes",
  },
  {
    id: 5,
    name: "Accessories",
    image: "/fashion-accessories-bags-jewelry.jpg",
    description: "Complete your look",
    cta: "Accessories",
  },
  {
    id: 6,
    name: "Beauty",
    image: "/beauty-cosmetics-skincare.jpg",
    description: "Glow & shine",
    cta: "Beauty",
  },
]

export function CategoryGrid() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-balance">Shop by Category</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Card key={category.id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm mb-4 opacity-90">{category.description}</p>
                  <Button variant="secondary" size="sm" className="bg-white/90 text-black hover:bg-white">
                    {category.cta}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
