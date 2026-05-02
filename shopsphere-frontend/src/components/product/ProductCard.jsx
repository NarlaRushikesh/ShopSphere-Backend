import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCartAPI } from "../../store/cartSlice";
import { toast } from "react-toastify";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigating to detail page if clicking the button inside Link
    dispatch(
      addToCartAPI({
        productId: product.id,
        quantity: 1,
      }),
    );
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col bg-card rounded-none shadow-sm hover:shadow-premium transition-all duration-500 overflow-hidden relative border border-transparent hover:border-border"
    >
      <div className="aspect-[4/5] bg-secondary relative overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/20 font-medium">
            No Image
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.stock < 5 && product.stock > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 tracking-wider uppercase shadow-sm">
              Low Stock
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-primary text-secondary text-[10px] font-bold px-2 py-1 tracking-wider uppercase shadow-sm">
              Sold Out
            </span>
          )}
        </div>

        {/* Hover Add To Cart Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full py-3 bg-white/95 backdrop-blur-md text-primary font-bold text-sm tracking-wider uppercase hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 border border-border/50"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" /> 
            {product.stock === 0 ? "Out of Stock" : "Quick Add"}
          </button>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1 bg-card">
        <div className="flex justify-between items-start gap-4 mb-1">
          <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <span className="font-bold text-primary text-sm whitespace-nowrap">
            ₹{product.price.toFixed(2)}
          </span>
        </div>
        <div className="text-[11px] text-foreground/50 font-medium uppercase tracking-widest">
          {product.categoryName || "Premium"}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

