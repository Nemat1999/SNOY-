"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, ArrowRight, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { CategoryItem } from "../../types";

interface CategoryModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; image: string }) => Promise<void>;
  initialData?: CategoryItem | null;
  triggerAlert?: (text: string, type?: "success" | "info") => void;
}

export default function CategoryModalForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  triggerAlert,
}: CategoryModalFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description);
        setImageUrl(initialData.image || "");
      } else {
        setName("");
        setDescription("");
        setImageUrl("");
      }
      setUploadStatus(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading picture to Cloudinary (folder: snoy/categories)...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "snoy/categories");

      const response = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      const resData = await response.json();

      if (response.ok && resData.data?.url) {
        setImageUrl(resData.data.url);
        setUploadStatus(`Uploaded successfully to Cloudinary folder: ${resData.data.folder || "snoy/categories"}`);
        if (triggerAlert) triggerAlert("Category picture uploaded to Cloudinary!", "success");
      } else {
        // Fallback to local preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result as string);
          setUploadStatus("Saved image locally (Cloudinary fallback)");
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setUploadStatus("Image preview ready");
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        image: imageUrl,
      });
      onClose();
    } catch (error) {
      console.error("Error submitting category:", error);
      alert("Failed to submit category.");
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
      <div className="relative w-screen max-w-md bg-white shadow-2xl flex flex-col h-full z-10 border-l border-stone-200">
        {/* Form Header */}
        <div className="px-6 py-5 border-b border-stone-150 flex items-center justify-between bg-stone-950 text-white">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider">
              {initialData ? "Modify Category Details" : "Create New Category"}
            </h3>
            <p className="text-[10px] text-stone-400 mt-0.5">Upload image to Cloudinary categories folder</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-850 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
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
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none font-medium transition-colors"
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
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none resize-none font-medium transition-colors"
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
                  <div className="relative h-36 w-full rounded-xl overflow-hidden bg-stone-900 border border-stone-200 group">
                    <img
                      src={imageUrl}
                      alt="Category preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl("");
                        setUploadStatus(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
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
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-stone-900 focus:outline-none font-mono transition-colors"
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
                  {initialData ? "Save Changes" : "Create Category"}{" "}
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
