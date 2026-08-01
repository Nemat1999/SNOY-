import React from "react";
import { X, Tag, Box, DollarSign, List, Layers, Palette } from "lucide-react";
import { Product, CategoryItem } from "../../types";

interface ProductViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: CategoryItem[];
}

export default function ProductViewModal({ isOpen, onClose, product, categories }: ProductViewModalProps) {
  if (!isOpen || !product) return null;

  const resolvedCategoryName = 
    (product as any).categoryName || 
    (product as any).categoryDetails?.name || 
    product.category || 
    categories.find(c => c.id === product.categoryId)?.name || 
    "-";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
      />
      
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-150 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="text-lg font-display font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <Box className="w-5 h-5 text-stone-500" />
              Product Overview
            </h3>
            <p className="text-xs text-stone-500 mt-1 font-mono">
              SKU: {product.sku || "N/A"} • ID: {product.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-900 p-2 rounded-full hover:bg-stone-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 font-medium text-xs uppercase tracking-widest">
                    No Image Available
                  </div>
                )}
              </div>
              
              {/* Additional Images Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1).map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                      <img src={img} alt={`${product.name} ${idx+1}`} className="w-full h-full object-cover opacity-75 hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Details */}
            <div className="space-y-6">
              
              {/* Basic Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.status === "draft" && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Draft</span>}
                  {product.status === "archived" && <span className="bg-stone-200 text-stone-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Archived</span>}
                  {product.status === "active" && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Active</span>}
                  {product.featured && <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Featured</span>}
                </div>
                
                <h2 className="text-2xl font-bold text-stone-900 mb-1">{product.name}</h2>
                <div className="flex items-center gap-2 text-sm text-stone-500 font-medium">
                  <Tag className="w-4 h-4" />
                  {resolvedCategoryName}
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="flex gap-6 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Price
                  </p>
                  <p className="text-2xl font-mono font-bold text-stone-900">
                    PKR {Number(product.price).toFixed(2)}
                  </p>
                  {product.compareAtPrice && (
                    <p className="text-xs font-mono text-stone-400 line-through">
                      PKR {Number(product.compareAtPrice).toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="w-px bg-stone-200"></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Stock
                  </p>
                  <p className="text-2xl font-mono font-bold text-stone-900">
                    {product.stock ?? "N/A"}
                  </p>
                  <p className="text-xs text-stone-500">units available</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-900 mb-2 border-b border-stone-100 pb-2">Description</h4>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {product.description || "No description provided."}
                </p>
              </div>

              {/* Variants & Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-900 mb-2 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5" /> Sizes
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes && product.sizes.length > 0 ? (
                      product.sizes.map(s => (
                        <span key={s} className="px-2 py-1 bg-stone-100 text-stone-700 text-xs font-mono font-semibold rounded-md border border-stone-200">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-stone-400 italic">One size fits all</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-900 mb-2 flex items-center gap-1">
                    <List className="w-3.5 h-3.5" /> Highlights
                  </h4>
                  {product.details && product.details.length > 0 ? (
                    <ul className="space-y-1 text-xs text-stone-600 list-disc list-inside">
                      {product.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-stone-400 italic">No details added.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-150 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-stone-800 transition-colors shadow-md"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
}
