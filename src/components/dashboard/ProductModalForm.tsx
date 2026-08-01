"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, ArrowRight, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { Product, CategoryItem } from "../../types";

interface ProductFormData {
  name: string;
  categoryId: string;
  categoryName: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  description: string;
  details: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
  featured: boolean;
  status: string;
  sku: string;
}

interface ProductModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: Product | null;
  categories: CategoryItem[];
  triggerAlert?: (text: string, type?: "success" | "info") => void;
}

export default function ProductModalForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
  triggerAlert,
}: ProductModalFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    categoryId: "",
    categoryName: "",
    price: "",
    compareAtPrice: "",
    stock: "100",
    description: "",
    details: [],
    sizes: [],
    colors: [],
    images: [],
    featured: false,
    status: "active",
    sku: "",
  });

  const [detailsInput, setDetailsInput] = useState("");
  const [sizesInput, setSizesInput] = useState("");
  const [colorNameInput, setColorNameInput] = useState("");
  const [colorHexInput, setColorHexInput] = useState("#000000");
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addColor = () => {
    if (!colorNameInput.trim()) return;
    const isDuplicate = (formData.colors || []).some(
      (c) => c.name.toLowerCase() === colorNameInput.trim().toLowerCase()
    );
    if (isDuplicate) {
      alert("Color name already exists");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      colors: [...(prev.colors || []), { name: colorNameInput.trim(), hex: colorHexInput }],
    }));
    setColorNameInput("");
  };

  const removeColor = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: (prev.colors || []).filter((c) => c.name !== name),
    }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          categoryId: initialData.categoryId || "",
          categoryName: initialData.category || "",
          price: initialData.price?.toString() || "",
          compareAtPrice: initialData.compareAtPrice?.toString() || "",
          stock: initialData.stock?.toString() || "100",
          description: initialData.description || "",
          details: initialData.details || [],
          sizes: initialData.sizes || [],
          colors: initialData.colors || [],
          images: initialData.images || [],
          featured: initialData.featured || false,
          status: initialData.status || "active",
          sku: initialData.sku || "",
        });
        setDetailsInput((initialData.details || []).join(", "));
        setSizesInput((initialData.sizes || []).join(", "));
      } else {
        setFormData({
          name: "",
          categoryId: categories[0]?.id || "",
          categoryName: categories[0]?.name || "",
          price: "",
          compareAtPrice: "",
          stock: "100",
          description: "",
          details: [],
          sizes: [],
          colors: [],
          images: [],
          featured: false,
          status: "active",
          sku: "",
        });
        setDetailsInput("");
        setSizesInput("");
      }
      setUploadStatus(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialData, categories]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const category = categories.find((c) => c.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      categoryId: selectedId,
      categoryName: category?.name || "",
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading picture to Cloudinary (folder: snoy/products)...");

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "snoy/products");

      const response = await fetch("/api/v1/upload", {
        method: "POST",
        body: data,
      });

      const resData = await response.json();

      if (response.ok && resData.data?.url) {
        setFormData((prev) => ({ ...prev, images: [...prev.images, resData.data.url] }));
        setUploadStatus(`Uploaded successfully to Cloudinary!`);
        if (triggerAlert) triggerAlert("Product image uploaded!", "success");
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({ ...prev, images: [...prev.images, reader.result as string] }));
          setUploadStatus("Saved image locally (Cloudinary fallback)");
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, images: [...prev.images, reader.result as string] }));
        setUploadStatus("Image preview ready");
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields (Name, Price, Description).");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const detailsArray = detailsInput.split(",").map(i => i.trim()).filter(Boolean);
      const sizesArray = sizesInput.split(",").map(i => i.trim()).filter(Boolean);
      
      await onSubmit({
        ...formData,
        details: detailsArray,
        sizes: sizesArray,
      });
      onClose();
    } catch (error) {
      console.error("Error submitting product:", error);
      alert("Failed to submit product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
      />
      <div className="relative w-screen max-w-lg bg-white shadow-2xl flex flex-col h-full z-10 border-l border-stone-200">
        {/* Form Header */}
        <div className="px-6 py-5 border-b border-stone-150 flex items-center justify-between bg-stone-950 text-white">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider">
              {initialData ? "Modify Product Details" : "Create New Product"}
            </h3>
            <p className="text-[10px] text-stone-400 mt-0.5">Upload images to Cloudinary products folder</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-850 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none font-medium"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">Category *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleCategoryChange}
                  required
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none font-medium bg-white"
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="Auto-generated if empty"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">Price *</label>
                <input
                  type="number"
                  name="price"
                  required
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">Compare At</label>
                <input
                  type="number"
                  name="compareAtPrice"
                  step="0.01"
                  value={formData.compareAtPrice}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none font-medium bg-white"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-center mt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(p => ({ ...p, featured: e.target.checked }))}
                    className="w-4 h-4 rounded text-stone-900 border-stone-300 focus:ring-stone-900"
                  />
                  <span className="text-xs font-semibold text-stone-800">Featured Product</span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">Description *</label>
              <textarea
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none resize-none font-medium"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">Details (Comma separated)</label>
              <input
                type="text"
                value={detailsInput}
                onChange={(e) => setDetailsInput(e.target.value)}
                placeholder="100% Cotton, Made in Italy, True to size"
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">Sizes (Comma separated)</label>
              <input
                type="text"
                value={sizesInput}
                onChange={(e) => setSizesInput(e.target.value)}
                placeholder="S, M, L, XL"
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none font-medium"
              />
            </div>

            {/* Colors Section */}
            <div className="space-y-2 border-t border-stone-100 pt-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">Product Colors</label>
              
              {/* Added Colors List */}
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.colors && formData.colors.length > 0 ? (
                  formData.colors.map((color) => (
                    <span
                      key={color.name}
                      className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-800"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-stone-300"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                      <button
                        type="button"
                        onClick={() => removeColor(color.name)}
                        className="text-stone-400 hover:text-stone-600 transition-colors shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-stone-400 italic">No colors added yet</span>
                )}
              </div>

              {/* Add Color Input Field */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={colorNameInput}
                  onChange={(e) => setColorNameInput(e.target.value)}
                  placeholder="e.g. Charcoal Black"
                  className="flex-1 rounded-xl border border-stone-200 px-3.5 py-2 text-xs focus:border-stone-900 focus:outline-none font-medium"
                />
                <div className="flex items-center gap-1 border border-stone-200 rounded-xl px-2.5 bg-stone-50 shrink-0">
                  <input
                    type="color"
                    value={colorHexInput}
                    onChange={(e) => setColorHexInput(e.target.value)}
                    className="w-5 h-5 border-0 cursor-pointer p-0 bg-transparent rounded"
                  />
                  <span className="text-[10px] font-mono font-semibold uppercase">{colorHexInput}</span>
                </div>
                <button
                  type="button"
                  onClick={addColor}
                  className="rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs px-3.5 py-2 transition-all cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Cloudinary Image Upload Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">
                Product Images
              </label>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-3 gap-3">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 group border border-stone-200">
                  <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 bg-stone-900/80 text-white p-1 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {/* Upload Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-stone-400 transition-colors bg-stone-50 cursor-pointer text-stone-500 hover:text-stone-700"
              >
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span className="text-[10px] font-bold">Add Image</span>
                  </>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-stone-100 flex gap-3 pb-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-stone-200 hover:border-stone-400 py-3 text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-stone-950 transition-all cursor-pointer text-center active:scale-98 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || isSubmitting}
              className="flex-1 rounded-xl bg-stone-950 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-850 shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  {initialData ? "Save Changes" : "Create Product"}{" "}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
