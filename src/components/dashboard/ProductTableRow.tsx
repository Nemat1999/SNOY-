import React from "react";
import { Edit2, Trash2, Eye } from "lucide-react";
import { Product, CategoryItem } from "../../types";
import Tooltip from "../ui/Tooltip";

interface ProductTableRowProps {
  product: Product;
  categories: CategoryItem[];
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export default function ProductTableRow({ product: p, categories, onView, onEdit, onDelete }: ProductTableRowProps) {
  const pCatName = (p as any).categoryName || (p as any).categoryDetails?.name || p.category;
  const resolvedCategory = categories.find(c => c.id === p.categoryId || c.name === pCatName);

  return (
    <tr className="border-b border-stone-100 last:border-0 hover:bg-stone-50/40 transition-colors">
      <td className="py-3 px-4">
        <div className="h-12 w-12 rounded-lg overflow-hidden border border-stone-200 bg-stone-50 shrink-0">
          {p.images && p.images[0] ? (
            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[9px] uppercase font-bold text-stone-300">Img</div>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="max-w-xs pr-4">
          <p className="text-[9px] font-mono font-bold text-stone-400 mb-0.5 uppercase tracking-wider">{p.sku || "NO-SKU"}</p>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-stone-900 truncate">{p.name}</p>
            {p.status === "draft" && <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 rounded-sm font-bold uppercase tracking-wider">Draft</span>}
            {p.status === "archived" && <span className="bg-stone-200 text-stone-600 text-[9px] px-1.5 rounded-sm font-bold uppercase tracking-wider">Archived</span>}
            {p.featured && <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 rounded-sm font-bold uppercase tracking-wider">Featured</span>}
          </div>
          <p className="text-[10px] text-stone-400 truncate mt-0.5">{p.description}</p>
        </div>
      </td>
      <td className="py-3 px-4 text-stone-500 font-medium">{resolvedCategory?.name || p.category || "-"}</td>
      <td className="py-3 px-4 font-mono font-semibold text-stone-900">PKR {Number(p.price).toFixed(2)}</td>
      <td className="py-3 px-4">
        <div className="flex gap-1 flex-col">
          <div className="flex gap-1 flex-wrap">
            {p.sizes && p.sizes.length > 0 ? (
              p.sizes.map((s) => (
                <span key={s} className="bg-stone-100 text-stone-600 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase font-mono">
                  {s}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-stone-400 italic">One Size</span>
            )}
          </div>
          <div className="text-[9px] text-stone-400 font-mono mt-1">Stock: {p.stock ?? "N/A"}</div>
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex justify-end gap-2.5">
          <Tooltip content="View Details">
            <button
              onClick={() => onView(p)}
              className="p-2 rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-all cursor-pointer active:scale-95"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
          
          <Tooltip content="Edit Details">
            <button
              onClick={() => onEdit(p)}
              className="p-2 rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-all cursor-pointer active:scale-95"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
          
          <Tooltip content="Delete Product">
            <button
              onClick={() => onDelete(p.id)}
              className="p-2 rounded-lg border border-stone-200 hover:border-red-300 hover:bg-red-50 text-stone-600 hover:text-red-600 transition-all cursor-pointer active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
}
