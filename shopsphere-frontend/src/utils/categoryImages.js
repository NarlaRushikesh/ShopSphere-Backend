export const categoryImageMap = {
  "Beauty": "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=800&auto=format&fit=crop",
  "Fragrances": "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800&auto=format&fit=crop",
  "Furniture": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop",
  "Groceries": "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?q=80&w=800&auto=format&fit=crop",
  "Home Decoration": "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=800&auto=format&fit=crop",
  "Kitchen Accessories": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop",
  "Laptops": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
  "Mens Shirts": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop",
  "Mens Shoes": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
  "Mens Watches": "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=800&auto=format&fit=crop",
  "Mobile Accessories": "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop",
  "Motorcycle": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop",
  "Skin Care": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop",
  "Smartphones": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop",
  "Sports Accessories": "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop",
  "Sunglasses": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop",
  "Tablets": "https://images.unsplash.com/photo-1561154464-82e9adf32764?q=80&w=800&auto=format&fit=crop",
  "Tops": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop",
  "Vehicle": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop",
  "Womens Bags": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop",
  "Womens Dresses": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
  "Womens Jewellery": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop",
  "Womens Shoes": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop",
  "Womens Watches": "https://images.unsplash.com/photo-1587925358603-c2eea5305bbc?q=80&w=800&auto=format&fit=crop"
};

export const getCategoryImage = (categoryName, fallbackUrl) => {
  if (!categoryName) return fallbackUrl;
  
  // Try exact match first
  if (categoryImageMap[categoryName]) {
    return categoryImageMap[categoryName];
  }
  
  // Try case-insensitive match
  const searchKey = categoryName.toLowerCase();
  const matchedKey = Object.keys(categoryImageMap).find(
    k => k.toLowerCase() === searchKey
  );
  
  return matchedKey ? categoryImageMap[matchedKey] : fallbackUrl;
};
