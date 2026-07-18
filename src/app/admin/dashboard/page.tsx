"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Product, Order, CategoryItem, ExpenseItem, DiscountCoupon } from "../../../types";
import { PRODUCTS, DEFAULT_CATEGORIES, DEFAULT_EXPENSES, DEFAULT_ORDERS, DEFAULT_COUPONS } from "../../../data";

// Subcomponents
import Sidebar from "../../../components/dashboard/Sidebar";
import OverviewTab from "../../../components/dashboard/OverviewTab";
import ProductsTab from "../../../components/dashboard/ProductsTab";
import CategoriesTab from "../../../components/dashboard/CategoriesTab";
import OrdersTab from "../../../components/dashboard/OrdersTab";
import CustomersTab from "../../../components/dashboard/CustomersTab";
import FinanceTab from "../../../components/dashboard/FinanceTab";
import DiscountsTab from "../../../components/dashboard/DiscountsTab";
import ReviewsTab from "../../../components/dashboard/ReviewsTab";
import SettingsTab from "../../../components/dashboard/SettingsTab";

export type DashboardTab =
  | "overview"
  | "products"
  | "categories"
  | "orders"
  | "customers"
  | "finance"
  | "discounts"
  | "reviews"
  | "settings";



export default function DashboardPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // Core full-stack state synced with localStorage
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  // Authentication check and state initialization
  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("admin_token");
    if (token !== "atelier_secret_token_val") {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
    }

    const dbVersion = localStorage.getItem("minimal_db_version_v2");
    if (dbVersion !== "3") {
      localStorage.setItem("minimal_products", JSON.stringify(PRODUCTS));
      localStorage.setItem("minimal_orders", JSON.stringify(DEFAULT_ORDERS));
      localStorage.setItem("minimal_categories", JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem("minimal_expenses", JSON.stringify(DEFAULT_EXPENSES));
      localStorage.setItem("minimal_coupons", JSON.stringify(DEFAULT_COUPONS));
      localStorage.setItem("minimal_db_version_v2", "3");

      setProducts(PRODUCTS);
      setOrders(DEFAULT_ORDERS);
      setCategories(DEFAULT_CATEGORIES);
      setExpenses(DEFAULT_EXPENSES);
      setCoupons(DEFAULT_COUPONS);
    } else {
      // Initialize products
      const savedProducts = localStorage.getItem("minimal_products");
      setProducts(savedProducts ? JSON.parse(savedProducts) : PRODUCTS);

      // Initialize orders
      const savedOrders = localStorage.getItem("minimal_orders");
      setOrders(savedOrders ? JSON.parse(savedOrders) : DEFAULT_ORDERS);

      // Initialize categories
      const savedCategories = localStorage.getItem("minimal_categories");
      setCategories(savedCategories ? JSON.parse(savedCategories) : DEFAULT_CATEGORIES);

      // Initialize expenses
      const savedExpenses = localStorage.getItem("minimal_expenses");
      setExpenses(savedExpenses ? JSON.parse(savedExpenses) : DEFAULT_EXPENSES);

      // Initialize coupons
      const savedCoupons = localStorage.getItem("minimal_coupons");
      setCoupons(savedCoupons ? JSON.parse(savedCoupons) : DEFAULT_COUPONS);
    }
  }, [router]);

  // Sync state changes back to localStorage
  useEffect(() => {
    if (isMounted && isAuthenticated) {
      localStorage.setItem("minimal_products", JSON.stringify(products));
    }
  }, [products, isMounted, isAuthenticated]);

  useEffect(() => {
    if (isMounted && isAuthenticated) {
      localStorage.setItem("minimal_orders", JSON.stringify(orders));
    }
  }, [orders, isMounted, isAuthenticated]);

  useEffect(() => {
    if (isMounted && isAuthenticated) {
      localStorage.setItem("minimal_categories", JSON.stringify(categories));
    }
  }, [categories, isMounted, isAuthenticated]);

  useEffect(() => {
    if (isMounted && isAuthenticated) {
      localStorage.setItem("minimal_expenses", JSON.stringify(expenses));
    }
  }, [expenses, isMounted, isAuthenticated]);

  useEffect(() => {
    if (isMounted && isAuthenticated) {
      localStorage.setItem("minimal_coupons", JSON.stringify(coupons));
    }
  }, [coupons, isMounted, isAuthenticated]);

  const triggerAlert = (text: string, type: "success" | "info" = "success") => {
    setAlertMessage({ text, type });
    setTimeout(() => {
      setAlertMessage(null);
    }, 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  if (!isMounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3 select-none">
          <span className="h-6 w-6 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/50 text-stone-900 font-sans flex overflow-hidden">
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-6 left-1/2 z-60 flex items-center gap-2.5 rounded-2xl bg-stone-900 px-5 py-3 text-xs font-semibold text-stone-50 shadow-xl"
          >
            {alertMessage.type === "success" ? (
              <Check className="h-4 w-4 text-emerald-400 stroke-[3]" />
            ) : (
              <Sparkles className="h-4 w-4 text-amber-300" />
            )}
            <span>{alertMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main panel content scroll area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="max-w-6xl mx-auto h-full"
          >
            {activeTab === "overview" && (
              <OverviewTab
                products={products}
                orders={orders}
              />
            )}
            {activeTab === "products" && (
              <ProductsTab
                products={products}
                setProducts={setProducts}
                categories={categories}
                triggerAlert={triggerAlert}
              />
            )}
            {activeTab === "categories" && (
              <CategoriesTab
                categories={categories}
                setCategories={setCategories}
                products={products}
                triggerAlert={triggerAlert}
              />
            )}
            {activeTab === "orders" && (
              <OrdersTab
                orders={orders}
                setOrders={setOrders}
                triggerAlert={triggerAlert}
              />
            )}
            {activeTab === "customers" && (
              <CustomersTab
                orders={orders}
                setOrders={setOrders}
                triggerAlert={triggerAlert}
              />
            )}
            {activeTab === "finance" && (
              <FinanceTab
                expenses={expenses}
                setExpenses={setExpenses}
                orders={orders}
                triggerAlert={triggerAlert}
              />
            )}
            {activeTab === "discounts" && (
              <DiscountsTab
                coupons={coupons}
                setCoupons={setCoupons}
                triggerAlert={triggerAlert}
              />
            )}
            {activeTab === "reviews" && (
              <ReviewsTab
                products={products}
                setProducts={setProducts}
                triggerAlert={triggerAlert}
              />
            )}
            {activeTab === "settings" && (
              <SettingsTab
                triggerAlert={triggerAlert}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
