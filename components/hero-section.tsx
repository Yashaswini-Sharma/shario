import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-card to-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
                Fashion That
                <span className="text-primary block">Speaks You</span>
              </h1>
              <p className="text-lg text-muted-foreground text-pretty max-w-md">
                Discover the latest trends and timeless classics. Express your unique style with our curated collection
                of premium fashion.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-base">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-base bg-transparent">
                Explore Collections
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-8">
              <div>
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">Premium Brands</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
              <img src="/fashionable-person-wearing-trendy-outfit-in-modern.jpg" alt="Fashion Hero" className="w-full h-full object-cover" />
            </div>
            {/* Floating Cards */}
            <div className="absolute -top-4 -left-4 bg-background rounded-lg p-4 shadow-lg border">
              <div className="text-sm font-medium">Free Shipping</div>
              <div className="text-xs text-muted-foreground">On orders over $99</div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-background rounded-lg p-4 shadow-lg border">
              <div className="text-sm font-medium">30-Day Returns</div>
              <div className="text-xs text-muted-foreground">Hassle-free policy</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
