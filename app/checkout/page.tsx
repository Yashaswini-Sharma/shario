import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Checkout } from "@/components/checkout"

export default function CheckoutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Checkout />
      </main>
      <Footer />
    </div>
  )
}
