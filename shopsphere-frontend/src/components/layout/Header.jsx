import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ShoppingCart, User as UserIcon, LogOut, Package, Search, Sun, Moon } from "lucide-react";
import { logout } from "../../store/authSlice";
import { fetchCart, clearCart } from "../../store/cartSlice";

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalQuantity } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(() => {
    // Persist preference in localStorage
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass transition-all duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-accent transition-colors"
        >
          <Package className="h-8 w-8" />
          <span className="tracking-wide">ShopSphere</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex gap-8 items-center flex-1 ml-12">
          <Link
            to="/products"
            className="text-foreground/70 hover:text-primary transition-colors font-semibold uppercase tracking-widest text-xs"
          >
            Shop
          </Link>
          <Link
            to="/categories"
            className="text-foreground/70 hover:text-primary transition-colors font-semibold uppercase tracking-widest text-xs"
          >
            Categories
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg ml-8 relative group">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm placeholder:text-muted text-foreground"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
          </form>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-4 ml-8">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground/70 hover:text-primary"
            aria-label="Toggle dark mode"
            id="dark-mode-toggle"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2 text-foreground/70 hover:text-primary transition-colors group"
          >
            <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
            {totalQuantity > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full border-2 border-background shadow-sm">
                {totalQuantity}
              </span>
            )}
          </Link>

          {/* User */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4 group relative z-50">
              <button className="flex items-center gap-2 p-2 text-foreground/70 hover:text-primary transition-colors">
                <UserIcon className="h-6 w-6" />
                <span className="hidden md:inline font-medium text-sm">
                  {user?.name || "Account"}
                </span>
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-[var(--shadow-premium)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 py-2 text-foreground overflow-hidden">
                <div className="px-4 py-3 bg-secondary mb-2">
                  <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted truncate mt-0.5">{user?.email}</p>
                </div>
                <Link
                  to="/orders"
                  className="block px-4 py-2 text-sm text-foreground/80 hover:bg-secondary hover:text-primary transition-colors"
                >
                  Order History
                </Link>
                {user?.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-sm text-foreground/80 hover:bg-secondary hover:text-primary transition-colors font-medium"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <div className="border-t border-border mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 items-center">
              <Link
                to="/login"
                className="text-sm font-semibold text-foreground/70 hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-all hover:-translate-y-0.5"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
