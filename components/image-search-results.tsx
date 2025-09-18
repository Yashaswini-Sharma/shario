"use client"

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { type ImageData } from "@/lib/image-service"
import Link from "next/link"

interface ImageSearchResultsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isAnalyzing: boolean
  results: ImageData | null
}

export function ImageSearchResults({ 
  open, 
  onOpenChange, 
  isAnalyzing, 
  results 
}: ImageSearchResultsProps) {
  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>Search Results</DialogTitle>
        <DialogDescription>
          {isAnalyzing ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Analyzing image...</span>
            </div>
          ) : results ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Image and Tags */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Uploaded Image</h3>
                  <img 
                    src={results.url} 
                    alt="Uploaded" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium mb-2">Detected Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-secondary rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Outfit Suggestions */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Outfit Suggestions</h3>
                  <div className="space-y-2">
                    {results.outfitSuggestions?.map((outfit, i) => (
                      <p key={i} className="text-sm">• {outfit}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Similar Items */}
              {results.similarItems && results.similarItems.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Similar Items</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {results.similarItems.map((item) => (
                      <Link 
                        key={item.id} 
                        href={item.url}
                        className="group block space-y-2 hover:opacity-80 transition-opacity"
                      >
                        <div className="aspect-square overflow-hidden rounded-lg">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium truncate">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">${item.price}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Outfit Recommendations */}
              {results.recommendations && results.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Complete the Look</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {results.recommendations.map((item) => (
                      <Link 
                        key={item.id} 
                        href={item.url}
                        className="group block space-y-2 hover:opacity-80 transition-opacity"
                      >
                        <div className="aspect-square overflow-hidden rounded-lg">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium truncate">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">${item.price}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
