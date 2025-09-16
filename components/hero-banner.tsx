"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const banners = [
  {
    id: 1,
    title: "Big Fashion Festival",
    subtitle: "EARLY BIRD DAYS",
    description: "CATCH SALE PRICES BEFORE SALE",
    image: "/fashion-festival-banner-with-stylish-models.jpg",
    cta: "Shop Now",
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "SPRING COLLECTION",
    description: "Fresh styles for the new season",
    image: "/spring-fashion-collection-banner.jpg",
    cta: "Explore Now",
  },
  {
    id: 3,
    title: "Weekend Sale",
    subtitle: "UP TO 70% OFF",
    description: "Limited time offer on selected items",
    image: "/weekend-sale-fashion-banner.jpg",
    cta: "Shop Sale",
  },
]

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <section className="relative h-[500px] overflow-hidden">
      <div className="relative h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide ? "translate-x-0" : index < currentSlide ? "-translate-x-full" : "translate-x-full"
            }`}
          >
            <div
              className="h-full bg-gradient-to-r from-accent/20 to-primary/20 flex items-center justify-center relative"
              style={{
                backgroundImage: `url(${banner.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10 text-center text-white max-w-2xl px-4">
                <div className="inline-block bg-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
                  {banner.subtitle}
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">{banner.title}</h1>
                <p className="text-xl md:text-2xl mb-8 text-balance">{banner.description}</p>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                  {banner.cta}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  )
}
