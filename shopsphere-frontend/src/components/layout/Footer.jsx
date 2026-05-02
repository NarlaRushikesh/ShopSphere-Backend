import { Link } from "react-router-dom";
import { Package, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-secondary pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-secondary mb-6">
              <Package className="h-8 w-8" />
              <span className="tracking-wide">ShopSphere</span>
            </Link>
            <p className="text-secondary/70 text-sm leading-relaxed mb-6">
              Premium e-commerce destination for curated lifestyle products. Elevate your everyday with our exclusive collections.
            </p>
          </div>

          {/* Links Cols */}
          <div>
            <h3 className="font-bold text-lg mb-6 tracking-wider uppercase text-white">Shop</h3>
            <ul className="space-y-4">
              <li><Link to="/products" className="text-secondary/70 hover:text-white transition-colors text-sm">All Products</Link></li>
              <li><Link to="/categories" className="text-secondary/70 hover:text-white transition-colors text-sm">Categories</Link></li>
              <li><Link to="/products?category=New" className="text-secondary/70 hover:text-white transition-colors text-sm">New Arrivals</Link></li>
              <li><Link to="/products?category=Featured" className="text-secondary/70 hover:text-white transition-colors text-sm">Featured</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 tracking-wider uppercase text-white">Support</h3>
            <ul className="space-y-4">
              <li><Link to="#" className="text-secondary/70 hover:text-white transition-colors text-sm">Contact Us</Link></li>
              <li><Link to="#" className="text-secondary/70 hover:text-white transition-colors text-sm">FAQs</Link></li>
              <li><Link to="#" className="text-secondary/70 hover:text-white transition-colors text-sm">Shipping & Returns</Link></li>
              <li><Link to="#" className="text-secondary/70 hover:text-white transition-colors text-sm">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 tracking-wider uppercase text-white">Stay Updated</h3>
            <p className="text-secondary/70 text-sm mb-4">Subscribe to our newsletter for exclusive offers and updates.</p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-white/10 border border-white/20 px-4 py-2 rounded-l-sm focus:outline-none focus:border-secondary w-full text-sm"
              />
              <button 
                type="submit" 
                className="bg-secondary text-primary px-4 py-2 rounded-r-sm hover:bg-card transition-colors"
                aria-label="Subscribe"
              >
                <Mail className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-secondary/50 text-xs">
            &copy; {new Date().getFullYear()} ShopSphere. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-secondary/50 hover:text-secondary text-xs transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-secondary/50 hover:text-secondary text-xs transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
