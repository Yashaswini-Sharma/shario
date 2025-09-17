"use client"

import { useState, useEffect } from "react"
import { DatasetProductGrid } from "@/components/dataset-product-grid"
import { LocalDatasetService } from "@/lib/local-dataset-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, Users, BarChart3 } from "lucide-react"

interface CategoryStats {
  categories: string[]
  subcategories: string[]
  articleTypes: string[]
  seasons: string[]
  usages: string[]
  colors: string[]
  genderDistribution: { Men: number; Women: number; Unisex: number }
  totalItems: number
}

export default function BrowsePage() {
  const [stats, setStats] = useState<CategoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedArticleType, setSelectedArticleType] = useState<string | null>(null)

  useEffect(() => {
    loadCategoryStats()
  }, [])

  const loadCategoryStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dataset/categories')
      const data = await response.json()
      
      if (data.success) {
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading category stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading fashion categories...</span>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-500">Failed to load category data</p>
          <Button onClick={loadCategoryStats} className="mt-4">Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Browse Fashion Dataset</h1>
        <p className="text-muted-foreground">
          Explore {stats.totalItems} tagged fashion items by category, type, and more
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="types">Article Types</TabsTrigger>
          <TabsTrigger value="browse">Browse All</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
                <CardDescription>Items by gender category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Men:</span>
                  <Badge variant="secondary">{stats.genderDistribution.Men}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Women:</span>
                  <Badge variant="secondary">{stats.genderDistribution.Women}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Unisex:</span>
                  <Badge variant="secondary">{stats.genderDistribution.Unisex}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Main fashion categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.categories.length}</div>
                <p className="text-sm text-muted-foreground">Different categories</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Article Types</CardTitle>
                <CardDescription>Specific clothing items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.articleTypes.length}</div>
                <p className="text-sm text-muted-foreground">Different types</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Colors</CardTitle>
                <CardDescription>Available colors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.colors.length}</div>
                <p className="text-sm text-muted-foreground">Different colors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasons</CardTitle>
                <CardDescription>Seasonal collections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.seasons.length}</div>
                <p className="text-sm text-muted-foreground">Different seasons</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Types</CardTitle>
                <CardDescription>Occasion categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.usages.length}</div>
                <p className="text-sm text-muted-foreground">Different usages</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {selectedCategory ? (
            <div>
              <div className="mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCategory(null)}
                >
                  ← Back to Categories
                </Button>
                <h2 className="text-2xl font-semibold mt-4 mb-2">{selectedCategory}</h2>
              </div>
              <DatasetProductGrid category={selectedCategory} initialLimit={30} />
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Fashion Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {stats.categories.map((category) => (
                  <Card 
                    key={category}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-medium text-center">{category}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="types" className="space-y-6">
          {selectedArticleType ? (
            <div>
              <div className="mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedArticleType(null)}
                >
                  ← Back to Types
                </Button>
                <h2 className="text-2xl font-semibold mt-4 mb-2">{selectedArticleType}</h2>
              </div>
              <DatasetProductGrid initialLimit={30} />
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Article Types</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {stats.articleTypes.map((type) => (
                  <Card 
                    key={type}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedArticleType(type)}
                  >
                    <CardContent className="p-3">
                      <h3 className="font-medium text-center text-sm">{type}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">All Items</h2>
            <DatasetProductGrid initialLimit={60} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
