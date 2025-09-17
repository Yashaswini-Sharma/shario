import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DatasetProductSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <Skeleton className="h-full w-full" />
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start gap-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        
        <div className="flex gap-2 w-full">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
        
        <div className="space-y-2 w-full">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
          
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          
          <div className="flex justify-between">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export function DatasetGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <DatasetProductSkeleton key={i} />
      ))}
    </div>
  )
}
