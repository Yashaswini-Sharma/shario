const brands = [
  {
    name: "Nike",
    logo: "/nike-swoosh.png",
    category: "TITLE SPONSOR",
  },
  {
    name: "Adidas",
    logo: "/adidas-logo.png",
    category: "ASSOCIATE SPONSOR",
  },
  {
    name: "Puma",
    logo: "/puma-logo.jpg",
    category: "TITLE SPONSOR",
  },
  {
    name: "Zara",
    logo: "/generic-fashion-logo.png",
    category: "ASSOCIATE SPONSOR",
  },
  {
    name: "H&M",
    logo: "/letter-h-typography.png",
    category: "ASSOCIATE SPONSOR",
  },
]

export function BrandSponsors() {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {brands.map((brand, index) => (
            <div key={index} className="text-center group">
              <p className="text-xs text-muted-foreground mb-2 font-medium">{brand.category}</p>
              <div className="bg-white rounded-lg p-4 shadow-sm group-hover:shadow-md transition-shadow">
                <img
                  src={brand.logo || "/placeholder.svg"}
                  alt={brand.name}
                  className="h-12 w-auto mx-auto opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
