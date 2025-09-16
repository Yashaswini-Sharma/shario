"use client"

import { Header } from "@/components/header"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { useState } from "react"

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 10000],
    brand: "",
    size: "",
    color: "",
    rating: 0,
  })

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0">
            <ProductFilters filters={filters} onFiltersChange={setFilters} />
          </aside>
          <div className="flex-1">
            <ProductGrid filters={filters} />
          </div>
        </div>
      </main>
    </div>
  )
}
