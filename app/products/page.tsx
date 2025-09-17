"use client"

import { Header } from "@/components/header"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { DatasetProductGrid } from "@/components/dataset-product-grid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-center mb-4">Our Products</h1>
          <p className="text-xl text-muted-foreground text-center mb-8">
            Discover our latest collection and dataset items
          </p>
        </div>
        
        <Tabs defaultValue="dataset" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="dataset">Fashion Dataset</TabsTrigger>
            <TabsTrigger value="store">Store Products</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dataset" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Fashion Dataset Collection</h2>
              <p className="text-muted-foreground">
                Tagged fashion items from the Hugging Face dataset
              </p>
            </div>
            <DatasetProductGrid initialLimit={60} />
          </TabsContent>
          
          <TabsContent value="store" className="space-y-6">
            <div className="flex gap-8">
              <aside className="w-64 flex-shrink-0">
                <ProductFilters filters={filters} onFiltersChange={setFilters} />
              </aside>
              <div className="flex-1">
                <ProductGrid filters={filters} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
