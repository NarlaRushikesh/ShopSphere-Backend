import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { clearCart, updateCartItemAPI, removeCartItemAPI } from "../store/cartSlice";
import api from "../services/api";

const CartItemImage = ({ productId, fallbackName }) => {
  const [imgUrl, setImgUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api.get(`/catalog/products/${productId}`).then(res => {
      if (isMounted && res.data && res.data.imageUrl) {
        setImgUrl(res.data.imageUrl);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [productId]);

  if (imgUrl) {
    return <img src={imgUrl} alt={fallbackName} className="w-full h-full object-cover" />;
  }
  return <ShoppingBag className="h-8 w-8 text-muted/60" />;
};

const Cart = () => {
  const { items, totalAmount, totalQuantity } = useSelector(
    (state) => state.cart,
  );
  const dispatch = useDispatch();

  const handleIncrement = (item) => {
    dispatch(updateCartItemAPI({ id: item.id, quantity: item.quantity + 1 }));
  };

  const handleDecrement = (item) => {
    if (item.quantity === 1) {
      dispatch(removeCartItemAPI(item.id));
    } else {
      dispatch(updateCartItemAPI({ id: item.id, quantity: item.quantity - 1 }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-muted" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Your cart is empty
        </h2>
        <p className="text-muted mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. Discover our
          latest products and find something you love!
        </p>
        <Link
          to="/products"
          className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
      <h1 className="text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-border text-sm font-semibold text-muted uppercase tracking-wider bg-secondary/50">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            <div className="divide-y divide-border">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
                >
                  <div className="col-span-1 sm:col-span-6 flex items-center gap-4">
                    <div className="w-20 h-20 bg-secondary rounded-lg flex-shrink-0 border border-border flex items-center justify-center overflow-hidden">
                      <CartItemImage productId={item.productId} fallbackName={item.name} />
                    </div>
                    <div>
                      <Link
                        to={`/products/${item.productId}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <div className="text-sm text-muted mt-1">
                        ₹{item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-3 flex justify-between sm:justify-center items-center">
                    <div className="sm:hidden text-sm font-medium text-muted">
                      Quantity
                    </div>
                    <div className="flex items-center border border-border rounded-lg bg-secondary/30">
                      <button
                        onClick={() => handleDecrement(item)}
                        className="p-2 hover:text-primary transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrement(item)}
                        className="p-2 hover:text-primary transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-3 flex justify-between sm:justify-end items-center">
                    <div className="sm:hidden text-sm font-medium text-muted">
                      Total
                    </div>
                    <div className="font-bold text-foreground">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center px-2">
            <button
              onClick={() => dispatch(clearCart())}
              className="text-sm text-red-500 hover:text-red-700 flex items-center gap-2 transition-colors font-medium"
            >
              <Trash2 className="h-4 w-4" /> Clear Cart
            </button>
            <Link
              to="/products"
              className="text-sm text-primary hover:underline font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold mb-6 pb-4 border-b border-border">
            Order Summary
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-foreground/70">
              <span>Subtotal ({totalQuantity} items)</span>
              <span className="font-medium text-foreground">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-foreground/70">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between text-foreground/70">
              <span>Tax (Estimated)</span>
              <span className="font-medium text-foreground">
                ₹{(totalAmount * 0.08).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-4 mb-8 flex justify-between items-center">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-2xl text-primary">
              ₹{(totalAmount * 1.08).toFixed(2)}
            </span>
          </div>

          <Link
            to="/checkout"
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-1"
          >
            Proceed to Checkout <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;

