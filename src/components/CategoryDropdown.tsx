"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Grid } from "lucide-react";
import { CategoryItem } from "../types";

interface CategoryDropdownProps {
  categories: CategoryItem[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function CategoryDropdown({
  categories,
  selectedCategory,
  setSelectedCategory,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setIsOpen(false);
    // Scroll smoothly to shop section
    document.getElementById("showroom")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 py-1.5 transition-colors hover:text-stone-900 cursor-pointer ${
          isOpen || selectedCategory !== "All" ? "text-stone-950 font-bold" : "text-stone-500"
        }`}
      >
        <Grid className="w-4 h-4 mb-0.5" />
        <span className="uppercase text-xs tracking-widest">
          {selectedCategory !== "All" ? selectedCategory : "Categories"}
        </span>
        <ChevronDown 
          className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
        {(isOpen || selectedCategory !== "All") && (
          <motion.span
            layoutId="activeCategoryUnderline"
            className="absolute -bottom-1 left-0 h-0.5 w-full bg-stone-950"
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 mt-6 w-64 rounded-2xl bg-white/95 backdrop-blur-xl border border-stone-200/60 shadow-2xl overflow-hidden z-50 origin-top-left"
          >
            <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
              <div className="p-2 flex flex-col gap-1">
                <button
                  onClick={() => handleSelect("All")}
                  className={`flex items-center w-full px-4 py-3 text-xs uppercase tracking-widest font-semibold rounded-xl transition-all ${
                    selectedCategory === "All" 
                      ? "bg-stone-900 text-white shadow-md" 
                      : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  All Products
                </button>
                
                {categories.length > 0 && <div className="h-px bg-stone-100 my-1 mx-2" />}

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelect(cat.name)}
                    className={`flex items-center w-full px-4 py-3 text-xs uppercase tracking-widest font-semibold rounded-xl transition-all ${
                      selectedCategory === cat.name 
                        ? "bg-stone-900 text-white shadow-md" 
                        : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
