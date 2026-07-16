import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Heart, Minus, Plus, Star, X, Check, ShoppingCart, MessageSquare, ShieldCheck, Truck } from "lucide-react";
import { Product, Review } from "../types";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size?: string, color?: { name: string; hex: string }, quantity?: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddReview: (productId: string, review: Review) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  onAddReview,
}: ProductDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || undefined);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews">("description");

  // New review form states
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const incrementQty = () => setQuantity((prev) => prev + 1);
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewText.trim()) return;

    const newReview: Review = {
      id: `r-${Date.now()}`,
      author: reviewAuthor.trim(),
      rating: reviewRating,
      text: reviewText.trim(),
      date: new Date().toISOString().split("T")[0],
    };

    onAddReview(product.id, newReview);
    setReviewAuthor("");
    setReviewRating(5);
    setReviewText("");
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative z-10 flex h-full max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:flex-row"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-25 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-md backdrop-blur-xs transition-colors hover:bg-stone-100 hover:text-stone-950"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left Column: Image Gallery */}
          <div className="relative flex flex-col bg-stone-100 md:w-1/2 md:max-h-full">
            <div className="relative flex-1 flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-0">
              <img
                src={product.images[activeImageIndex]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-center max-h-[400px] md:max-h-full"
              />

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-800 shadow-sm transition-all hover:bg-white active:scale-90"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-800 shadow-sm transition-all hover:bg-white active:scale-90"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5 p-4 justify-center bg-white border-t border-stone-100 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={img}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-14 w-14 overflow-hidden rounded-lg bg-stone-50 border-2 transition-all shrink-0 ${
                      idx === activeImageIndex ? "border-stone-900" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Interactions */}
          <div className="flex flex-1 flex-col overflow-y-auto p-6 md:p-8">
            <div className="flex-1">
              {/* Category & Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                  {product.category}
                </span>
                {product.featured && (
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-[10px] font-bold text-stone-800">
                    Curated Collection
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <h1 className="mt-2 text-2xl font-semibold text-stone-900 leading-tight">
                {product.name}
              </h1>
              <p className="mt-2.5 text-xl font-bold text-stone-950">${product.price}</p>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-stone-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-stone-700">{product.rating}</span>
                <span className="text-stone-300">|</span>
                <span className="text-xs text-stone-500">{product.reviewCount} verified reviews</span>
              </div>

              {/* Dynamic Tabs */}
              <div className="mt-6 flex border-b border-stone-100">
                {(["description", "details", "reviews"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all mr-6 capitalize ${
                      activeTab === tab
                        ? "border-stone-900 text-stone-900"
                        : "border-transparent text-stone-400 hover:text-stone-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="py-5">
                {activeTab === "description" && (
                  <p className="text-sm leading-relaxed text-stone-600 font-normal">
                    {product.description}
                  </p>
                )}

                {activeTab === "details" && (
                  <ul className="space-y-2.5">
                    {product.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-stone-600">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-stone-900 shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    {/* Add Review Form */}
                    <form onSubmit={handleReviewSubmit} className="rounded-xl border border-stone-100 bg-stone-50/50 p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3">
                        Write a review
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Your Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Liam Parker"
                            value={reviewAuthor}
                            onChange={(e) => setReviewAuthor(e.target.value)}
                            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Rating</label>
                          <div className="flex gap-1.5 py-1.5">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setReviewRating(num)}
                                className="transition-transform active:scale-90"
                              >
                                <Star
                                  className={`h-4 w-4 ${
                                    num <= reviewRating ? "fill-amber-400 text-amber-400" : "text-stone-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Review Comments</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="What did you think of the fit, fabric, and style?"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-none resize-none"
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        {reviewSuccess ? (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5" /> Review added successfully!
                          </span>
                        ) : (
                          <div />
                        )}
                        <button
                          type="submit"
                          className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 transition-all active:scale-95"
                        >
                          Submit Review
                        </button>
                      </div>
                    </form>

                    {/* Review List */}
                    <div className="max-h-[250px] overflow-y-auto space-y-4 pr-1">
                      {product.reviews && product.reviews.length > 0 ? (
                        product.reviews.map((rev) => (
                          <div key={rev.id} className="border-b border-stone-100 pb-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-stone-800">{rev.author}</span>
                              <span className="text-[10px] text-stone-400">{rev.date}</span>
                            </div>
                            <div className="flex gap-0.5 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="mt-1.5 text-xs text-stone-600 font-normal leading-relaxed">
                              {rev.text}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-stone-400 italic text-center py-4">
                          No reviews yet. Be the first to review this product!
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Color Swatch Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Color: <span className="text-stone-900 font-bold">{selectedColor?.name}</span>
                  </span>
                  <div className="mt-2.5 flex gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`group relative flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 p-0.5 transition-all ${
                          selectedColor?.name === color.name ? "ring-2 ring-stone-900 ring-offset-2 scale-105" : "hover:scale-105"
                        }`}
                      >
                        <span
                          className="h-full w-full rounded-full"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="absolute -top-8 scale-0 rounded-md bg-stone-900 px-2 py-1 text-[10px] font-medium text-white transition-transform group-hover:scale-100 whitespace-nowrap z-30">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizing Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                      Size: <span className="text-stone-900 font-bold">{selectedSize}</span>
                    </span>
                    <button className="text-[11px] font-semibold tracking-wide text-stone-400 underline hover:text-stone-600">
                      Sizing Guide
                    </button>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition-all ${
                          selectedSize === size
                            ? "border-stone-950 bg-stone-950 text-white font-bold"
                            : "border-stone-200 text-stone-700 hover:border-stone-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Actions Bar */}
            <div className="mt-8 border-t border-stone-100 pt-6">
              <div className="flex items-center gap-4">
                {/* Quantity Toggle */}
                <div className="flex items-center rounded-xl border border-stone-200 px-1 bg-stone-50">
                  <button
                    onClick={decrementQty}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-white active:scale-90"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-stone-800">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQty}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-white active:scale-90"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => onToggleWishlist(product)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition-colors hover:bg-stone-50 active:scale-95 shrink-0"
                >
                  <Heart
                    className={`h-4.5 w-4.5 transition-transform ${
                      isWishlisted ? "fill-red-500 text-red-500 scale-110" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-stone-950 py-3.5 text-xs font-bold text-white shadow-lg shadow-stone-950/10 transition-all hover:bg-stone-850 active:scale-98"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Shopping Bag
                </button>
              </div>

              {/* Small Badges */}
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-stone-50 pt-4 text-center text-[10px] text-stone-500 font-medium">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="h-4 w-4 text-stone-400" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-stone-400" />
                  <span>Secured Checkout</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <MessageSquare className="h-4 w-4 text-stone-400" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
