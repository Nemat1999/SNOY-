"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Product, CategoryItem } from "../../types";
import ProductModalForm from "./ProductModalForm";
import ProductViewModal from "./ProductViewModal";
import ProductTableRow from "./ProductTableRow";
import SearchBar from "../SearchBar";
import DeleteConfirmModal from "../ui/DeleteConfirmModal";

interface ProductsTabProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: CategoryItem[];
  triggerAlert: (text: string, type?: "success" | "info") => void;
}

export default function ProductsTab({ categories, triggerAlert }: ProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);

  // Pagination & Server-side state
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const limit = 10;
        const offset = (currentPage - 1) * limit;
        const queryParams = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
        
        if (searchQuery) queryParams.append("search", searchQuery);
        
        // Ensure we handle category correctly based on the selected string 
        // It could be category name or ID, so the backend handles it gracefully
        if (selectedCategory !== "All") queryParams.append("category", selectedCategory);

        const res = await fetch(`/api/v1/products?${queryParams.toString()}`);
        const data = await res.json();
        
        if (data.success && data.products) {
          setLocalProducts(data.products);
          setTotalProducts(data.total);
          setTotalPages(Math.max(1, Math.ceil(data.total / limit)));
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, selectedCategory, refreshTrigger]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1); // Reset to page 1 on search
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1); // Reset to page 1 on category change
    setIsDropdownOpen(false);
  };

  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleOpenViewModal = (product: Product) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  };

  const handleDelete = (productId: string) => {
    const prod = localProducts.find((p) => p.id === productId);
    if (prod) {
      setProductToDelete(prod);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const res = await fetch(`/api/v1/products/${productToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setRefreshTrigger((prev) => prev + 1);
        triggerAlert("Product deleted successfully.", "info");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete product");
      }
    } catch (err) {
      console.error("Backend delete error:", err);
      alert("Network error. Could not delete product.");
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingProduct) {
        const res = await fetch(`/api/v1/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || "Failed to update product");
        
        triggerAlert("Product updated successfully.");
      } else {
        const res = await fetch("/api/v1/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || "Failed to create product");
        
        triggerAlert("Product added to showroom catalog.");
      }
      
      // Trigger a refetch of the paginated list to reflect changes
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error("Submit Error:", err);
      alert(err.message || "Failed to save product.");
      throw err; // re-throw to prevent modal from closing if error
    }
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Title & Actions Row */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-stone-950">
            Showroom Catalog
          </h1>
          <p className="text-xs text-stone-400 mt-1">Manage e-commerce products, prices, and inventory sizes.</p>
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
        <div className="flex-1 max-w-md">
          <SearchBar 
            value={searchQuery} 
            onChange={handleSearchChange} 
            placeholder="Search catalog..." 
          />
        </div>

        {/* Categories filters */}
        <div className="relative shrink-0 w-full sm:w-56">
          <button 
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
            className="w-full flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold focus:border-stone-900 focus:outline-none shadow-sm cursor-pointer text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <span className="truncate pr-2">
              {selectedCategory === "All" 
                ? "All Categories" 
                : categories.find(c => c.name === selectedCategory || c.id === selectedCategory)?.name || selectedCategory}
            </span>
            <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-full bg-white border border-stone-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="max-h-60 overflow-y-auto">
                <div 
                  onClick={() => handleCategoryChange("All")}
                  className={`px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${selectedCategory === "All" ? "bg-stone-100 text-stone-900" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"}`}
                >
                  All Categories
                </div>
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.name || selectedCategory === cat.id;
                  return (
                    <div 
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.name || cat.id)}
                      className={`px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${isSelected ? "bg-stone-100 text-stone-900" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"}`}
                    >
                      {cat.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        /* Catalog Table */
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-[10px] font-bold uppercase tracking-wider text-stone-400 bg-stone-50/50">
                    <th className="py-3.5 px-4 w-20">Preview</th>
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Sizes / Stock</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {localProducts.map((p) => (
                    <ProductTableRow 
                      key={p.id}
                      product={p}
                      categories={categories}
                      onView={handleOpenViewModal}
                      onEdit={handleOpenEditForm}
                      onDelete={handleDelete}
                    />
                  ))}

                  {localProducts.length === 0 && (
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

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2 pb-4">
              <p className="text-xs text-stone-500 font-medium hidden sm:block">
                Showing <span className="font-bold text-stone-900">{totalProducts === 0 ? 0 : (currentPage - 1) * 10 + 1}</span> to{" "}
                <span className="font-bold text-stone-900">{Math.min(currentPage * 10, totalProducts)}</span> of{" "}
                <span className="font-bold text-stone-900">{totalProducts}</span> entries
              </p>
              
              <div className="flex items-center gap-2 sm:ml-auto">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-xs font-semibold text-stone-700 min-w-24 text-center">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Slider Form Dialog */}
      <ProductModalForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
        categories={categories}
        triggerAlert={triggerAlert}
      />

      <ProductViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        product={viewingProduct}
        categories={categories}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Showroom Product"
        message="Are you sure you want to permanently remove this product from the showroom catalog? This action cannot be undone."
        itemName={productToDelete?.name}
      />
    </div>
  );
}
