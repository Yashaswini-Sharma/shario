import { Header } from "@/components/header"
import { HeroBanner } from "@/components/hero-banner"
import { CategoryGrid } from "@/components/category-grid"
import { FeaturedProducts } from "@/components/featured-products"
import { TrendingCategories } from "@/components/trending-categories"
import { BrandSponsors } from "@/components/brand-sponsors"
import { PromoSection } from "@/components/promo-section"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroBanner />
        <CategoryGrid />
        <FeaturedProducts />
        <TrendingCategories />
        <BrandSponsors />
        <PromoSection />
      </main>
    </div>
  )
}
