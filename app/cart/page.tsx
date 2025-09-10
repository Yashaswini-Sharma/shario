import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ShoppingCart } from "@/components/shopping-cart"

export default function CartPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <ShoppingCart />
      </main>
      <Footer />
    </div>
  )
}
