"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { DatasetProductGrid } from "@/components/dataset-product-grid"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Filter, SlidersHorizontal, Grid3X3, LayoutGrid, Heart, Star } from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export default function WomensPage() {
  const [sortBy, setSortBy] = useState("recommended")
  const [viewMode, setViewMode] = useState("grid")
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    "Kurtas & Suits", "Sarees", "Ethnic Wear", "Dresses", "Tops", 
    "Jeans", "Trousers", "Skirts", "Lingerie & Sleepwear", "Footwear",
    "Bags", "Watches", "Jewellery", "Beauty & Personal Care"
  ]

  const brands = [
    "H&M", "Zara", "Forever 21", "Vero Moda", "Only", "Mango", "W for Woman",
    "Biba", "Fabindia", "Global Desi", "Aurelia", "Libas", "Span", "AND"
  ]

  const occasions = [
    "Casual", "Formal", "Party", "Festive", "Wedding", "Ethnic", "Western"
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-2">
          <nav className="text-sm text-gray-600">
            Home / <span className="text-gray-900 font-medium">Women</span>
          </nav>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Women's Fashion</h1>
          <p className="text-xl opacity-90">Discover your perfect style with our curated collection</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6 py-6">
          
          {/* Sidebar Filters */}
          <aside className={`lg:w-72 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-pink-600">FILTERS</h2>
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
                <div className="space-y-2 max-h-48 overflow-y-auto">
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

              {/* Color */}
              <div className="mb-6">
                <h3 className="font-medium text-sm mb-3 text-gray-800 uppercase tracking-wide">Color</h3>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { name: "Black", color: "bg-black" },
                    { name: "White", color: "bg-white border" },
                    { name: "Red", color: "bg-red-500" },
                    { name: "Pink", color: "bg-pink-500" },
                    { name: "Blue", color: "bg-blue-500" },
                    { name: "Green", color: "bg-green-500" },
                    { name: "Yellow", color: "bg-yellow-400" },
                    { name: "Purple", color: "bg-purple-500" },
                    { name: "Orange", color: "bg-orange-500" },
                    { name: "Brown", color: "bg-amber-700" },
                    { name: "Gray", color: "bg-gray-500" },
                    { name: "Navy", color: "bg-navy-700" }
                  ].map((colorOption) => (
                    <div 
                      key={colorOption.name}
                      className={`w-8 h-8 rounded-full cursor-pointer ${colorOption.color} hover:ring-2 hover:ring-pink-300`}
                      title={colorOption.name}
                    />
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

              {/* Size */}
              <div className="mb-6">
                <h3 className="font-medium text-sm mb-3 text-gray-800 uppercase tracking-wide">Size</h3>
                <div className="grid grid-cols-4 gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38"].map((size) => (
                    <button 
                      key={size}
                      className="border border-gray-300 text-sm py-1 rounded hover:border-pink-500 hover:text-pink-500"
                    >
                      {size}
                    </button>
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
                    <span className="font-medium">1,80,000+</span> products for Women
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
              {["All", ...categories.slice(0, 8)].map((category) => (
                <Badge 
                  key={category} 
                  variant={category === "All" ? "default" : "outline"}
                  className="cursor-pointer hover:bg-pink-50 hover:border-pink-200 text-xs"
                >
                  {category}
                </Badge>
              ))}
            </div>

            {/* Trending Section */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">✨ Trending Now</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  "Ethnic Wear",
                  "Summer Dresses", 
                  "Work From Home",
                  "Party Wear"
                ].map((trend) => (
                  <div key={trend} className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full mx-auto mb-2"></div>
                      <p className="text-sm font-medium text-gray-700">{trend}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <DatasetProductGrid gender="Women" initialLimit={48} />
          </main>
        </div>
      </div>
    </div>
  )
}
