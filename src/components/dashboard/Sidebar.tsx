"use client";

import React from "react";
import { LayoutDashboard, Package, Tag, ShoppingCart, Users, TrendingUp, Percent, MessageSquare, Settings, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { DashboardTab } from "../../app/dashboard/page";

interface SidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "customers", label: "Customers", icon: Users },
    { id: "finance", label: "Finance", icon: TrendingUp },
    { id: "discounts", label: "Discounts", icon: Percent },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="px-6 py-8 border-b border-stone-150 flex items-center gap-1.5 shrink-0">
        <span className="font-display text-lg font-bold tracking-tight uppercase text-stone-950">
          Atelier Admin
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-stone-900" />
      </div>

      {/* Main Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider relative transition-all group cursor-pointer ${
                isActive
                  ? "text-stone-950 bg-stone-50 font-bold"
                  : "text-stone-500 hover:text-stone-950 hover:bg-stone-50/50"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="activeSidebarIndicator"
                  className="absolute left-0 top-3 bottom-3 w-1 bg-stone-950 rounded-r-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`h-4.5 w-4.5 group-hover:scale-105 transition-transform ${
                isActive ? "text-stone-950" : "text-stone-400 group-hover:text-stone-700"
              }`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Admin User Details & Logout footer */}
      <div className="p-4 border-t border-stone-150 bg-stone-50/40 shrink-0">
        <div className="flex items-center gap-3 px-2 py-3 mb-2">
          <div className="h-9 w-9 rounded-full bg-stone-950 flex items-center justify-center text-white text-xs font-bold font-display uppercase">
            AD
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900 leading-tight">Admin User</h4>
            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Showroom Chief</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-stone-200 hover:border-stone-400 hover:bg-white text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-stone-950 transition-all cursor-pointer active:scale-98"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
