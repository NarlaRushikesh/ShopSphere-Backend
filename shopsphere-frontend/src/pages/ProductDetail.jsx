import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ShoppingCart,
  ArrowLeft,
  Star,
  Shield,
  RotateCcw,
  Check,
  ChevronRight,
  Truck
} from "lucide-react";
import { fetchProductById, clearSelectedProduct } from "../store/productSlice";
import { addToCartAPI } from "../store/cartSlice";
import { toast } from "react-toastify";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    selectedProduct: product,
    loading,
    error,
  } = useSelector((state) => state.products);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(Number(id)));
    }
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(
        addToCartAPI({
          productId: product.id,
          quantity: quantity,
        }),
      );
      toast.success(`Added ${quantity} ${product.name} to bag`);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="animate-pulse p-8 max-w-7xl mx-auto mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="aspect-[4/5] bg-secondary rounded-none"></div>
          <div className="space-y-8 pt-8">
            <div className="h-4 bg-secondary w-24"></div>
            <div className="h-12 bg-secondary w-3/4"></div>
            <div className="h-8 bg-secondary w-32"></div>
            <div className="space-y-3 pt-8">
              <div className="h-4 bg-secondary w-full"></div>
              <div className="h-4 bg-secondary w-full"></div>
              <div className="h-4 bg-secondary w-2/3"></div>
            </div>
            <div className="h-14 bg-secondary w-full mt-12"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-32 bg-background">
        <h2 className="text-3xl font-black mb-4 text-primary">Product Not Found</h2>
        <p className="text-primary/60 mb-8 max-w-md mx-auto">
          {error || "The piece you're looking for doesn't exist or has been removed from our catalog."}
        </p>
        <button
          onClick={() => navigate("/products")}
          className="px-8 py-3 bg-primary text-white rounded-full font-bold uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors"
        >
          Back to Collection
        </button>
      </div>
    );
  }

  const mrp = product.price * 1.5;

  return (
    <div className="pb-24 bg-background min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-foreground/50">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-foreground transition-colors">Collection</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/products?category=${product.categoryName}`} className="hover:text-foreground transition-colors">{product.categoryName || 'Catalog'}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
          
          {/* Product Image - Left Side */}
          <div className="lg:sticky lg:top-32 h-fit">
            <div className="aspect-[4/5] bg-secondary relative overflow-hidden group border border-border">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-foreground/20 font-medium">No Image Available</div>
              )}
            </div>
          </div>

          {/* Product Info - Right Side */}
          <div className="flex flex-col">
            <div className="mb-8 border-b border-border pb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-foreground/60 uppercase tracking-[0.2em]">
                  {product.brand || "Premium"}
                </span>
                {product.stock > 0 ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2.5 py-1 rounded-sm">
                    <Check className="h-3 w-3 stroke-[3]" /> In Stock
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-sm">
                    Sold Out
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-6 tracking-tight leading-[1.1]">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-foreground">
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="text-lg text-foreground/40 line-through decoration-1">
                  ₹{mrp.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-foreground/50 mt-2 font-medium">Taxes and duties included.</p>
            </div>

            <p className="text-foreground/80 leading-relaxed mb-10 text-lg">
              {product.description || "An exquisitely crafted piece designed to elevate your everyday experience."}
            </p>

            {/* Quantity */}
            <div className="mb-10 flex flex-col gap-3">
               <span className="text-xs font-bold text-foreground uppercase tracking-widest">Quantity</span>
               <div className="flex items-center border border-border w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-5 py-3 hover:bg-secondary text-foreground transition-colors disabled:opacity-30"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 100, quantity + 1))}
                  className="px-5 py-3 hover:bg-secondary text-foreground transition-colors disabled:opacity-30"
                  disabled={quantity >= (product.stock || 100)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 py-4 px-8 bg-card border border-primary text-primary font-bold tracking-widest uppercase text-sm hover:bg-secondary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
              >
                <ShoppingCart className="h-5 w-5" />
                {product.stock === 0 ? "Unavailable" : "Add to Bag"}
              </button>
              <button
                className="flex-1 py-4 px-8 bg-primary text-white font-bold tracking-widest uppercase text-sm hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5"
                disabled={product.stock === 0}
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>

            {/* Trust Icons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-8 border-t border-b border-border mb-12">
              <div className="flex flex-col items-center text-center gap-3">
                <Shield className="h-6 w-6 text-foreground stroke-[1.5]" />
                <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest">Secure<br/>Payments</span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <Star className="h-6 w-6 text-foreground stroke-[1.5]" />
                <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest">Premium<br/>Quality</span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <Truck className="h-6 w-6 text-foreground stroke-[1.5]" />
                <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest">Global<br/>Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <RotateCcw className="h-6 w-6 text-foreground stroke-[1.5]" />
                <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest">Free<br/>Returns</span>
              </div>
            </div>

            {/* Details Accordion style (Tabs replacement) */}
            <div className="border-b border-border pb-6 mb-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4 flex items-center justify-between cursor-pointer" onClick={() => setActiveTab('description')}>
                Product Details
                <ChevronRight className={`h-4 w-4 transition-transform ${activeTab === 'description' ? 'rotate-90' : ''}`} />
              </h3>
              {activeTab === 'description' && (
                <div className="text-sm text-foreground/70 leading-relaxed font-medium animate-fade-up">
                  {product.description || "Crafted with exceptional attention to detail, this piece represents the pinnacle of modern design. Perfect for those who appreciate understated luxury."}
                </div>
              )}
            </div>

            <div className="border-b border-border pb-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4 flex items-center justify-between cursor-pointer" onClick={() => setActiveTab('specifications')}>
                Specifications
                <ChevronRight className={`h-4 w-4 transition-transform ${activeTab === 'specifications' ? 'rotate-90' : ''}`} />
              </h3>
              {activeTab === 'specifications' && (
                <div className="text-sm text-foreground/70 grid grid-cols-2 gap-4 font-medium animate-fade-up">
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-foreground/40 mb-1">Brand</span>
                    {product.brand || "ShopSphere Exclusive"}
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-foreground/40 mb-1">Category</span>
                    {product.categoryName || "General"}
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-foreground/40 mb-1">Availability</span>
                    {product.stock} units
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-foreground/40 mb-1">SKU</span>
                    #{product.id.toString().padStart(6, '0')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

