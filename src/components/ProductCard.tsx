import React, { useState } from "react";
import { motion } from "motion/react";
import { Eye, Heart, ShoppingBag, Star } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product, size?: string, color?: { name: string; hex: string }, qty?: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export default function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}: ProductCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Set default color if available
  const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : undefined;
  // Set default size if available
  const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, defaultSize, defaultColor);
  };

  return (
    <motion.div
      id={`product-card-${product.id}`}
      layout
      className="group relative flex flex-col justify-between bg-transparent"
      onMouseEnter={() => {
        setIsHovered(true);
        if (product.images.length > 1) {
          setActiveImageIndex(1);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveImageIndex(0);
      }}
    >
      {/* Image Container with Rounded Corners and Hover Animations */}
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-stone-100">
        <motion.img
          src={product.images[activeImageIndex]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out"
          style={{
            transform: isHovered ? "scale(1.06)" : "scale(1.0)",
          }}
        />

        {/* Wishlist Button (Aesthetic Accent) */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-xs transition-colors hover:bg-white text-stone-800"
        >
          <Heart
            className={`h-4 w-4 transition-transform duration-300 ${
              isWishlisted ? "fill-red-500 text-red-500 scale-110" : "text-stone-600 hover:scale-110"
            }`}
          />
        </button>

        {/* Quick Actions Overlay (Minimal slide up) */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 p-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 bg-gradient-to-t from-black/20 via-transparent to-transparent">
          <div className="flex w-full gap-2">
            <button
              id={`quick-add-${product.id}`}
              onClick={handleQuickAdd}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-stone-900 py-3 px-4 text-xs font-medium text-white shadow-lg transition-colors hover:bg-stone-800 active:scale-95"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Quick Add
            </button>
            <button
              id={`quick-view-${product.id}`}
              onClick={() => onViewDetails(product)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-stone-900 shadow-lg transition-colors hover:bg-stone-50 active:scale-95"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Category Label */}
        <div className="absolute top-4 left-4 z-10 rounded-md bg-stone-900/10 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-stone-800 uppercase backdrop-blur-xs">
          {product.category}
        </div>
      </div>

      {/* Product Information */}
      <div className="mt-4 flex flex-col gap-1.5 px-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            onClick={() => onViewDetails(product)}
            className="cursor-pointer text-sm font-medium text-stone-900 hover:underline line-clamp-1"
          >
            {product.name}
          </h3>
          <span className="text-sm font-semibold text-stone-950">
            ${product.price}
          </span>
        </div>

        {/* Color and size availability hint & ratings */}
        <div className="flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-medium text-stone-700">{product.rating}</span>
            <span className="text-stone-400">({product.reviewCount})</span>
          </div>

          <div className="flex gap-1">
            {product.colors &&
              product.colors.slice(0, 3).map((col) => (
                <span
                  key={col.name}
                  className="h-2 w-2 rounded-full border border-stone-200"
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              ))}
            {product.colors && product.colors.length > 3 && (
              <span className="text-[9px] font-medium text-stone-400">
                +{product.colors.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
