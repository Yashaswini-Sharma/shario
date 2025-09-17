"use client"

import { useState, useEffect } from "react"
import { ProcessedFashionItem } from "@/lib/huggingface-dataset"
import { DatasetProductCard } from "@/components/dataset-product-card"
import { DatasetGridSkeleton } from "@/components/dataset-loading"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DatasetProductGridProps {
  gender?: 'Men' | 'Women'
  category?: string
  initialLimit?: number
}

export function DatasetProductGrid({ gender, category, initialLimit = 24 }: DatasetProductGridProps) {
  const [items, setItems] = useState<ProcessedFashionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ProcessedFashionItem | null>(null)
  const [filters, setFilters] = useState({
    articleType: '',
    season: '',
    usage: '',
    color: ''
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadFashionData()
  }, [gender, category])

  const loadFashionData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build API URL with parameters
      const params = new URLSearchParams()
      params.set('limit', initialLimit.toString())
      
      if (gender) {
        params.set('gender', gender)
      }
      if (category) {
        params.set('category', category)
      }

      const response = await fetch(`/api/dataset?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setItems(result.data)
      } else {
        throw new Error(result.error || 'Failed to load data')
      }
    } catch (err) {
      console.error('Error loading fashion data:', err)
      setError('Failed to load fashion items. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.articleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.color.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilters = 
      (!filters.articleType || item.articleType === filters.articleType) &&
      (!filters.season || item.season === filters.season) &&
      (!filters.usage || item.usage === filters.usage) &&
      (!filters.color || item.color === filters.color)

    return matchesSearch && matchesFilters
  })

  // Get unique values for filters
  const uniqueArticleTypes = Array.from(new Set(items.map(item => item.articleType))).sort()
  const uniqueSeasons = Array.from(new Set(items.map(item => item.season))).sort()
  const uniqueUsage = Array.from(new Set(items.map(item => item.usage))).sort()
  const uniqueColors = Array.from(new Set(items.map(item => item.color))).sort()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadFashionData}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Select value={filters.articleType || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, articleType: value === 'all' ? '' : value }))}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Article Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueArticleTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.season || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, season: value === 'all' ? '' : value }))}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              {uniqueSeasons.map(season => (
                <SelectItem key={season} value={season}>{season}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.usage || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, usage: value === 'all' ? '' : value }))}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Usage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Usage</SelectItem>
              {uniqueUsage.map(usage => (
                <SelectItem key={usage} value={usage}>{usage}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.color || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, color: value === 'all' ? '' : value }))}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colors</SelectItem>
              {uniqueColors.map(color => (
                <SelectItem key={color} value={color}>{color}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => setFilters({ articleType: '', season: '', usage: '', color: '' })}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredItems.length} of {items.length} items
      </div>

      {/* Loading State */}
      {loading && <DatasetGridSkeleton count={initialLimit} />}

      {/* Products Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredItems.map((item) => (
            <DatasetProductCard
              key={item.id}
              item={item}
              onClick={setSelectedItem}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No items found matching your criteria.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setFilters({ articleType: '', season: '', usage: '', color: '' })
              setSearchTerm('')
            }}
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Item Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.name}</DialogTitle>
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Article Type:</span>
                        <span className="font-medium">{selectedItem.articleType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gender:</span>
                        <span className="font-medium">{selectedItem.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="font-medium">{selectedItem.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subcategory:</span>
                        <span className="font-medium">{selectedItem.subcategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Color:</span>
                        <span className="font-medium">{selectedItem.color}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Season:</span>
                        <span className="font-medium">{selectedItem.season}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Usage:</span>
                        <span className="font-medium">{selectedItem.usage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Year:</span>
                        <span className="font-medium">{selectedItem.year}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
