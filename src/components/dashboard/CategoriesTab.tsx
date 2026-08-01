"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Tag,
  ImageIcon,
  FolderCheck,
  Loader2,
} from "lucide-react";
import { CategoryItem, Product } from "../../types";
import CategoryModalForm from "./CategoryModalForm";
import CategoryProductsModal from "./CategoryProductsModal";
import SearchBar from "../SearchBar";
import Tooltip from "../ui/Tooltip";

interface CategoriesTabProps {
  categories: CategoryItem[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
  products: Product[];
  triggerAlert: (text: string, type?: "success" | "info") => void;
}

export default function CategoriesTab({
  categories,
  setCategories,
  products,
  triggerAlert,
}: CategoriesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);

  const [selectedCategoryView, setSelectedCategoryView] =
    useState<CategoryItem | null>(null);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);

  // Fetch from API on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/v1/categories"),
          fetch("/api/v1/products?limit=1000"),
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();

        if (catData.success && catData.categories) {
          setCategories(catData.categories);
        }
        if (prodData.success && prodData.products) {
          setLiveProducts(prodData.products);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [setCategories]);

  const handleOpenAddForm = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setIsFormOpen(true);
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    const hasProducts = liveProducts.some(
      (p) =>
        p.category?.toLowerCase() === categoryName.toLowerCase() ||
        (p as any).categoryName?.toLowerCase() === categoryName.toLowerCase() ||
        p.categoryId === categoryId,
    );

    if (hasProducts) {
      alert(
        `Cannot delete category "${categoryName}". There are active products in the showroom assigned to this category.`,
      );
      return;
    }

    if (
      confirm(`Are you sure you want to delete category "${categoryName}"?`)
    ) {
      try {
        const res = await fetch(`/api/v1/categories/${categoryId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setCategories((prev) => prev.filter((c) => c.id !== categoryId));
          triggerAlert("Category removed successfully.", "info");
        } else {
          const data = await res.json();
          alert(data.error || "Failed to delete category");
        }
      } catch (err) {
        console.error("Backend delete error:", err);
        alert("Network error. Could not delete category.");
      }
    }
  };

  const handleFormSubmit = async (data: {
    name: string;
    description: string;
    image: string;
  }) => {
    try {
      if (editingCategory) {
        const res = await fetch(`/api/v1/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || "Failed to update");

        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id ? { ...c, ...data } : c,
          ),
        );
        triggerAlert("Category profile updated successfully.");
      } else {
        const res = await fetch("/api/v1/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || "Failed to create");

        const createdCategory = resData.category || {
          id: `cat-${Date.now()}`,
          ...data,
        };
        setCategories((prev) => [createdCategory, ...prev]);
        triggerAlert("New category created successfully!");
      }
    } catch (err: any) {
      console.error("Submit Error:", err);
      alert(err.message || "Failed to save category.");
      throw err; // re-throw to keep form open if it fails
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-stone-950 flex items-center gap-2">
            Showroom Categories
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Configure dynamic category groupings. Pictures automatically route
            to Cloudinary folder{" "}
            <span className="font-mono text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded text-[10px]">
              snoy/categories
            </span>
            .
          </p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="rounded-xl bg-stone-950 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-stone-850 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search categories..."
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((c) => {
            const productCount = liveProducts.filter(
              (p) =>
                p.category?.toLowerCase() === c.name.toLowerCase() ||
                (p as any).categoryName?.toLowerCase() ===
                  c.name.toLowerCase() ||
                p.categoryId === c.id,
            ).length;

            return (
              <div
                key={c.id}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-lg transition-all group"
              >
                <div>
                  {/* Category Image Header */}
                  <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 text-stone-400">
                        <ImageIcon className="h-10 w-10 stroke-[1.5] mb-1 opacity-60" />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                          No Image Uploaded
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay & Badge */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent flex flex-col justify-between p-4">
                      <div className="flex justify-between items-start">
                        <span className="bg-stone-950/80 backdrop-blur-md text-stone-200 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider font-mono border border-white/10 flex items-center gap-1">
                          <FolderCheck className="h-3 w-3 text-emerald-400" />{" "}
                          Cloudinary
                        </span>
                        <span className="bg-white/90 backdrop-blur-md text-stone-900 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider font-mono shadow-xs">
                          {productCount}{" "}
                          {productCount === 1 ? "Product" : "Products"}
                        </span>
                      </div>

                      <h3 className="font-display text-base font-bold uppercase tracking-wider text-white drop-shadow-sm">
                        {c.name}
                      </h3>
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="p-5">
                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-3">
                      {c.description}
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-2 border-t border-stone-100">
                  <button
                    onClick={() => {
                      setSelectedCategoryView(c);
                      setIsProductsModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-700 hover:text-stone-950 transition-all cursor-pointer text-xs font-bold"
                  >
                    View Items
                  </button>
                  <div className="flex justify-end gap-2">
                    <Tooltip content="Edit Category">
                      <button
                        onClick={() => handleOpenEditForm(c)}
                        className="p-2 rounded-xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-700 hover:text-stone-950 transition-all cursor-pointer text-xs font-semibold flex items-center gap-1.5 active:scale-95"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                    </Tooltip>
                    <Tooltip content="Delete Category">
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-2 rounded-xl border border-stone-200 hover:border-red-300 hover:bg-red-50 text-stone-600 hover:text-red-650 transition-all cursor-pointer text-xs font-semibold flex items-center gap-1.5 active:scale-95"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-16 bg-white border border-stone-200 rounded-2xl flex flex-col items-center justify-center text-center text-stone-400">
              <Tag className="h-8 w-8 text-stone-200 mb-2" />
              <p className="text-xs font-semibold uppercase tracking-wider">
                No matching categories found
              </p>
            </div>
          )}
        </div>
      )}

      {/* Category Modal Form Component */}
      <CategoryModalForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingCategory}
        triggerAlert={triggerAlert}
      />

      <CategoryProductsModal
        isOpen={isProductsModalOpen}
        onClose={() => setIsProductsModalOpen(false)}
        category={selectedCategoryView}
        products={liveProducts}
      />
    </div>
  );
}
