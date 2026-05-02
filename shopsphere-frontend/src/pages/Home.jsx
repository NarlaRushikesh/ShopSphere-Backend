import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Shield, Truck, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../services/api";
import { getCategoryImage } from "../utils/categoryImages";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
      superTitle: "New Arrivals",
      title: "Dress for the Moment",
      subtitle: "Explore fresh styles designed for real life — from casual mornings to confident evenings.",
      cta: "Shop Collection"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2070&auto=format&fit=crop",
      superTitle: "Home & Living",
      title: "Make it Yours",
      subtitle: "Beautifully crafted home goods that turn any space into a place you love.",
      cta: "Explore Home"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop",
      superTitle: "Premium Picks",
      title: "Quality You Can Feel",
      subtitle: "Handpicked essentials built to last — because you deserve the best every day.",
      cta: "Shop Now"
    }
  ];


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/catalog/categories");
        const mappedCategories = response.data.slice(0, 6).map(cat => ({
          ...cat,
          imageUrl: getCategoryImage(cat.name, cat.imageUrl)
        }));
        
        setCategories(mappedCategories);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch categories", err);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <div className="flex flex-col gap-24 pb-24 bg-background">
      {/* Premium Hero Slider */}
      <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden group">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10"></div>
            <img
              src={slide.image}
              alt={slide.title}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[10s] ${
                index === currentSlide ? "scale-105" : "scale-100"
              }`}
            />
            <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-24 max-w-7xl mx-auto w-full">
              <div className="max-w-2xl">
                <span className="inline-block text-white font-semibold tracking-[0.2em] uppercase mb-6 text-xs md:text-sm animate-[fadeUp_0.8s_ease-out_0.2s_forwards] border-l-2 border-accent pl-4">
                  {slide.superTitle}
                </span>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight animate-[fadeUp_0.8s_ease-out_0.4s_forwards] leading-[1.1]">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl text-white/90 font-medium mb-10 max-w-xl leading-relaxed animate-[fadeUp_0.8s_ease-out_0.6s_forwards]">
                  {slide.subtitle}
                </p>
                <div className="animate-[fadeUp_0.8s_ease-out_0.8s_forwards]">
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-secondary text-primary text-sm font-bold tracking-widest uppercase hover:bg-card hover:text-primary transition-all duration-300 shadow-premium group"
                  >
                    {slide.cta}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/5 hover:bg-white/20 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/5 hover:bg-white/20 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slider Indicators */}
        <div className="absolute bottom-8 left-8 md:left-24 z-30 flex gap-4 items-center">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="group relative h-4 flex items-center"
              aria-label={`Go to slide ${index + 1}`}
            >
              <span className={`h-[2px] transition-all duration-500 ${
                index === currentSlide ? "w-12 bg-card" : "w-6 bg-white/40 group-hover:bg-white/70"
              }`}></span>
            </button>
          ))}
          <span className="text-white/80 font-medium text-sm ml-4 tracking-widest">
            0{currentSlide + 1} / 0{slides.length}
          </span>
        </div>
      </section>

      {/* Featured Categories (Modern Masonry or Sleek Grid) */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black text-primary mb-4 tracking-tight">Curated Collections</h2>
            <p className="text-primary/60 max-w-xl">Explore our meticulously selected categories designed for the modern lifestyle.</p>
          </div>
          <Link to="/categories" className="text-sm font-bold uppercase tracking-widest text-primary hover:text-accent transition-colors flex items-center gap-2 border-b border-primary hover:border-accent pb-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(n => <div key={n} className="h-[400px] bg-secondary animate-pulse rounded-none"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/products?category=${encodeURIComponent(cat.name)}`} 
                className="group relative overflow-hidden bg-secondary h-[400px] shadow-sm hover:shadow-premium transition-shadow duration-300"
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10 duration-500"></div>
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out" />
                ) : (
                  <div className="absolute inset-0 bg-secondary flex items-center justify-center text-primary/20 font-bold text-4xl">{cat.name.charAt(0)}</div>
                )}
                <div className="absolute bottom-8 left-0 right-0 z-20 flex flex-col items-center text-center">
                  <h3 className="text-2xl font-bold text-white tracking-widest uppercase mb-2 drop-shadow-lg">{cat.name}</h3>
                  <div className="overflow-hidden">
                    <span className="text-white text-xs font-bold uppercase tracking-widest opacity-0 transform translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 border-b border-white pb-0.5">
                      Explore <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Features Section - Classic & Aesthetic */}
      <section className="bg-card border-y border-border py-24 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
          <div className="flex flex-col items-center text-center px-4">
            <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-6">
              <Star className="h-6 w-6 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Uncompromising Quality</h3>
            <div className="w-12 h-px bg-border mb-4"></div>
            <p className="text-primary/70 leading-relaxed text-sm max-w-[280px]">
              Every item is meticulously crafted and rigorously tested to ensure it meets our exacting standards.
            </p>
          </div>
          <div className="flex flex-col items-center text-center px-4">
            <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-6">
              <Shield className="h-6 w-6 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Secure Transactions</h3>
            <div className="w-12 h-px bg-border mb-4"></div>
            <p className="text-primary/70 leading-relaxed text-sm max-w-[280px]">
              Experience total peace of mind with our industry-leading encryption and robust privacy protocols.
            </p>
          </div>
          <div className="flex flex-col items-center text-center px-4">
            <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-6">
              <Truck className="h-6 w-6 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Global Shipping</h3>
            <div className="w-12 h-px bg-border mb-4"></div>
            <p className="text-primary/70 leading-relaxed text-sm max-w-[280px]">
              Enjoy fast, reliable shipping worldwide. Free delivery on all premium tier orders.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

