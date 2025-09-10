"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Filter, Grid, List, Heart, Star, X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

// Mock product data
const products = [
  {
    id: 1,
    name: "Premium Cotton T-Shirt",
    brand: "StyleCo",
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.5,
    reviews: 128,
    image: "/premium-cotton-t-shirt-fashion.jpg",
    category: "t-shirts",
    color: "white",
    size: ["S", "M", "L", "XL"],
    isNew: true,
    discount: 25,
  },
  {
    id: 2,
    name: "Denim Jacket Classic",
    brand: "UrbanWear",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.8,
    reviews: 89,
    image: "/classic-denim-jacket-fashion.jpg",
    category: "jackets",
    color: "blue",
    size: ["S", "M", "L", "XL"],
    isNew: false,
    discount: 25,
  },
  {
    id: 3,
    name: "Elegant Summer Dress",
    brand: "ChicStyle",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.6,
    reviews: 156,
    image: "/elegant-summer-dress-fashion.jpg",
    category: "dresses",
    color: "pink",
    size: ["XS", "S", "M", "L"],
    isNew: true,
    discount: 20,
  },
  {
    id: 4,
    name: "Casual Sneakers",
    brand: "ComfortFeet",
    price: 69.99,
    originalPrice: 89.99,
    rating: 4.7,
    reviews: 203,
    image: "/casual-sneakers-shoes-fashion.jpg",
    category: "shoes",
    color: "white",
    size: ["7", "8", "9", "10", "11"],
    isNew: false,
    discount: 22,
  },
  {
    id: 5,
    name: "Business Formal Shirt",
    brand: "ExecutiveWear",
    price: 59.99,
    originalPrice: 79.99,
    rating: 4.4,
    reviews: 95,
    image: "/business-formal-shirt-fashion.jpg",
    category: "shirts",
    color: "blue",
    size: ["S", "M", "L", "XL", "XXL"],
    isNew: false,
    discount: 25,
  },
  {
    id: 6,
    name: "Leather Handbag",
    brand: "LuxeAccessories",
    price: 149.99,
    originalPrice: 199.99,
    rating: 4.9,
    reviews: 67,
    image: "/leather-handbag-fashion-accessory.jpg",
    category: "bags",
    color: "brown",
    size: ["One Size"],
    isNew: true,
    discount: 25,
  },
]

const categories = [
  { id: "t-shirts", name: "T-Shirts", count: 45 },
  { id: "shirts", name: "Shirts", count: 32 },
  { id: "jackets", name: "Jackets", count: 28 },
  { id: "dresses", name: "Dresses", count: 56 },
  { id: "shoes", name: "Shoes", count: 78 },
  { id: "bags", name: "Bags", count: 23 },
]

const brands = [
  { id: "styleco", name: "StyleCo", count: 15 },
  { id: "urbanwear", name: "UrbanWear", count: 22 },
  { id: "chicstyle", name: "ChicStyle", count: 18 },
  { id: "comfortfeet", name: "ComfortFeet", count: 12 },
  { id: "executivewear", name: "ExecutiveWear", count: 8 },
  { id: "luxeaccessories", name: "LuxeAccessories", count: 6 },
]

const colors = [
  { id: "white", name: "White", hex: "#ffffff" },
  { id: "black", name: "Black", hex: "#000000" },
  { id: "blue", name: "Blue", hex: "#3b82f6" },
  { id: "red", name: "Red", hex: "#ef4444" },
  { id: "pink", name: "Pink", hex: "#ec4899" },
  { id: "brown", name: "Brown", hex: "#a3a3a3" },
]

export function ProductCatalog() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("featured")
  const [priceRange, setPriceRange] = useState([0, 200])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [showNewOnly, setShowNewOnly] = useState(false)
  const [showSaleOnly, setShowSaleOnly] = useState(false)

  const filteredProducts = products.filter((product) => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand.toLowerCase().replace(/\s+/g, "")))
      return false
    if (selectedColors.length > 0 && !selectedColors.includes(product.color)) return false
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false
    if (showNewOnly && !product.isNew) return false
    if (showSaleOnly && product.discount === 0) return false
    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "newest":
        return b.isNew ? 1 : -1
      default:
        return 0
    }
  })

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setSelectedColors([])
    setPriceRange([0, 200])
    setShowNewOnly(false)
    setShowSaleOnly(false)
  }

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {(selectedCategories.length > 0 ||
        selectedBrands.length > 0 ||
        selectedColors.length > 0 ||
        showNewOnly ||
        showSaleOnly) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Active Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge key={category} variant="secondary" className="cursor-pointer">
                {categories.find((c) => c.id === category)?.name}
                <X
                  className="ml-1 h-3 w-3"
                  onClick={() => setSelectedCategories((prev) => prev.filter((c) => c !== category))}
                />
              </Badge>
            ))}
            {selectedBrands.map((brand) => (
              <Badge key={brand} variant="secondary" className="cursor-pointer">
                {brands.find((b) => b.id === brand)?.name}
                <X
                  className="ml-1 h-3 w-3"
                  onClick={() => setSelectedBrands((prev) => prev.filter((b) => b !== brand))}
                />
              </Badge>
            ))}
            {selectedColors.map((color) => (
              <Badge key={color} variant="secondary" className="cursor-pointer">
                {colors.find((c) => c.id === color)?.name}
                <X
                  className="ml-1 h-3 w-3"
                  onClick={() => setSelectedColors((prev) => prev.filter((c) => c !== color))}
                />
              </Badge>
            ))}
            {showNewOnly && (
              <Badge variant="secondary" className="cursor-pointer">
                New Items
                <X className="ml-1 h-3 w-3" onClick={() => setShowNewOnly(false)} />
              </Badge>
            )}
            {showSaleOnly && (
              <Badge variant="secondary" className="cursor-pointer">
                On Sale
                <X className="ml-1 h-3 w-3" onClick={() => setShowSaleOnly(false)} />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="px-2">
          <Slider value={priceRange} onValueChange={setPriceRange} max={200} min={0} step={5} className="mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, category.id])
                  } else {
                    setSelectedCategories(selectedCategories.filter((c) => c !== category.id))
                  }
                }}
              />
              <label htmlFor={category.id} className="text-sm flex-1 cursor-pointer">
                {category.name} ({category.count})
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="font-semibold mb-3">Brands</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={brand.id}
                checked={selectedBrands.includes(brand.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBrands([...selectedBrands, brand.id])
                  } else {
                    setSelectedBrands(selectedBrands.filter((b) => b !== brand.id))
                  }
                }}
              />
              <label htmlFor={brand.id} className="text-sm flex-1 cursor-pointer">
                {brand.name} ({brand.count})
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="font-semibold mb-3">Colors</h3>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <div
              key={color.id}
              className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                selectedColors.includes(color.id) ? "border-primary" : "border-border"
              }`}
              style={{ backgroundColor: color.hex }}
              onClick={() => {
                if (selectedColors.includes(color.id)) {
                  setSelectedColors(selectedColors.filter((c) => c !== color.id))
                } else {
                  setSelectedColors([...selectedColors, color.id])
                }
              }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Special Filters */}
      <div>
        <h3 className="font-semibold mb-3">Special</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="new-items" checked={showNewOnly} onCheckedChange={setShowNewOnly} />
            <label htmlFor="new-items" className="text-sm cursor-pointer">
              New Arrivals
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="sale-items" checked={showSaleOnly} onCheckedChange={setShowSaleOnly} />
            <label htmlFor="sale-items" className="text-sm cursor-pointer">
              On Sale
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Products</h1>
        <p className="text-muted-foreground">Discover our complete collection of fashion items</p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Card className="p-6">
            <FilterSidebar />
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden bg-transparent">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>

              <span className="text-sm text-muted-foreground">{sortedProducts.length} products found</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {sortedProducts.map((product) => (
              <Card
                key={product.id}
                className={`group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 bg-background border-0 ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                <CardContent className="p-0">
                  <div className={`relative overflow-hidden ${viewMode === "list" ? "w-48 flex-shrink-0" : ""}`}>
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                        viewMode === "list" ? "w-full h-48" : "w-full h-64"
                      }`}
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.isNew && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                          New
                        </span>
                      )}
                      {product.discount > 0 && (
                        <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full font-medium">
                          -{product.discount}%
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>

                    {/* Quick Add Button - Only in grid view */}
                    {viewMode === "grid" && (
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button className="w-full" size="sm">
                          Quick Add
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className={`p-4 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}>
                    <div className="mb-2">
                      <p className="text-sm text-muted-foreground">{product.brand}</p>
                      <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span className="text-xs ml-1">{product.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">({product.reviews})</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-primary">${product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                      )}
                    </div>

                    {/* List view actions */}
                    {viewMode === "list" && (
                      <div className="flex gap-2">
                        <Button className="flex-1" size="sm">
                          Add to Cart
                        </Button>
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="default" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
