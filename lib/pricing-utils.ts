// Pricing utility for consistent product prices based on category
export const CATEGORY_PRICES: Record<string, number> = {
  // Women's Categories
  'Kurtas & Suits': 1599,
  'Sarees': 2999,
  'Ethnic Wear': 1899,
  'Dresses': 1299,
  'Tops': 899,
  'Jeans': 1499,
  'Trousers': 1299,
  'Skirts': 999,
  'Lingerie & Sleepwear': 799,
  'Footwear': 1699,
  'Bags': 1999,
  'Watches': 3499,
  'Jewellery': 2499,
  'Beauty & Personal Care': 699,

  // Men's Categories
  'Topwear': 1199,
  'Bottomwear': 1399,
  'Sports & Active Wear': 1599,
  'Accessories': 899,
  'Innerwear & Sleepwear': 699,
  'Mens Ethnic Wear': 1799, // Renamed to avoid duplicate

  // Generic categories (fallback)
  'Shirts': 1199,
  'T-Shirts': 799,
  'Casual Shirts': 1299,
  'Formal Shirts': 1599,
  'Polo T-Shirts': 899,
  'Henley T-Shirts': 799,
  'Tank Tops': 599,
  'Sweatshirts': 1299,
  'Hoodies': 1499,
  'Jackets': 2499,
  'Blazers': 3499,
  'Kurtas': 1399,
  'Nehru Jackets': 1999,
  'Dhoti Pants': 1199,
  'Patiala': 999,
  'Salwar': 899,
  'Dupatta': 699,
  'Lehenga': 4999,
  'Saree': 2999,
  'Blouse': 899,
  'Waistcoat': 1499,
  'Shrug': 999,
  'Poncho': 1299,
  'Cardigan': 1599,
  'Jumpsuit': 1899,
  'Romper': 1199,
  'Capris': 999,
  'Shorts': 799,
  'Track Pants': 899,
  'Pyjamas': 699,
  'Lounge Pants': 799,
  'Stockings': 299,
  'Socks': 199,
  'Tights': 399,
  'Leggings': 699,
  'Jeggings': 899,
  'Churidar': 799,
  'Palazzo Pants': 999,
  'Flared Jeans': 1699,
  'Skinny Jeans': 1499,
  'Straight Jeans': 1399,
  'Bootcut Jeans': 1599,
  'Ripped Jeans': 1799,
  'High Rise Jeans': 1699,
  'Low Rise Jeans': 1399,
  'Mom Jeans': 1599,
  'Boyfriend Jeans': 1699,
  'Wide Leg Jeans': 1799,
  'Cropped Jeans': 1499,
  'Ankle Length Jeans': 1399,
  'Chinos': 1299,
  'Formal Trousers': 1499,
  'Casual Trousers': 1199,
  'Cargo Pants': 1399,
  'Dress Pants': 1699,
  'Pleated Trousers': 1599,
  'Flat Front Trousers': 1399,
  'Linen Pants': 1299,
  'Cotton Pants': 999,
  'Denim Jacket': 2199,
  'Leather Jacket': 4999,
  'Bomber Jacket': 2499,
  'Windbreaker': 1899,
  'Raincoat': 1699,
  'Puffer Jacket': 2799,
  'Trench Coat': 3999,
  'Overcoat': 4499,
  'Peacoat': 3499,
  'Hoodie Jacket': 1799,
  'Track Jacket': 1499,
  'Varsity Jacket': 2299,
  'Denim Shirt': 1399,
  'Flannel Shirt': 1299,
  'Oxford Shirt': 1599,
  'Hawaiian Shirt': 1199,
  'Band Collar Shirt': 1399,
  'Grandad Shirt': 1299,
  'Linen Shirt': 1499,
  'Check Shirt': 1199,
  'Striped Shirt': 1099,
  'Solid Shirt': 999,
  'Printed Shirt': 1199,
  'Graphic T-Shirt': 899,
  'Plain T-Shirt': 599,
  'V-Neck T-Shirt': 699,
  'Round Neck T-Shirt': 599,
  'Scoop Neck T-Shirt': 699,
  'Crop Top': 799,
  'Off Shoulder Top': 999,
  'Cold Shoulder Top': 899,
  'Sleeveless Top': 699,
  'Full Sleeve Top': 899,
  '3/4 Sleeve Top': 799,
  'Short Sleeve Top': 699,
  'Tunic': 1199,
  'Kurti': 999,
  'Anarkali': 1899,
  'A-Line Kurti': 1099,
  'Straight Kurti': 999,
  'High Low Kurti': 1299,
  'Asymmetric Kurti': 1199,
  'Flared Kurti': 1099,
  'Layered Kurti': 1299,
}

// Article type to price mapping for dataset items
export const ARTICLE_PRICES: Record<string, number> = {
  'Shirts': 1199,
  'Tshirts': 799,
  'Casual Shirts': 1299,
  'Formal Shirts': 1599,
  'Polo': 899,
  'Henley': 799,
  'Tank Tops': 599,
  'Sweatshirts': 1299,
  'Hoodies': 1499,
  'Jackets': 2499,
  'Blazers': 3499,
  'Kurtas': 1399,
  'Nehru Jackets': 1999,
  'Waistcoat': 1499,
  'Shrug': 999,
  'Cardigan': 1599,
  'Jumpsuit': 1899,
  'Shorts': 799,
  'Track Pants': 899,
  'Jeans': 1499,
  'Casual Trousers': 1199,
  'Formal Trousers': 1499,
  'Chinos': 1299,
  'Capris': 999,
  'Leggings': 699,
  'Jeggings': 899,
  'Tights': 399,
  'Stockings': 299,
  'Socks': 199,
  'Skirts': 999,
  'Dresses': 1299,
  'Tops': 899,
  'Tunics': 1199,
  'Kurtis': 999,
  'Saree': 2999,
  'Lehenga': 4999,
  'Dupatta': 699,
  'Salwar': 899,
  'Patiala': 999,
  'Dhoti': 1199,
  'Churidar': 799,
  'Palazzo': 999,
  'Bra': 699,
  'Briefs': 399,
  'Trunk': 499,
  'Boxers': 599,
  'Vests': 399,
  'Camisoles': 599,
  'Nightdress': 899,
  'Nightsuit': 1199,
  'Robe': 1499,
  'Loungewear Set': 1799,
  'Flip Flops': 599,
  'Sandals': 1299,
  'Floaters': 1199,
  'Slippers': 799,
  'Sneakers': 2499,
  'Casual Shoes': 2199,
  'Formal Shoes': 2999,
  'Sports Shoes': 2799,
  'Running Shoes': 3199,
  'Loafers': 2699,
  'Boots': 3499,
  'Heels': 1999,
  'Flats': 1499,
  'Wedges': 1799,
  'Pumps': 1699,
  'Stilettos': 2299,
  'Moccasins': 2199,
  'Espadrilles': 1599,
  'Clogs': 1799,
  'Mary Janes': 1699,
  'Oxfords': 2899,
  'Derbies': 2799,
  'Brogues': 3199,
  'Monk Straps': 3499,
  'Chelsea Boots': 3999,
  'Combat Boots': 2999,
  'Ankle Boots': 2699,
  'Knee High Boots': 3799,
  'Thigh High Boots': 4299,
  'Rain Boots': 1999,
  'Snow Boots': 2799,
  'Hiking Boots': 3499,
  'Work Boots': 2999,
}

/**
 * Get price for a product based on its category or article type
 * @param product Product object with category, subcategory, and articleType
 * @returns Price in rupees
 */
export function getProductPrice(product: {
  category?: string
  subcategory?: string
  articleType?: string
  gender?: string
}): number {
  // Try to find price by article type first (most specific)
  if (product.articleType && ARTICLE_PRICES[product.articleType]) {
    return ARTICLE_PRICES[product.articleType]
  }

  // Try category
  if (product.category && CATEGORY_PRICES[product.category]) {
    return CATEGORY_PRICES[product.category]
  }

  // Try subcategory
  if (product.subcategory && CATEGORY_PRICES[product.subcategory]) {
    return CATEGORY_PRICES[product.subcategory]
  }

  // Gender-based fallback prices
  if (product.gender === 'Women') {
    return 1299 // Default women's price
  } else if (product.gender === 'Men') {
    return 1199 // Default men's price
  }

  // Ultimate fallback
  return 999
}

/**
 * Format price with proper currency symbol
 * @param price Price in rupees
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`
}
