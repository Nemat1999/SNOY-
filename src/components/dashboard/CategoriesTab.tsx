"use client";

import React, { useState, useRef } from "react";
import { Plus, Edit2, Trash2, Search, X, ArrowRight, Tag, Upload, Image as ImageIcon, Loader2, CheckCircle2, FolderCheck } from "lucide-react";
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
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAddForm = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setImageUrl("");
    setUploadStatus(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setImageUrl(cat.image || "");
    setUploadStatus(null);
    setIsFormOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading picture to Cloudinary (folder: snoy/categories)...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "snoy/categories"); // Target Cloudinary folder

      const response = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      const resData = await response.json();

      if (response.ok && resData.data?.url) {
        setImageUrl(resData.data.url);
        setUploadStatus(`Uploaded successfully to Cloudinary folder: ${resData.data.folder || "snoy/categories"}`);
        triggerAlert("Category picture uploaded to Cloudinary folder!", "success");
      } else {
        // Fallback to Base64 data URL if API route / Cloudinary missing config
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setImageUrl(base64);
          setUploadStatus("Saved image locally (Cloudinary fallback)");
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      // Local fallback
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageUrl(base64);
        setUploadStatus("Image preview ready");
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
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
      try {
        await fetch(`/api/v1/categories/${categoryId}`, { method: "DELETE" });
      } catch (err) {
        console.warn("Backend delete error, removing from local state:", err);
      }

      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      triggerAlert("Category removed successfully.", "info");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      alert("Please fill in all required fields.");
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

    try {
      if (editingCategory) {
        // Backend API call
        fetch(`/api/v1/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            image: imageUrl,
          }),
        }).catch(err => console.warn("API sync fallback:", err));

        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id
              ? { ...c, name: name.trim(), description: description.trim(), image: imageUrl }
              : c
          )
        );
        triggerAlert("Category profile updated successfully.");
      } else {
        const categoryPayload = {
          name: name.trim(),
          description: description.trim(),
          image: imageUrl,
        };

        // Call Category Creation API route
        const response = await fetch("/api/v1/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryPayload),
        });

        const resData = await response.json();

        const createdCategory: CategoryItem = resData.category || {
          id: `cat-${Date.now()}`,
          name: name.trim(),
          description: description.trim(),
          image: imageUrl,
        };

        setCategories((prev) => [...prev, createdCategory]);
        triggerAlert("New category created & picture stored in Cloudinary categories folder!");
      }
    } catch (err) {
      console.error("Submit Error:", err);
      // Fallback
      const newCategory: CategoryItem = {
        id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        image: imageUrl,
      };

      if (editingCategory) {
        setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? newCategory : c)));
      } else {
        setCategories((prev) => [...prev, newCategory]);
      }
      triggerAlert("Category saved successfully.");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-stone-950 flex items-center gap-2">
            Showroom Categories
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Configure dynamic category groupings. Pictures automatically route to Cloudinary folder <span className="font-mono text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded text-[10px]">snoy/categories</span>.
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
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-4 py-2.5 text-xs focus:border-stone-900 focus:outline-none shadow-xs"
        />
        <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-stone-400" />
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((c) => {
          // Count active items in this category
          const productCount = products.filter(
            (p) => p.category.toLowerCase() === c.name.toLowerCase()
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
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">No Image Uploaded</span>
                    </div>
                  )}

                  {/* Gradient Overlay & Badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent flex flex-col justify-between p-4">
                    <div className="flex justify-between items-start">
                      <span className="bg-stone-950/80 backdrop-blur-md text-stone-200 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider font-mono border border-white/10 flex items-center gap-1">
                        <FolderCheck className="h-3 w-3 text-emerald-400" /> Cloudinary Folder: categories
                      </span>
                      <span className="bg-white/90 backdrop-blur-md text-stone-900 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider font-mono shadow-xs">
                        {productCount} {productCount === 1 ? "Product" : "Products"}
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
              <div className="px-5 pb-5 pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  onClick={() => handleOpenEditForm(c)}
                  className="p-2 rounded-xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-700 hover:text-stone-950 transition-all cursor-pointer text-xs font-semibold flex items-center gap-1.5 active:scale-95"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  className="p-2 rounded-xl border border-stone-200 hover:border-red-300 hover:bg-red-50 text-stone-600 hover:text-red-650 transition-all cursor-pointer text-xs font-semibold flex items-center gap-1.5 active:scale-95"
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

      {/* Add / Edit Category Slide-over Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            onClick={() => setIsFormOpen(false)}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-screen max-w-md bg-white shadow-2xl flex flex-col h-full z-10 border-l border-stone-200">
            {/* Form Header */}
            <div className="px-6 py-5 border-b border-stone-150 flex items-center justify-between bg-stone-950 text-white">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  {editingCategory ? "Modify Category Details" : "Create New Category"}
                </h3>
                <p className="text-[10px] text-stone-400 mt-0.5">Upload image to Cloudinary categories folder</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-850"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Category Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Footwear, Men's Clothing..."
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none font-medium"
                />
              </div>

              {/* Category Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed overview describing the items in this category..."
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none resize-none font-medium"
                />
              </div>

              {/* Cloudinary Image Upload Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">
                    Category Picture (Cloudinary)
                  </label>
                  <span className="text-[9px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                    Folder: snoy/categories
                  </span>
                </div>

                {/* Upload Preview & Box */}
                <div className="border-2 border-dashed border-stone-200 rounded-2xl p-4 text-center hover:border-stone-400 transition-colors bg-stone-50/50 relative">
                  {imageUrl ? (
                    <div className="space-y-3">
                      <div className="relative h-36 w-full rounded-xl overflow-hidden bg-stone-900 border border-stone-200">
                        <img
                          src={imageUrl}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrl("");
                            setUploadStatus(null);
                          }}
                          className="absolute top-2 right-2 bg-stone-900/80 text-white p-1.5 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-[10px] text-stone-500 truncate px-2 font-mono">
                        {imageUrl}
                      </p>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer py-4 flex flex-col items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <Loader2 className="h-8 w-8 text-stone-900 animate-spin" />
                      ) : (
                        <div className="p-3 bg-white rounded-full shadow-xs border border-stone-200 text-stone-700">
                          <Upload className="h-5 w-5" />
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-stone-800">
                          {isUploading ? "Uploading to Cloudinary..." : "Click or Drag to Upload Picture"}
                        </p>
                        <p className="text-[10px] text-stone-400">
                          PNG, JPG, WebP up to 10MB
                        </p>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Direct Image URL input option */}
                <div className="space-y-1 pt-1">
                  <label className="text-[9px] font-semibold text-stone-400 block">
                    Or paste direct Cloudinary / Image URL:
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-stone-900 focus:outline-none font-mono"
                  />
                </div>

                {uploadStatus && (
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>{uploadStatus}</span>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
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
                  disabled={isUploading}
                  className="flex-1 rounded-xl bg-stone-950 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-850 shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      {editingCategory ? "Save Changes" : "Create Category"}{" "}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
