"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Search, X, Check, ArrowRight } from "lucide-react";
import { Product, Category, CategoryItem } from "../../types";

interface ProductsTabProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: CategoryItem[];
  triggerAlert: (text: string, type?: "success" | "info") => void;
}

export default function ProductsTab({ products, setProducts, categories, triggerAlert }: ProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");

  // Form State for Add / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Category>("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sizes, setSizes] = useState("");
  const [details, setDetails] = useState("");

  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setName("");
    setPrice("");
    setCategory(categories[0]?.name || "Men's Clothing");
    setDescription("");
    setImageUrl("");
    setSizes("S, M, L");
    setDetails("100% Organic, Tailored Fit, Made in Italy");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setCategory(product.category);
    setDescription(product.description);
    setImageUrl(product.images[0] || "");
    setSizes(product.sizes ? product.sizes.join(", ") : "");
    setDetails(product.details.join(", "));
    setIsFormOpen(true);
  };

  const handleDelete = (productId: string) => {
    if (confirm("Are you sure you want to delete this product from the showroom?")) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      triggerAlert("Product deleted successfully.", "info");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !price.trim() || !description.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    const imagesArray = imageUrl.trim()
      ? [imageUrl.trim()]
      : ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop"];

    const sizesArray = sizes.trim()
      ? sizes.split(",").map((s) => s.trim()).filter((s) => s !== "")
      : [];

    const detailsArray = details.trim()
      ? details.split(",").map((d) => d.trim()).filter((d) => d !== "")
      : ["Premium quality garment", "Sculptural aesthetic structure"];

    if (editingProduct) {
      // Edit mode
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: name.trim(),
                price: priceNum,
                category,
                description: description.trim(),
                images: imagesArray,
                sizes: sizesArray.length > 0 ? sizesArray : undefined,
                details: detailsArray,
              }
            : p
        )
      );
      triggerAlert("Product updated successfully.");
    } else {
      // Add mode
      const newProduct: Product = {
        id: `p-${Date.now()}`,
        name: name.trim(),
        price: priceNum,
        category,
        description: description.trim(),
        rating: 5.0,
        reviewCount: 0,
        images: imagesArray,
        sizes: sizesArray.length > 0 ? sizesArray : undefined,
        colors:
          category === "Home Decor"
            ? [{ name: "Travertine", hex: "#d6ccc2" }]
            : [
                { name: "Off-White", hex: "#f5f5f4" },
                { name: "Charcoal", hex: "#292524" },
              ],
        details: detailsArray,
        featured: true,
        reviews: [],
      };
      setProducts((prev) => [newProduct, ...prev]);
      triggerAlert("Product added to showroom catalog.");
    }

    setIsFormOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 select-none">
      
      {/* Title & Actions Row */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-stone-950">
            Showroom Catalog
          </h1>
          <p className="text-xs text-stone-400 mt-1">Manage e-commerce products, prices, and sizes.</p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="rounded-xl bg-stone-950 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-stone-850 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-4 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
          />
          <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-stone-400" />
        </div>

        {/* Categories filters */}
        <div className="flex gap-2 items-center overflow-x-auto shrink-0 pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              selectedCategory === "All"
                ? "bg-stone-900 text-white font-bold"
                : "bg-white text-stone-500 border border-stone-200 hover:text-stone-850"
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat.name
                  ? "bg-stone-900 text-white font-bold"
                  : "bg-white text-stone-500 border border-stone-200 hover:text-stone-850"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] font-bold uppercase tracking-wider text-stone-400 bg-stone-50/50">
                <th className="py-3.5 px-4 w-20">Preview</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Sizes</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="h-12 w-12 rounded-lg overflow-hidden border border-stone-200 bg-stone-50 shrink-0">
                      <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="max-w-xs pr-4">
                      <p className="font-semibold text-stone-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-stone-400 truncate mt-0.5">{p.description}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-stone-500 font-medium">{p.category}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-stone-900">${p.price}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {p.sizes ? (
                        p.sizes.map((s) => (
                          <span key={s} className="bg-stone-100 text-stone-600 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase font-mono">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-stone-400 italic">One Size</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2.5">
                      <button
                        onClick={() => handleOpenEditForm(p)}
                        className="p-2 rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-all cursor-pointer active:scale-95"
                        title="Edit Details"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 rounded-lg border border-stone-200 hover:border-red-300 hover:bg-red-50 text-stone-600 hover:text-red-650 transition-all cursor-pointer active:scale-95"
                        title="Delete Product"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-450 font-medium">
                    No products matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Slider Form Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsFormOpen(false)}
            className="absolute inset-0 bg-stone-900/25 backdrop-blur-xs transition-opacity"
          />

          {/* Form Content */}
          <div className="relative w-screen max-w-md bg-white shadow-2xl flex flex-col h-full z-10 border-l border-stone-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-stone-150 flex items-center justify-between bg-stone-950 text-white">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  {editingProduct ? "Modify Product Details" : "Introduce New Product"}
                </h3>
                <p className="text-[10px] text-stone-400 mt-0.5">Define metadata tags and assets</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Raw Japanese Selvedge Denim"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
                />
              </div>

              {/* Price & Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Retail Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 180"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-950 focus:outline-none bg-white cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Catalog Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A detailed narrative highlighting materials, textures, and clean geometry..."
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none resize-none"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
                />
              </div>

              {/* Sizes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Available Sizes (Comma Separated)
                </label>
                <input
                  type="text"
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                  placeholder="e.g. S, M, L, XL"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
                />
              </div>

              {/* Custom Details list */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Material details (Comma Separated)
                </label>
                <textarea
                  rows={2}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="e.g. Dry clean only, 100% Cashmere, Hand loomed"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none resize-none"
                />
              </div>

              {/* Actions Footer */}
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
                  {editingProduct ? "Save Changes" : "Create Item"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
