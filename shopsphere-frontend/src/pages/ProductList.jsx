import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Search, PackageSearch, Filter, ChevronDown, Check } from "lucide-react";
import { fetchProducts } from "../store/productSlice";
import api from "../services/api";
import ProductCard from "../components/product/ProductCard";

const ProductList = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.products);

  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [sortOption, setSortOption] = useState("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    // Fetch a large limit to allow frontend filtering for categories
    dispatch(fetchProducts({ page: 0, size: 200 }));
    
    // Fetch categories for sidebar
    const fetchCategories = async () => {
      try {
        const res = await api.get("/catalog/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, [dispatch]);

  // Update selected category when URL params change
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-32">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Failed to load products</h2>
        <p className="text-muted">{error}</p>
      </div>
    );
  }

  // Filter products based on search and category
  let displayItems = [...products]; // Make a copy since Redux state is read-only
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    displayItems = displayItems.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }
  if (selectedCategory) {
    displayItems = displayItems.filter(
      (p) => p.categoryName && p.categoryName.toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  // Sort products
  if (sortOption === "price_asc") {
    displayItems.sort((a, b) => a.price - b.price);
  } else if (sortOption === "price_desc") {
    displayItems.sort((a, b) => b.price - a.price);
  } else if (sortOption === "name_asc") {
    displayItems.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // default newest, assuming higher ID is newer
    displayItems.sort((a, b) => b.id - a.id);
  }

  const sortLabels = {
    newest: "Newest Arrivals",
    price_asc: "Price: Low to High",
    price_desc: "Price: High to Low",
    name_asc: "Name: A to Z"
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8 items-start">
      
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 lg:w-72 shrink-0 md:sticky md:top-28">
        <div className="bg-card border border-border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-primary mb-6 uppercase tracking-widest border-b border-border pb-4">
            Filters
          </h2>

          {/* Search Box in Sidebar */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-3">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
              <input
                type="text"
                placeholder="Find a product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* Categories Filter */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-3">Categories</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`text-sm w-full text-left py-1.5 transition-colors flex items-center gap-2 ${
                    selectedCategory === "" ? "text-primary font-bold" : "text-primary/70 hover:text-primary"
                  }`}
                >
                  <div className={`w-4 h-4 border border-border flex items-center justify-center ${selectedCategory === "" ? "bg-primary border-primary" : "bg-card"}`}>
                    {selectedCategory === "" && <Check className="h-3 w-3 text-white" />}
                  </div>
                  All Categories
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`text-sm w-full text-left py-1.5 transition-colors flex items-center gap-2 ${
                      selectedCategory === cat.name ? "text-primary font-bold" : "text-primary/70 hover:text-primary"
                    }`}
                  >
                    <div className={`w-4 h-4 border border-border flex items-center justify-center ${selectedCategory === cat.name ? "bg-primary border-primary" : "bg-card"}`}>
                      {selectedCategory === cat.name && <Check className="h-3 w-3 text-white" />}
                    </div>
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <button 
            onClick={() => { setSelectedCategory(""); setSearchQuery(""); setSortOption("newest"); }}
            className="w-full py-2 bg-secondary text-primary font-bold text-xs uppercase tracking-widest hover:bg-border transition-colors border border-border"
          >
            Clear Filters
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 w-full">
        {/* Header & Sorting */}
        <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight mb-2">
              {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}` : "The Collection"}
            </h1>
            <p className="text-primary/60 font-medium text-sm">Showing {displayItems.length} products</p>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border hover:border-primary transition-all font-semibold text-sm text-primary shadow-sm min-w-[200px] justify-between"
            >
              <span>Sort: {sortLabels[sortOption]}</span>
              <ChevronDown className="h-4 w-4 text-primary/50" />
            </button>
            
            {isSortOpen && (
              <div className="absolute top-full right-0 mt-2 w-full bg-card border border-border shadow-premium z-30 flex flex-col py-2">
                {Object.entries(sortLabels).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => { setSortOption(val); setIsSortOpen(false); }}
                    className={`text-left px-5 py-2 text-sm hover:bg-secondary transition-colors ${sortOption === val ? "text-primary font-bold bg-secondary/50" : "text-primary/80"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {displayItems.length === 0 ? (
          <div className="text-center py-32 bg-card border border-border">
            <PackageSearch className="h-12 w-12 text-border mx-auto mb-4" strokeWidth={1} />
            <h3 className="text-xl font-bold text-primary mb-2">
              No products found
            </h3>
            <p className="text-primary/50 max-w-md mx-auto">
              We couldn't find any items matching your filters. Please try adjusting your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 animate-fade-up">
            {displayItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;

