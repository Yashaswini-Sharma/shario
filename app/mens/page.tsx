"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { DatasetProductGrid } from "@/components/dataset-product-grid"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Filter, SlidersHorizontal, Grid3X3, LayoutGrid } from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export default function MensPage() {
  const [sortBy, setSortBy] = useState("recommended")
  const [viewMode, setViewMode] = useState("grid")
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    "Topwear", "Bottomwear", "Footwear", "Sports & Active Wear", 
    "Accessories", "Innerwear & Sleepwear", "Ethnic Wear"
  ]

  const brands = [
    "H&M", "Zara", "Nike", "Adidas", "Puma", "Levi's", "Tommy Hilfiger", 
    "Calvin Klein", "Polo Ralph Lauren", "Under Armour"
  ]

  const occasions = [
    "Casual", "Formal", "Party", "Sports", "Ethnic", "Lounge"
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-2">
          <nav className="text-sm text-gray-600">
            Home / <span className="text-gray-900 font-medium">Men</span>
          </nav>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Men's Fashion</h1>
          <p className="text-xl opacity-90">Explore the latest trends and timeless classics</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6 py-6">
          
          {/* Sidebar Filters */}
          <aside className={`lg:w-72 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">FILTERS</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="lg:hidden text-gray-500"
                  onClick={() => setShowFilters(false)}
                >
                  ✕
                </Button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium text-sm mb-3 text-gray-800 uppercase tracking-wide">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-pink-500 rounded border-gray-300" />
                      <span className="ml-3 text-sm text-gray-700 hover:text-pink-500">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6">
                <h3 className="font-medium text-sm mb-3 text-gray-800 uppercase tracking-wide">Brand</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-pink-500 rounded border-gray-300" />
                      <span className="ml-3 text-sm text-gray-700 hover:text-pink-500">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium text-sm mb-3 text-gray-800 uppercase tracking-wide">Price</h3>
                <div className="space-y-2">
                  {[
                    "Under ₹500",
                    "₹500 - ₹1000", 
                    "₹1000 - ₹2000",
                    "₹2000 - ₹5000",
                    "Above ₹5000"
                  ].map((range) => (
                    <label key={range} className="flex items-center cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-pink-500 rounded border-gray-300" />
                      <span className="ml-3 text-sm text-gray-700 hover:text-pink-500">{range}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Occasion */}
              <div className="mb-6">
                <h3 className="font-medium text-sm mb-3 text-gray-800 uppercase tracking-wide">Occasion</h3>
                <div className="space-y-2">
                  {occasions.map((occasion) => (
                    <label key={occasion} className="flex items-center cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-pink-500 rounded border-gray-300" />
                      <span className="ml-3 text-sm text-gray-700 hover:text-pink-500">{occasion}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Top Bar */}
            <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setShowFilters(true)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">2,50,000+</span> products for Men
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Sort by: {sortBy} <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortBy("recommended")}>
                        Recommended
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("popularity")}>
                        Popularity
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("price-low")}>
                        Price: Low to High
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("price-high")}>
                        Price: High to Low
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("newest")}>
                        Newest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("discount")}>
                        Better Discount
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <div className="flex border rounded-lg">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-r-none"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-l-none"
                      onClick={() => setViewMode("list")}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["All", ...categories.slice(0, 6)].map((category) => (
                <Badge 
                  key={category} 
                  variant={category === "All" ? "default" : "outline"}
                  className="cursor-pointer hover:bg-pink-50 hover:border-pink-200"
                >
                  {category}
                </Badge>
              ))}
            </div>

            {/* Products Grid */}
            <DatasetProductGrid gender="Men" initialLimit={48} />
          </main>
        </div>
      </div>
    </div>
  )
}
