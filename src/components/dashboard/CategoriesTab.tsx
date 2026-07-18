"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Search, X, ArrowRight, Tag } from "lucide-react";
import { CategoryItem, Product } from "../../types";

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
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleOpenAddForm = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setIsFormOpen(true);
  };

  const handleDelete = (categoryId: string, categoryName: string) => {
    // Check if there are products belonging to this category
    const hasProducts = products.some(
      (p) => p.category.toLowerCase() === categoryName.toLowerCase()
    );

    if (hasProducts) {
      alert(
        `Cannot delete category "${categoryName}". There are active products in the showroom assigned to this category. Please reassign or delete the products first.`
      );
      return;
    }

    if (confirm(`Are you sure you want to delete category "${categoryName}"?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      triggerAlert("Category removed successfully.", "info");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    // Check for duplicate names (excluding the one we are editing)
    const isDuplicate = categories.some(
      (c) =>
        c.name.toLowerCase() === name.trim().toLowerCase() &&
        (!editingCategory || c.id !== editingCategory.id)
    );

    if (isDuplicate) {
      alert("A category with this name already exists.");
      return;
    }

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: name.trim(), description: description.trim() }
            : c
        )
      );
      triggerAlert("Category profile updated.");
    } else {
      const newCategory: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
      };
      setCategories((prev) => [...prev, newCategory]);
      triggerAlert("New category profile introduced.");
    }

    setIsFormOpen(false);
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-stone-950">
            Showroom Categories
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Configure dynamic grouping categories for showroom layout navigation.
          </p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="rounded-xl bg-stone-950 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-stone-850 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-4 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
        />
        <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-stone-400" />
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.map((c) => {
          // Count active items in this category
          const productCount = products.filter(
            (p) => p.category.toLowerCase() === c.name.toLowerCase()
          ).length;

          return (
            <div
              key={c.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all hover:scale-[1.01]"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-stone-100 text-stone-900 rounded-xl">
                    <Tag className="h-4.5 w-4.5" />
                  </div>
                  <span className="bg-stone-100 text-stone-600 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono">
                    {productCount} {productCount === 1 ? "Product" : "Products"}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-stone-900">
                    {c.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-3">
                    {c.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-stone-100 flex justify-end gap-2.5">
                <button
                  onClick={() => handleOpenEditForm(c)}
                  className="p-2 rounded-lg border border-stone-200 hover:border-stone-450 hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-all cursor-pointer active:scale-95 text-xs font-semibold flex items-center gap-1"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  className="p-2 rounded-lg border border-stone-200 hover:border-red-300 hover:bg-red-50 text-stone-600 hover:text-red-650 transition-all cursor-pointer active:scale-95 text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="col-span-full py-16 bg-white border border-stone-200 rounded-2xl flex flex-col items-center justify-center text-center text-stone-400">
            <Tag className="h-8 w-8 text-stone-200 mb-2" />
            <p className="text-xs font-semibold uppercase tracking-wider">No matching categories found</p>
          </div>
        )}
      </div>

      {/* Add / Edit Category Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            onClick={() => setIsFormOpen(false)}
            className="absolute inset-0 bg-stone-900/25 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-screen max-w-md bg-white shadow-2xl flex flex-col h-full z-10 border-l border-stone-200">
            <div className="px-6 py-5 border-b border-stone-150 flex items-center justify-between bg-stone-950 text-white">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  {editingCategory ? "Modify Category Details" : "Create New Category"}
                </h3>
                <p className="text-[10px] text-stone-400 mt-0.5">Define category tags and metadata</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Footwear"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A detailed overview describing the items within this capsule group..."
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 rounded-xl border border-stone-200 hover:border-stone-400 py-3 text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-stone-950 transition-all cursor-pointer text-center active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-stone-950 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-850 shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                >
                  {editingCategory ? "Save Changes" : "Create Category"}{" "}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
