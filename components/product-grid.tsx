"use client"

import { useGame } from '@/lib/game-context'
import { useCart } from '@/lib/cart-context'
// import { useProductSharing } from '@/lib/product-sharing-context'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Star, ShoppingCart, Timer, Share2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from 'react'

// Extended product data for the grid
const allProducts = [
	{
		id: 1,
		name: "Classic White Shirt",
	 brand: "StyleHub Essentials",
		price: 1299,
		originalPrice: 1999,
		discount: 35,
		rating: 4.3,
		reviews: 1247,
		image: "/white-dress-shirt-professional.jpg",
		category: "Men",
		size: "M",
		color: "White",
		isNew: false,
	},
	{
		id: 2,
		name: "Floral Summer Dress",
		brand: "Trendy Collection",
		price: 2199,
		originalPrice: 3499,
		discount: 37,
		rating: 4.5,
		reviews: 892,
		image: "/floral-summer-dress-casual.jpg",
		category: "Women",
		size: "S",
		color: "Pink",
		isNew: true,
	},
	// Add more products here...
	{
		id: 9,
		name: "Leather Boots",
		brand: "Urban Style",
		price: 4299,
		originalPrice: 5999,
		discount: 28,
		rating: 4.4,
		reviews: 567,
		image: "/leather-boots-casual-style.jpg",
		category: "Footwear",
		size: "9",
		color: "Brown",
		isNew: false,
	},
	{
		id: 10,
		name: "Silk Scarf",
		brand: "Luxury Line",
		price: 1599,
		originalPrice: 2299,
		discount: 30,
		rating: 4.2,
		reviews: 234,
		image: "/silk-scarf-elegant-accessory.jpg",
		category: "Accessories",
		size: "One Size",
		color: "Blue",
		isNew: true,
	},
]

interface ProductGridProps {
	filters: {
		category: string
		priceRange: number[]
		brand: string
		size: string
		color: string
		rating: number
	}
}

export function ProductGrid({ filters }: ProductGridProps) {
	const { gamePhase, addToGameCart, currentRoom } = useGame?.() || {}
	const { addToCart } = useCart()
	// const { setCurrentProduct } = useProductSharing()
	const [selectedSize, setSelectedSize] = useState<string>('')
	const [selectedColor, setSelectedColor] = useState<string>('')

	// Determine if we're in game mode with active timer
	const isGameMode = gamePhase === 'styling' && currentRoom?.status === 'active'

	const handleAddToCart = async (product: any) => {
		if (isGameMode) {
			await addToGameCart?.({
				productId: product.id.toString(),
				name: product.name,
				price: product.price,
				imageUrl: product.image,
				category: product.category,
				quantity: 1,
				selectedSize: selectedSize || undefined,
				selectedColor: selectedColor || undefined,
			})
		} else {
			await addToCart?.(product.id.toString(), 1, selectedColor || undefined, selectedSize || undefined)
		}
	}

	// Filter products based on active filters
	const filteredProducts = allProducts.filter((product) => {
		if (filters.category && product.category !== filters.category) return false
		if (filters.brand && product.brand !== filters.brand) return false
		if (filters.size && product.size !== filters.size) return false
		if (filters.color && product.color !== filters.color) return false
		if (typeof product.price !== 'number' || product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false
		if (filters.rating > 0 && product.rating < filters.rating) return false
		return true
	})

	return (
		<div className="space-y-6">
			{/* Results Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Products</h1>
					<p className="text-muted-foreground">
						Showing {filteredProducts.length} of {allProducts.length} products
					</p>
				</div>

				<Select defaultValue="popularity">
					<SelectTrigger className="w-48">
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="popularity">Sort by Popularity</SelectItem>
						<SelectItem value="price-low">Price: Low to High</SelectItem>
						<SelectItem value="price-high">Price: High to Low</SelectItem>
						<SelectItem value="rating">Customer Rating</SelectItem>
						<SelectItem value="newest">Newest First</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Product Grid */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{filteredProducts.map((product) => (
					<Card key={product.id} className="overflow-hidden">
						<CardContent className="p-0">
							<div className="relative aspect-square">
								<img
									src={product.image}
									alt={product.name}
									className="object-cover w-full h-full"
								/>
								{product.isNew && (
									<Badge className="absolute top-2 right-2">New</Badge>
								)}
							</div>
							<div className="p-4 space-y-2">
								<div className="flex justify-between items-start">
									<div>
										<h3 className="font-semibold">{product.name}</h3>
										<p className="text-sm text-muted-foreground">{product.brand}</p>
									</div>
									<div className="flex gap-1">
										{/* <Button 
											variant="ghost" 
											size="icon"
											onClick={(e) => {
												e.stopPropagation()
												setCurrentProduct({
													id: product.id,
													name: product.name,
													price: product.price / 100, // Convert from paise
													image: product.image
												})
											}}
										>
											<Share2 className="w-4 h-4" />
										</Button> */}
										<Button variant="ghost" size="icon">
											<Heart className="w-5 h-5" />
										</Button>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<div className="flex items-center">
										<Star className="w-4 h-4 fill-current text-yellow-400" />
										<span className="text-sm ml-1">{product.rating}</span>
									</div>
									<span className="text-sm text-muted-foreground">
										({product.reviews} reviews)
									</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-lg font-bold">₹{product.price}</span>
									{product.discount > 0 && (
										<>
											<span className="text-sm line-through text-muted-foreground">
												₹{product.originalPrice}
											</span>
											<Badge variant="secondary" className="text-sm">
												{product.discount}% OFF
											</Badge>
										</>
									)}
								</div>
								<div className="grid grid-cols-2 gap-2">
									<Select value={selectedSize} onValueChange={setSelectedSize}>
										<SelectTrigger>
											<SelectValue placeholder="Size" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="XS">XS</SelectItem>
											<SelectItem value="S">S</SelectItem>
											<SelectItem value="M">M</SelectItem>
											<SelectItem value="L">L</SelectItem>
											<SelectItem value="XL">XL</SelectItem>
										</SelectContent>
									</Select>
									<Select value={selectedColor} onValueChange={setSelectedColor}>
										<SelectTrigger>
											<SelectValue placeholder="Color" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="White">White</SelectItem>
											<SelectItem value="Black">Black</SelectItem>
											<SelectItem value="Blue">Blue</SelectItem>
											<SelectItem value="Red">Red</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<Button 
									className="w-full" 
									onClick={() => handleAddToCart(product)}
									variant={isGameMode ? "secondary" : "default"}
								>
									{isGameMode ? (
										<>
											<Timer className="w-4 h-4 mr-2" />
											Add to Game Cart
										</>
									) : (
										<>
											<ShoppingCart className="w-4 h-4 mr-2" />
											Add to Cart
										</>
									)}
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{filteredProducts.map((product) => (
					<Card
						key={product.id}
						className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
					>
						<div className="relative">
							<img
								src={product.image || "/placeholder.svg"}
								alt={product.name}
								className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
							/>

							{/* Badges */}
							<div className="absolute top-2 left-2 flex flex-col gap-1">
								{product.isNew && <Badge className="bg-accent text-accent-foreground">NEW</Badge>}
								<Badge variant="destructive" className="bg-green-600 hover:bg-green-700">
									{product.discount}% OFF
								</Badge>
							</div>

							{/* Action Buttons */}
							<div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
								{/* <Button
									variant="ghost"
									size="icon"
									className="bg-white/80 hover:bg-white h-8 w-8"
									onClick={(e) => {
										e.stopPropagation()
										setCurrentProduct({
											id: product.id,
											name: product.name,
											price: product.price / 100, // Convert from paise
											image: product.image
										})
									}}
								>
									<Share2 className="h-4 w-4" />
								</Button> */}
								<Button
									variant="ghost"
									size="icon"
									className="bg-white/80 hover:bg-white h-8 w-8"
								>
									<Heart className="h-4 w-4" />
								</Button>
							</div>

							{/* Add to Game Cart Button */}
							{(gamePhase === 'styling' && currentRoom) && (
								<Button
									variant="secondary"
									size="sm"
									className="absolute bottom-2 right-2 z-10"
									onClick={(e) => {
										e.stopPropagation()
										addToGameCart && addToGameCart({
											productId: product.id.toString(),
											name: product.name,
											price: product.price,
											imageUrl: product.image,
											category: product.category,
											quantity: 1,
											selectedSize: selectedSize || undefined,
											selectedColor: selectedColor || undefined,
										})
									}}
								>
									Add to Game Cart
								</Button>
							)}
						</div>

						<CardContent className="p-4">
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">{product.brand}</p>
								<h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>

								{/* Rating */}
								<div className="flex items-center gap-1">
									<div className="flex items-center">
										<Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
										<span className="text-xs text-muted-foreground ml-1">
											{product.rating} | {product.reviews.toLocaleString()}
										</span>
									</div>
								</div>

								{/* Price */}
								<div className="flex items-center gap-2">
									<span className="font-bold text-lg">₹{product.price.toLocaleString()}</span>
									<span className="text-sm text-muted-foreground line-through">
										₹{product.originalPrice.toLocaleString()}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Load More */}
			{filteredProducts.length > 0 && (
				<div className="text-center">
					<Button variant="outline" size="lg">
						Load More Products
					</Button>
				</div>
			)}

			{/* No Results */}
			{filteredProducts.length === 0 && (
				<div className="text-center py-12">
					<h3 className="text-lg font-semibold mb-2">No products found</h3>
					<p className="text-muted-foreground">Try adjusting your filters to see more results</p>
				</div>
			)}
		</div>
	)
}
