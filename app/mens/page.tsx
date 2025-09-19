"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { DatasetProductGrid } from "@/components/dataset-product-grid"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, Filter, SlidersHorizontal, Grid3X3, LayoutGrid, Heart, Star, TrendingUp, Zap, Users } from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

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

  // Trending categories for men
  const trendingCategories = [
    {
      id: 1,
      name: "Shirts",
      image: "/classic white shirt.webp",
      discount: "40-80% OFF",
      tag: "TRENDING"
    },
    {
      id: 2,
      name: "T-Shirts",
      image: "/t-shirts.webp",
      discount: "50-80% OFF",
      tag: "BESTSELLER"
    },
    {
      id: 3,
      name: "Jeans",
      image: "/mensjeans.jpeg",
      discount: "50-70% OFF",
      tag: "NEW"
    },
    {
      id: 4,
      name: "Footwear",
      image: "/footwear.jpeg",
      discount: "40-70% OFF",
      tag: "POPULAR"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-gray-600">
            <span className="hover:text-pink-500 cursor-pointer">Home</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Men</span>
          </nav>
        </div>
      </div>

      {/* Hero Section with Categories */}
      <div className="bg-white mb-6">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Men's Fashion</h1>
              <p className="text-lg text-gray-600">Explore the latest trends • 50,000+ items</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-pink-50 text-pink-700 hover:bg-pink-100">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                <Zap className="h-3 w-3 mr-1" />
                New Arrivals
              </Badge>
            </div>
          </div>
          
          {/* Trending Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {trendingCategories.map((category) => (
              <Card key={category.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
                <CardContent className="p-0 relative">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className={`
                        text-xs font-bold px-2 py-1 
                        ${category.tag === 'TRENDING' ? 'bg-pink-500 hover:bg-pink-600' : ''}
                        ${category.tag === 'BESTSELLER' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                        ${category.tag === 'NEW' ? 'bg-green-500 hover:bg-green-600' : ''}
                        ${category.tag === 'POPULAR' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                        text-white
                      `}>
                        {category.tag}
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h3 className="text-white font-bold text-lg mb-1">{category.name}</h3>
                      <p className="text-yellow-300 text-sm font-medium">{category.discount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6 py-6">
          
          {/* Enhanced Sidebar Filters */}
          <aside className={`lg:w-72 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">FILTERS</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                  onClick={() => setShowFilters(false)}
                >
                  ✕
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300">
                    <Users className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300">
                    <Star className="h-3 w-3 mr-1" />
                    4★ & above
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300">
                    Sale
                  </Badge>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-bold text-sm mb-4 text-gray-900 uppercase tracking-wide">Categories</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-pink-500 rounded border-gray-300 focus:ring-pink-500 focus:ring-2" 
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-pink-600 transition-colors">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6">
                <h3 className="font-bold text-sm mb-4 text-gray-900 uppercase tracking-wide">Brand</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-pink-500 rounded border-gray-300 focus:ring-pink-500 focus:ring-2" 
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-pink-600 transition-colors">{brand}</span>
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
