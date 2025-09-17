"use client"

import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProcessedFashionItem } from "@/lib/huggingface-dataset"

interface DatasetProductCardProps {
  item: ProcessedFashionItem
  onClick?: (item: ProcessedFashionItem) => void
}

export function DatasetProductCard({ item, onClick }: DatasetProductCardProps) {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg"
      onClick={() => onClick?.(item)}
    >
      <CardContent className="p-0">
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={item.image}
            alt={item.name}
            width={300}
            height={300}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.jpg';
            }}
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start gap-2 p-4">
        <div className="w-full">
          <h3 className="font-semibold text-sm line-clamp-2 mb-2">
            {item.name}
          </h3>
          
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge variant="secondary" className="text-xs">
              {item.articleType}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {item.gender}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Color:</span>
              <span className="font-medium">{item.color}</span>
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Category:</span>
              <span className="font-medium">{item.category}</span>
            </div>
            
            {item.subcategory && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Type:</span>
                <span className="font-medium">{item.subcategory}</span>
              </div>
            )}
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Season:</span>
              <span className="font-medium">{item.season}</span>
            </div>
            
            {item.usage && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Usage:</span>
                <span className="font-medium">{item.usage}</span>
              </div>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
