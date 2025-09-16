"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface Filters {
  category: string
  priceRange: number[]
  brand: string
  size: string
  color: string
  rating: number
}

interface ProductFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

const categories = ["Men", "Women", "Kids", "Footwear", "Accessories", "Beauty"]
const brands = ["StyleHub", "Trendy Collection", "Urban Style", "SportMax", "Luxury Line"]
const sizes = ["XS", "S", "M", "L", "XL", "XXL"]
const colors = ["Black", "White", "Blue", "Red", "Green", "Pink", "Gray", "Brown"]

export function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
  const updateFilter = (key: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      category: "",
      priceRange: [0, 10000],
      brand: "",
      size: "",
      color: "",
      rating: 0,
    })
  }

  const hasActiveFilters = filters.category || filters.brand || filters.size || filters.color || filters.rating > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.category}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("category", "")} />
            </Badge>
          )}
          {filters.brand && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.brand}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("brand", "")} />
            </Badge>
          )}
          {filters.size && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.size}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("size", "")} />
            </Badge>
          )}
          {filters.color && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.color}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("color", "")} />
            </Badge>
          )}
        </div>
      )}

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={filters.category === category}
                onCheckedChange={(checked) => updateFilter("category", checked ? category : "")}
              />
              <label htmlFor={category} className="text-sm cursor-pointer">
                {category}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Price Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter("priceRange", value)}
              max={10000}
              min={0}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>₹{filters.priceRange[0]}</span>
              <span>₹{filters.priceRange[1]}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Brand</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={brand}
                checked={filters.brand === brand}
                onCheckedChange={(checked) => updateFilter("brand", checked ? brand : "")}
              />
              <label htmlFor={brand} className="text-sm cursor-pointer">
                {brand}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Size Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <Button
                key={size}
                variant={filters.size === size ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter("size", filters.size === size ? "" : size)}
              >
                {size}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Color</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {colors.map((color) => (
              <Button
                key={color}
                variant={filters.color === color ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => updateFilter("color", filters.color === color ? "" : color)}
              >
                {color}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
