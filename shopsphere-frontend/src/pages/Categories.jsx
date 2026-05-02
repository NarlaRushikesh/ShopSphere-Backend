import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";
import api from "../services/api";
import { getCategoryImage } from "../utils/categoryImages";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/catalog/categories");
        const mappedCategories = response.data.map(cat => ({
          ...cat,
          imageUrl: getCategoryImage(cat.name, cat.imageUrl)
        }));

        const categoryOrder = [
          "Smartphones", "Laptops", "Electronic Gadgets", "Tablets", "Mobiles",
          "Mens Watches", "Womens Watches", "Accessories",
          "Mens Shoes", "Womens Shoes", "Footwear",
          "Mens Shirts", "Womens Dresses", "Tops", "Apparel",
          "Beauty", "Skin Care", "Fragrances",
          "Furniture", "Home Decoration", "Home Decor", "Kitchen Accessories",
          "Womens Bags", "Womens Jewellery", "Sunglasses",
          "Groceries", "Sports Accessories", "Vehicle", "Motorcycle"
        ];

        const sortedCategories = mappedCategories.sort((a, b) => {
          const indexA = categoryOrder.indexOf(a.name);
          const indexB = categoryOrder.indexOf(b.name);
          if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        setCategories(sortedCategories);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch categories");
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-card rounded-2xl border border-border shadow-sm max-w-2xl mx-auto">
        <div className="inline-block p-4 rounded-full bg-red-100 text-red-600 mb-4">
          <Layers className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Error Loading Categories</h2>
        <p className="text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16 animate-fade-up">
        <h1 className="text-5xl font-black text-foreground mb-6 tracking-tight">The Directory</h1>
        <div className="w-16 h-1 bg-foreground mx-auto mb-6"></div>
        <p className="text-foreground/60 max-w-2xl mx-auto text-lg">
          Browse our entire catalog. Hand-picked collections for the modern lifestyle.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-none border border-border shadow-sm">
          <Layers className="h-12 w-12 text-border mx-auto mb-4" strokeWidth={1} />
          <h3 className="text-xl font-medium text-foreground mb-1">No collections found</h3>
          <p className="text-foreground/50">Our catalog is currently being updated.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <Link 
              key={cat.id} 
              to={`/products?category=${encodeURIComponent(cat.name)}`} 
              className="group relative h-96 overflow-hidden bg-secondary shadow-sm hover:shadow-xl transition-all duration-500 animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10 duration-500"></div>
              {cat.imageUrl ? (
                <img 
                  src={cat.imageUrl} 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" 
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-secondary flex items-center justify-center">
                  <span className="text-6xl font-bold text-black/5">{cat.name.charAt(0)}</span>
                </div>
              )}
              <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl font-bold text-white tracking-wide mb-2 drop-shadow-md">
                    {cat.name}
                  </h3>
                  <div className="overflow-hidden">
                    <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center gap-2">
                      Explore Collection <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;

