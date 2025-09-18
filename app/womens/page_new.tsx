"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { DatasetProductGrid } from "@/components/dataset-product-grid"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, Filter, SlidersHorizontal, Grid3X3, LayoutGrid, Heart, Star, TrendingUp, Sparkles, Users, Crown } from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

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

  // Trending categories for women
  const trendingCategories = [
    {
      id: 1,
      name: "Kurtas & Suits",
      image: "https://assets.myntassets.com/f_webp,dpr_1.5,q_60,w_400,c_limit,fl_progressive/assets/images/2022/6/27/02d2f6a4-e59b-4e42-b3aa-bf8e2f5f14d41656304717041-Kurtas-_-Kurta-Sets---Libas--Anouk--Aurelia---More.jpg",
      discount: "50-80% OFF",
      tag: "FESTIVE"
    },
    {
      id: 2,
      name: "Sarees",
      image: "https://assets.myntassets.com/f_webp,dpr_1.5,q_60,w_400,c_limit,fl_progressive/assets/images/2022/6/27/ca71fee7-3cbb-4b20-b5e5-49327c177b651656304717073-Sarees---Mitera--KALINI--Molcha---More.jpg",
      discount: "40-70% OFF",
      tag: "TRENDING"
    },
    {
      id: 3,
      name: "Dresses",
      image: "https://assets.myntassets.com/f_webp,dpr_1.5,q_60,w_400,c_limit,fl_progressive/assets/images/2022/6/27/ca71fee7-3cbb-4b20-b5e5-49327c177b651656304717073-Sarees---Mitera--KALINI--Molcha---More.jpg",
      discount: "60-80% OFF",
      tag: "BESTSELLER"
    },
    {
      id: 4,
      name: "Beauty & Makeup",
      image: "https://assets.myntassets.com/f_webp,dpr_1.5,q_60,w_400,c_limit,fl_progressive/assets/images/2022/6/27/177a4c46-a5f8-4ccb-a8e0-12edc1e8dbe91656304717105-Beauty---Lakme--Maybelline--The-Face-Shop---More.jpg",
      discount: "25-60% OFF",
      tag: "NEW"
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
            <span className="text-gray-900 font-medium">Women</span>
          </nav>
        </div>
      </div>

      {/* Hero Section with Categories */}
      <div className="bg-white mb-6">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                Women's Fashion 
                <Crown className="h-6 w-6 text-pink-500" />
              </h1>
              <p className="text-lg text-gray-600">Discover your style • 75,000+ items</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-pink-50 text-pink-700 hover:bg-pink-100">
                <Sparkles className="h-3 w-3 mr-1" />
                Festive Collection
              </Badge>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending Now
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
                        ${category.tag === 'FESTIVE' ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600' : ''}
                        ${category.tag === 'TRENDING' ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600' : ''}
                        ${category.tag === 'BESTSELLER' ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600' : ''}
                        ${category.tag === 'NEW' ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' : ''}
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
                    <Heart className="h-3 w-3 mr-1" />
                    Wishlist
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

              {/* Occasions */}
              <div className="mb-6">
                <h3 className="font-bold text-sm mb-4 text-gray-900 uppercase tracking-wide">Occasion</h3>
                <div className="space-y-3">
                  {occasions.map((occasion) => (
                    <label key={occasion} className="flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-pink-500 rounded border-gray-300 focus:ring-pink-500 focus:ring-2" 
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-pink-600 transition-colors">{occasion}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-bold text-sm mb-4 text-gray-900 uppercase tracking-wide">Price</h3>
                <div className="space-y-3">
                  {[
                    "Under ₹500",
                    "₹500 - ₹1000", 
                    "₹1000 - ₹2000",
                    "₹2000 - ₹5000",
                    "Above ₹5000"
                  ].map((range) => (
                    <label key={range} className="flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-pink-500 rounded border-gray-300 focus:ring-pink-500 focus:ring-2" 
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-pink-600 transition-colors">{range}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="mb-6">
                <h3 className="font-bold text-sm mb-4 text-gray-900 uppercase tracking-wide">Color</h3>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { name: "Black", color: "bg-black" },
                    { name: "White", color: "bg-white border" },
                    { name: "Red", color: "bg-red-500" },
                    { name: "Pink", color: "bg-pink-500" },
                    { name: "Blue", color: "bg-blue-500" },
                    { name: "Green", color: "bg-green-500" },
                    { name: "Yellow", color: "bg-yellow-500" },
                    { name: "Purple", color: "bg-purple-500" },
                    { name: "Orange", color: "bg-orange-500" },
                    { name: "Brown", color: "bg-amber-700" },
                    { name: "Navy", color: "bg-navy-900" },
                    { name: "Grey", color: "bg-gray-500" }
                  ].map((colorOption) => (
                    <div
                      key={colorOption.name}
                      className={`w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform ${colorOption.color}`}
                      title={colorOption.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1">
            {/* Sort and View Controls */}
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
              <div className="flex items-center justify-between mb-4 lg:mb-0">
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
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="min-w-0">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Sort: {sortBy}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuItem onClick={() => setSortBy("recommended")}>
                        Recommended
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("newest")}>
                        What's New
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("popularity")}>
                        Popularity
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("price-low-high")}>
                        Price: Low to High
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("price-high-low")}>
                        Price: High to Low
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("customer-rating")}>
                        Customer Rating
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("discount")}>
                        Better Discount
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="p-2"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="p-2"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Results Info */}
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">1-50</span> of <span className="font-medium text-gray-900">75,842</span> products
              </div>
            </div>

            {/* Products Grid */}
            <DatasetProductGrid 
              gender="women" 
              sortBy={sortBy} 
              viewMode={viewMode}
              className="bg-white rounded-xl shadow-sm border p-6"
            />
          </main>
        </div>
      </div>
    </div>
  )
}
