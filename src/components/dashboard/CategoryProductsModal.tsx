"use client";

import React, { useEffect } from "react";
import { X, Package, ExternalLink } from "lucide-react";
import { CategoryItem, Product } from "../../types";

interface CategoryProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryItem | null;
  products: Product[];
}

export default function CategoryProductsModal({
  isOpen,
  onClose,
  category,
  products,
}: CategoryProductsModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen || !category) return null;

  const categoryProducts = products.filter(
    (p) =>
      p.category?.toLowerCase() === category.name.toLowerCase() ||
      (p as any).categoryName?.toLowerCase() === category.name.toLowerCase() ||
      p.categoryId === category.id
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal panel */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-8 duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-200/50 text-stone-700">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 uppercase tracking-wider">
                {category.name}
              </h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {categoryProducts.length} {categoryProducts.length === 1 ? "Product" : "Products"} found
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
          {categoryProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-10 w-10 text-stone-200 mb-3" />
              <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">No Products Yet</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                There are no active products assigned to the {category.name} category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="flex items-center gap-4 p-3 rounded-2xl border border-stone-100 hover:border-stone-300 hover:shadow-md transition-all bg-white group cursor-pointer"
                >
                  <div className="h-16 w-16 shrink-0 rounded-xl bg-stone-100 overflow-hidden">
                    {product.images?.[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-stone-200 text-stone-400 text-[10px] font-bold">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-stone-900 truncate pr-2">
                      {product.name}
                    </h4>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                      PKR {product.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="pr-2 text-stone-300 group-hover:text-stone-900 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-5 border-t border-stone-100 bg-stone-50/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-stone-900 text-xs font-bold text-white hover:bg-stone-850 transition-all active:scale-95 shadow-sm"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
}
