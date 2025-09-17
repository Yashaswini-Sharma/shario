"use client"

import { DatasetProductGrid } from "@/components/dataset-product-grid"

export default function WomensPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Women's Fashion</h1>
        <p className="text-muted-foreground mt-2">
          Explore elegant styles and contemporary fashion for women
        </p>
      </div>

      <DatasetProductGrid gender="Women" initialLimit={48} />
    </div>
  )
}
