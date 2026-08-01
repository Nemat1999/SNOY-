import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search...", className = "" }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-4 py-2.5 text-xs focus:border-stone-900 focus:outline-none shadow-sm transition-shadow"
      />
      <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-stone-400" />
    </div>
  );
}
