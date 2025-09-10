import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCatalog } from "@/components/product-catalog"

export default function CatalogPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <ProductCatalog />
      </main>
      <Footer />
    </div>
  )
}
