"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Heart,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Star,
  Check,
  X,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Mail,
  Truck,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  ExternalLink,
  Lock
} from "lucide-react";

import { Category, Product, CartItem, Order, Review, CategoryItem } from "../types";
import { PRODUCTS, DEFAULT_ORDERS } from "../data";
import ProductCard from "../components/ProductCard";
import ProductDetailModal from "../components/ProductDetailModal";
import CartDrawer from "../components/CartDrawer";
import CheckoutModal from "../components/CheckoutModal";
import AiStylist from "../components/AiStylist";


export default function Page() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>(DEFAULT_ORDERS);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // --- UI STATE ---
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");
  const [maxPrice, setMaxPrice] = useState<number>(350);
  const [showFilters, setShowFilters] = useState(false);

  // Modal / Drawer open states
  const [activeProductDetail, setActiveProductDetail] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeOrderTrack, setActiveOrderTrack] = useState<Order | null>(null);

  // Alerts
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  // Newsletter
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Promo Code stats from Cart Drawer
  const [appliedPromo, setAppliedPromo] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  // Load from localStorage only on client after mounting
  useEffect(() => {
    setIsMounted(true);

    const dbVersion = localStorage.getItem("minimal_db_version_v2");
    if (dbVersion !== "3") {
      localStorage.setItem("minimal_products", JSON.stringify(PRODUCTS));
      localStorage.setItem("minimal_orders", JSON.stringify(DEFAULT_ORDERS));
      localStorage.setItem("minimal_db_version_v2", "3");

      setProducts(PRODUCTS);
      setOrders(DEFAULT_ORDERS);
    } else {
      const savedProducts = localStorage.getItem("minimal_products");
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedOrders = localStorage.getItem("minimal_orders");
      setOrders(savedOrders ? JSON.parse(savedOrders) : DEFAULT_ORDERS);
    }

    const savedCart = localStorage.getItem("minimal_cart");
    if (savedCart) setCartItems(JSON.parse(savedCart));

    const savedWishlist = localStorage.getItem("minimal_wishlist");
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    const savedCategories = localStorage.getItem("minimal_categories");
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories([
        { id: "cat-1", name: "Men's Clothing", description: "" },
        { id: "cat-2", name: "Women's Clothing", description: "" },
        { id: "cat-3", name: "Home Decor", description: "" }
      ]);
    }
  }, []);

  // --- STORAGE SYNCS (only sync after mounted) ---
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("minimal_products", JSON.stringify(products));
    }
  }, [products, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("minimal_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("minimal_wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("minimal_orders", JSON.stringify(orders));
    }
  }, [orders, isMounted]);

  // Show automatic alert
  const triggerAlert = (text: string, type: "success" | "info" = "success") => {
    setAlertMessage({ text, type });
    setTimeout(() => {
      setAlertMessage(null);
    }, 4000);
  };

  // --- ACTIONS ---
  const handleAddToCart = (
    product: Product,
    size?: string,
    color?: { name: string; hex: string },
    qty: number = 1
  ) => {
    const cartItemId = `${product.id}-${size || "none"}-${color?.name || "none"}`;

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === cartItemId);
      if (existing) {
        triggerAlert(`Added ${qty} more ${product.name} to your bag.`);
        return prevItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + qty } : item
        );
      } else {
        triggerAlert(`Added ${product.name} to your bag.`);
        return [
          ...prevItems,
          {
            id: cartItemId,
            product,
            selectedSize: size,
            selectedColor: color,
            quantity: qty,
          },
        ];
      }
    });
  };

  const handleUpdateCartQuantity = (cartItemId: string, change: number) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + change;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
    triggerAlert("Item removed from your bag.", "info");
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const isPresent = prev.includes(product.id);
      if (isPresent) {
        triggerAlert("Removed from your wishlist.", "info");
        return prev.filter((id) => id !== product.id);
      } else {
        triggerAlert("Added to your wishlist.");
        return [...prev, product.id];
      }
    });
  };

  const handleViewDetails = (product: Product) => {
    setActiveProductDetail(product);
    // Add to recently viewed without duplication
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 5);
    });
  };

  // Add review to products list
  const handleAddReview = (productId: string, newReview: Review) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === productId) {
          const currentReviews = p.reviews || [];
          const updatedReviews = [newReview, ...currentReviews];
          const newRating = parseFloat(
            ((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length)).toFixed(1)
          );
          return {
            ...p,
            reviews: updatedReviews,
            rating: newRating,
            reviewCount: updatedReviews.length,
          };
        }
        return p;
      })
    );
    // Update active modal details too if it's open
    if (activeProductDetail && activeProductDetail.id === productId) {
      setActiveProductDetail((prev) => {
        if (!prev) return null;
        const currentReviews = prev.reviews || [];
        const updatedReviews = [newReview, ...currentReviews];
        const newRating = parseFloat(
          ((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length)).toFixed(1)
        );
        return {
          ...prev,
          reviews: updatedReviews,
          rating: newRating,
          reviewCount: updatedReviews.length,
        };
      });
    }
  };

  const handleProceedToCheckout = (promo: string, discount: number) => {
    setAppliedPromo(promo);
    setDiscountAmount(discount);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderPlaced = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]); // clear cart
    setAppliedPromo("");
    setDiscountAmount(0);
    // Auto-open order tracking for the exciting interactive touch!
    setTimeout(() => {
      setActiveOrderTrack(newOrder);
    }, 1500);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail("");
    triggerAlert("Thank you for joining our newsletter!");
  };

  // --- FILTERS & SORTING LOGIC ---
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price <= maxPrice;
    return matchesCategory && matchesSearch && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0; // "featured" or default
  });

  return (
    <div className="min-h-screen bg-stone-50/40 text-stone-900 font-sans selection:bg-stone-900 selection:text-white">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-6 left-1/2 z-60 flex items-center gap-2.5 rounded-2xl bg-stone-900 px-5 py-3 text-xs font-semibold text-stone-50 shadow-xl"
          >
            {alertMessage.type === "success" ? (
              <Check className="h-4 w-4 text-emerald-400 stroke-[3]" />
            ) : (
              <Sparkles className="h-4 w-4 text-amber-300" />
            )}
            <span>{alertMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner / Announcement */}
      <div className="bg-stone-900 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-stone-100">
        Enjoy complimentary shipping on all orders over $150 • Enter code <strong className="text-amber-200">MINIMAL20</strong> for 20% off
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-35 border-b border-stone-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-1.5">
            <span className="font-display text-xl font-bold tracking-tight uppercase text-stone-950">
              Atelier
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-stone-900" />
          </div>

          {/* Desktop Nav Categories */}
          <nav className="hidden md:flex gap-8 text-xs font-semibold uppercase tracking-widest text-stone-500">
            <button
              onClick={() => {
                setSelectedCategory("All");
                document.getElementById("showroom")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`relative py-1.5 transition-colors hover:text-stone-900 cursor-pointer ${
                selectedCategory === "All" ? "text-stone-955 font-bold" : ""
              }`}
            >
              All
              {selectedCategory === "All" && (
                <motion.span
                  layoutId="activeCategoryUnderline"
                  className="absolute bottom-0 left-0 h-0.5 w-full bg-stone-950"
                />
              )}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  // Scroll smoothly to shop section
                  document.getElementById("showroom")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`relative py-1.5 transition-colors hover:text-stone-900 cursor-pointer ${
                  selectedCategory === cat.name ? "text-stone-955 font-bold" : ""
                }`}
              >
                {cat.name}
                {selectedCategory === cat.name && (
                  <motion.span
                    layoutId="activeCategoryUnderline"
                    className="absolute bottom-0 left-0 h-0.5 w-full bg-stone-955"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-4">
            
            {/* Open Orders History button */}
            {orders.length > 0 && (
              <button
                onClick={() => setActiveOrderTrack(orders[0])}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors"
                title="Track Last Order"
              >
                <Truck className="h-4.5 w-4.5" />
                <span className="hidden sm:inline">Track</span>
              </button>
            )}

            {/* Wishlist Button */}
            <div className="relative">
              <button
                onClick={() => {
                  if (wishlist.length === 0) {
                    triggerAlert("Your wishlist is empty. Tap the heart on products to save them!", "info");
                  } else {
                    // Filter down to wishlisted
                    triggerAlert(`Showing your ${wishlist.length} saved pieces.`);
                    document.getElementById("showroom")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="rounded-full p-2 text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-all active:scale-95"
              >
                <Heart className="h-4.5 w-4.5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-[9px] font-bold text-white">
                    {wishlist.length}
                  </span>
                )}
              </button>
            </div>

            {/* Shopping Cart Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-full p-2 text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-all active:scale-95"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-[9px] font-bold text-white">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Admin Dashboard Access Link */}
            <Link
              href="/admin/dashboard"
              className="rounded-full p-2 text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-all active:scale-95 ml-0.5"
              title="Admin Dashboard"
            >
              <Lock className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="relative overflow-hidden rounded-3xl bg-stone-100 py-20 px-8 sm:px-16 lg:py-28 lg:px-24">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-stone-200/40" />
            <img
              src="https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1600&auto=format&fit=crop"
              alt="Atelier Capsule Hero"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center opacity-25 mix-blend-multiply"
            />
          </div>

          <div className="relative z-10 max-w-lg space-y-6">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block text-[10px] font-bold uppercase tracking-widest text-stone-500"
            >
              Chic Capsule Essentials
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-stone-955 leading-[1.1]"
            >
              Curated items <br />
              for modern life.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm"
            >
              A selection of high-grade men's and women's clothing paired with sculptural stoneware designed to breathe simplicity into your wardrobe and home.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-3.5 pt-2"
            >
              <button
                onClick={() => document.getElementById("showroom")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-xl bg-stone-950 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-stone-950/10 transition-all hover:bg-stone-850 active:scale-95 flex items-center gap-2"
              >
                Browse Showroom <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  triggerAlert("Promo Code MINIMAL20 copied. Apply it in your shopping bag!", "info");
                }}
                className="rounded-xl border border-stone-300 bg-white/70 px-5 py-3.5 text-xs font-bold text-stone-800 backdrop-blur-xs transition-all hover:bg-white active:scale-95"
              >
                Get 20% Off Code
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MAIN SHOWROOM RETAIL GRID SECTION */}
      <main id="showroom" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20">
        
        {/* Category Header & Filter Row */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-stone-100 pb-6 mb-8">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-stone-900">
              {selectedCategory === "All" ? "Curated Catalog" : selectedCategory}
            </h2>
            <p className="text-xs text-stone-400 mt-1">Showing {sortedProducts.length} premium essentials</p>
          </div>

          {/* Controls Trigger */}
          <div className="flex flex-wrap gap-3">
            {/* Search Bar */}
            <div className="relative max-w-xs">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-4 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
              />
              <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-stone-400" />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-3 text-stone-400 hover:text-stone-700">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                showFilters ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none rounded-xl border border-stone-200 bg-white pl-4 pr-10 py-2.5 text-xs font-semibold text-stone-700 focus:border-stone-900 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Collection</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8 border border-stone-150 bg-white rounded-2xl p-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Sizing Filter / Info */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3">Filter by Category</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedCategory === "All" ? "bg-stone-900 text-white font-bold" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedCategory === cat.name ? "bg-stone-900 text-white font-bold" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter Slider */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">Max Price: ${maxPrice}</h4>
                    <button onClick={() => setMaxPrice(350)} className="text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-stone-600">
                      Reset
                    </button>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={350}
                    step={5}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-stone-900 bg-stone-100 h-1.5 rounded-full"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-2 font-medium">
                    <span>$40</span>
                    <span>$150</span>
                    <span>$250</span>
                    <span>$350+</span>
                  </div>
                </div>

                {/* Clear Filter Indicator */}
                <div className="flex items-end justify-end">
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setMaxPrice(350);
                      setSearchQuery("");
                      setSortBy("featured");
                    }}
                    className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1.5 border border-stone-200 rounded-xl px-4 py-2.5 hover:bg-stone-50 transition-all active:scale-95"
                  >
                    <RefreshCw className="h-3 w-3" /> Clear All Filters
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty Catalog State */}
        {sortedProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <SlidersHorizontal className="h-8 w-8 text-stone-300 mb-4" />
            <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wide">No products match your parameters</h3>
            <p className="text-xs text-stone-400 mt-1 max-w-[280px]">Try clearing search queries, adjusting price ranges, or switching category tags.</p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setMaxPrice(350);
                setSearchQuery("");
              }}
              className="mt-6 rounded-xl bg-stone-900 px-5 py-2 text-xs font-semibold text-white hover:bg-stone-850 transition-all active:scale-95"
            >
              Reset Parameters
            </button>
          </div>
        )}

        {/* Dynamic Products Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
        >
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={handleViewDetails}
              onAddToCart={handleAddToCart}
              isWishlisted={wishlist.includes(product.id)}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </motion.div>
      </main>

      {/* Courier Tracker */}
      <AnimatePresence>
        {activeOrderTrack && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveOrderTrack(null)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="relative z-10 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setActiveOrderTrack(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="flex items-center gap-2.5">
                <Truck className="h-5 w-5 text-stone-900" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  Courier Delivery Tracker
                </h3>
              </div>

              <div className="mt-4 border-b border-stone-100 pb-3 flex justify-between text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest block font-bold">Order Number</span>
                  <strong className="text-stone-800 font-semibold">{activeOrderTrack.id}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest block font-bold">Courier Carrier</span>
                  <strong className="text-stone-800 font-semibold">Standard Courier Insured</strong>
                </div>
              </div>

              <div className="mt-6 space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-stone-200">
                <div className="flex gap-4 items-start relative z-10">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-white shadow-sm ring-4 ring-stone-100 shrink-0">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-stone-900">Order Placed & Secured</p>
                    <p className="text-stone-500 mt-0.5">We received your payment on {activeOrderTrack.date}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start relative z-10">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-white ring-4 ring-stone-100 shrink-0 animate-pulse">
                    <Clock className="h-3.5 w-3.5 text-amber-200" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-stone-900">In Showroom Fulfillment</p>
                    <p className="text-stone-500 mt-0.5">Showroom experts are inspecting, wrapping, and packing your order securely.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start relative z-10">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-stone-400 ring-4 ring-stone-100 shrink-0">
                    <Truck className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-stone-400">Shipped with Carrier</p>
                    <p className="text-stone-400 mt-0.5">Awaiting courier pickup from the Atelier fulfillment center.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start relative z-10">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-stone-400 ring-4 ring-stone-100 shrink-0">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-stone-400">Delivered on Premise</p>
                    <p className="text-stone-400 mt-0.5">Will be signed and delivered safely at {activeOrderTrack.shippingAddress.address}, {activeOrderTrack.shippingAddress.city}.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveOrderTrack(null)}
                className="mt-6 w-full rounded-xl bg-stone-900 py-3 text-xs font-semibold text-white hover:bg-stone-850 transition-all active:scale-95"
              >
                Close Tracking Dashboard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEWSLETTER */}
      <section className="bg-stone-100/60 border-y border-stone-200/50 py-16 mt-16">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Atelier Chronicle</span>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
            Join the inner circle
          </h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            Receive early access to seasonal capsule collection releases, aesthetic design philosophies, and custom discount rewards.
          </p>

          <AnimatePresence mode="wait">
            {!newsletterSubscribed ? (
              <motion.form
                key="newsletterForm"
                onSubmit={handleNewsletterSubmit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-auto flex max-w-md gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-4 py-3 text-xs focus:border-stone-900 focus:outline-none"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-stone-950 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-stone-850 transition-all active:scale-95"
                >
                  Subscribe
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="newsletterSuccess"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto max-w-xs rounded-2xl bg-white border border-stone-200 p-4 flex items-center justify-center gap-2.5 text-emerald-600 font-semibold text-xs shadow-xs"
              >
                <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                <span>Subscription successful!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-stone-100 py-12 text-xs text-stone-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base font-bold tracking-tight uppercase text-stone-950">
                Atelier
              </span>
              <span className="h-1 w-1 rounded-full bg-stone-900" />
            </div>
            <p className="leading-relaxed text-stone-400 max-w-xs">
              A highly-crafted aesthetic marketplace dedicated to simplistic organic garments and sculptural architectural home goods.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-800 mb-3.5">Categories</h4>
            <ul className="space-y-2 font-medium">
              <li><button onClick={() => { setSelectedCategory("All"); }} className="hover:text-stone-900">Full Catalog</button></li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button onClick={() => { setSelectedCategory(cat.name); }} className="hover:text-stone-900">
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-800 mb-3.5">Customer Care</h4>
            <ul className="space-y-2 font-medium">
              <li><a href="#" className="hover:text-stone-900">Fulfillment & Shipping Policies</a></li>
              <li><a href="#" className="hover:text-stone-900">Hassle-Free Returns</a></li>
              <li><a href="#" className="hover:text-stone-900">Ethical Sourcing & Ecology</a></li>
              <li><a href="#" className="hover:text-stone-900">Showroom Locations</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-800">Follow the Atelier</h4>
            <div className="flex gap-3 text-stone-400">
              <a href="#" className="hover:text-stone-900 transition-colors"><Instagram className="h-4.5 w-4.5" /></a>
              <a href="#" className="hover:text-stone-900 transition-colors"><Facebook className="h-4.5 w-4.5" /></a>
              <a href="#" className="hover:text-stone-900 transition-colors"><Twitter className="h-4.5 w-4.5" /></a>
            </div>
            <p className="text-[10px] text-stone-400 pt-1">
              Fulfillment Partner: Atelier Logistics Inc.<br />
              New York, NY 10013
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-stone-100 mt-10 pt-6 flex flex-col sm:flex-row justify-between text-[10px] text-stone-400">
          <p>© 2026 Atelier Store. All Rights Reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* AI STYLIST */}
      <AiStylist
        cartItems={cartItems}
        onAddToCart={handleAddToCart}
        recentlyViewed={recentlyViewed}
      />

      {/* PRODUCT DETAIL MODAL */}
      {activeProductDetail && (
        <ProductDetailModal
          product={activeProductDetail}
          onClose={() => setActiveProductDetail(null)}
          onAddToCart={handleAddToCart}
          isWishlisted={wishlist.includes(activeProductDetail.id)}
          onToggleWishlist={handleToggleWishlist}
          onAddReview={handleAddReview}
        />
      )}

      {/* CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleProceedToCheckout}
      />

      {/* SECURE CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          discountAmount={discountAmount}
          promoCode={appliedPromo}
          onOrderPlaced={handleOrderPlaced}
        />
      )}

    </div>
  );
}
