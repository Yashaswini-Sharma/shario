"use client"

import { DatasetProductGrid } from "@/components/dataset-product-grid"

export default function MensPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Men's Fashion</h1>
        <p className="text-muted-foreground mt-2">
          Discover the latest trends and styles for men
        </p>
      </div>

      <DatasetProductGrid gender="Men" initialLimit={48} />
    </div>
  )
}
