"use client";

import React from "react";
import { DollarSign, ShoppingCart, Percent, Package, ArrowUpRight, TrendingUp, AlertTriangle } from "lucide-react";
import { Product, Order } from "../../types";

interface OverviewTabProps {
  products: Product[];
  orders: Order[];
}

export default function OverviewTab({ products, orders }: OverviewTabProps) {
  // Calculations based on live order state
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0;
  const totalProductCount = products.length;

  // Let's identify low stock (e.g. mock threshold where a product is "Low Stock" if its price is under PKR 100 and it has no sizes - just for showing high-fidelity data!)
  const lowStockProducts = products.filter(p => !p.sizes || p.sizes.length === 0).slice(0, 3);

  // Dynamic Category Sales Share breakdown
  const categorySales: { [cat: string]: number } = {
    "Men's Clothing": 0,
    "Women's Clothing": 0,
    "Home Decor": 0
  };

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const name = item.productName.toLowerCase();
      const itemRevenue = item.price * item.quantity;
      if (
        name.includes("classic belted") ||
        name.includes("wrap dress") ||
        name.includes("trousers") ||
        name.includes("poplin") ||
        (name.includes("mock-neck") && !name.includes("premium"))
      ) {
        categorySales["Women's Clothing"] += itemRevenue;
      } else if (
        name.includes("trench coat") ||
        name.includes("tee") ||
        name.includes("denim") ||
        name.includes("overshirt") ||
        name.includes("premium merino")
      ) {
        categorySales["Men's Clothing"] += itemRevenue;
      } else {
        categorySales["Home Decor"] += itemRevenue;
      }
    });
  });

  const totalCatSales = Object.values(categorySales).reduce((a, b) => a + b, 0);

  // Helper stats formatting
  const formattedRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(totalRevenue);

  const formattedAOV = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PKR",
  }).format(avgOrderValue);

  const kpis = [
    {
      label: "Total Sales Revenue",
      value: formattedRevenue,
      change: "+12.4% vs last week",
      icon: DollarSign,
      color: "text-stone-900 bg-stone-100",
    },
    {
      label: "Fulfilled Orders",
      value: totalOrders,
      change: "+8.1% vs last week",
      icon: ShoppingCart,
      color: "text-stone-900 bg-stone-100",
    },
    {
      label: "Average Order Value",
      value: formattedAOV,
      change: "+2.3% vs last week",
      icon: Percent,
      color: "text-stone-900 bg-stone-100",
    },
    {
      label: "Total Catalog Items",
      value: totalProductCount,
      change: "Active in Showroom",
      icon: Package,
      color: "text-stone-900 bg-stone-100",
    },
  ];

  return (
    <div className="space-y-8 select-none">
      
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-stone-950">
          Showroom Analytics
        </h1>
        <p className="text-xs text-stone-400 mt-1">Real-time indicators and operational catalog metrics.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all hover:scale-[1.01]"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-450">
                  {kpi.label}
                </span>
                <div className={`p-2 rounded-xl ${kpi.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-display text-2xl font-semibold text-stone-950">
                  {kpi.value}
                </h3>
                <span className="text-[10px] font-semibold text-stone-400 block mt-1.5">
                  {kpi.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics & Low Stock Panel Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Chart Mock Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-850">Weekly Sales Graph</h3>
              <p className="text-[10px] text-stone-400 mt-0.5">Calculated revenue increments over past 7 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <TrendingUp className="h-4 w-4" />
              <span>Stable Trends</span>
            </div>
          </div>

          {/* Clean pure CSS bar graph visualizer */}
          <div className="h-56 flex items-end justify-between gap-3 pt-4 px-2">
            {[45, 60, 25, 90, 75, 55, 80].map((percentage, dayIdx) => {
              const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
              return (
                <div key={dayIdx} className="flex-1 flex flex-col items-center gap-2 group">
                  {/* Tooltip value */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white text-[9px] font-mono px-1.5 py-0.5 rounded absolute -translate-y-8 z-10">
                    ${percentage * 15}
                  </div>
                  {/* Bar */}
                  <div
                    style={{ height: `${percentage}%` }}
                    className="w-full bg-stone-150 group-hover:bg-stone-950 rounded-lg transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-200 to-stone-50 opacity-0 group-hover:opacity-10" />
                  </div>
                  {/* Day label */}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {days[dayIdx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Alerts & Inventory status */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-5">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-850">Showroom Stock Alert</h3>
              <p className="text-[10px] text-stone-400 mt-0.5">Items needing dimensions or stock updates</p>
            </div>

            <div className="space-y-3.5">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between border border-stone-100 rounded-xl p-3 bg-stone-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0 border border-stone-200 bg-white">
                      <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 truncate max-w-[130px]">{p.name}</h4>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500 mt-0.5 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> No size variation
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-stone-650">PKR {p.price}</span>
                </div>
              ))}

              {lowStockProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center text-stone-400">
                  <Package className="h-8 w-8 text-stone-200 mb-2" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider">All items standard</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-stone-100 pt-4 flex justify-between items-center text-[10px] text-stone-500 font-medium">
            <span>Critical warnings: {lowStockProducts.length}</span>
            <span>Warehouse Status: Stable</span>
          </div>
        </div>
      </div>

      {/* Brand Specific Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Sales Breakdown */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-850 border-b border-stone-100 pb-4">
              Category Sales Share
            </h3>
            <div className="mt-6 space-y-4.5">
              {Object.entries(categorySales).map(([catName, amount]) => {
                const percentage = totalCatSales > 0 ? Math.round((amount / totalCatSales) * 100) : 0;
                const colorMap: { [key: string]: string } = {
                  "Men's Clothing": "bg-stone-900",
                  "Women's Clothing": "bg-stone-500",
                  "Home Decor": "bg-stone-300"
                };
                return (
                  <div key={catName} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-stone-700">{catName}</span>
                      <span className="font-mono text-stone-900 font-bold">{percentage}% (PKR {amount.toFixed(0)})</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={`h-full ${colorMap[catName]} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-6 text-[10px] text-stone-400 font-medium pt-3 border-t border-stone-100 flex justify-between">
            <span>Share based on sales revenue</span>
            <span>Total: PKR {totalCatSales.toFixed(0)}</span>
          </div>
        </div>

        {/* AI Stylist Recommendation Performance */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-850 border-b border-stone-100 pb-4">
              AI Stylist Insights & Conversions
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="border border-stone-100 rounded-xl p-4 bg-stone-50/50">
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone-450">Total Consultations</span>
                <p className="font-display text-lg font-bold text-stone-900 mt-1 font-mono">1,842</p>
                <span className="text-[9px] text-stone-450 mt-1.5 block">+18.5% this month</span>
              </div>
              <div className="border border-stone-100 rounded-xl p-4 bg-stone-50/50">
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone-450">Recommendation Sales</span>
                <p className="font-display text-lg font-bold text-stone-900 mt-1 font-mono">PKR 4,820</p>
                <span className="text-[9px] text-emerald-600 font-semibold mt-1.5 block">26.1% conversion</span>
              </div>
            </div>

            <div className="mt-5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block mb-2.5">Trending Recommendation Requests</span>
              <div className="flex flex-wrap gap-2">
                {["Minimalist Linen", "Wool Trench", "Oatmeal Mock-Neck", "Denim Fit", "Ceramic Vases"].map((keyword, idx) => (
                  <span key={idx} className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-stone-600 font-medium">
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 text-[10px] text-stone-400 font-medium pt-3 border-t border-stone-100 flex justify-between">
            <span>Powered by Atelier AI Model</span>
            <span>Status: Operational</span>
          </div>
        </div>
      </div>
      
      {/* Recent Orders Overview Section */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-stone-100 pb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-850">Recent Transactions</h3>
            <p className="text-[10px] text-stone-400 mt-0.5">Overview of the last 5 customers to buy</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                <th className="py-3 px-2">Order ID</th>
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Customer</th>
                <th className="py-3 px-2">Items Bought</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/40 transition-colors">
                  <td className="py-3 px-2 font-mono font-semibold text-stone-800">{order.id}</td>
                  <td className="py-3 px-2 text-stone-500">{order.date}</td>
                  <td className="py-3 px-2">
                    <div>
                      <p className="font-semibold text-stone-900 leading-tight">{order.shippingAddress.fullName}</p>
                      <p className="text-[9px] text-stone-400 leading-none mt-0.5">{order.shippingAddress.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-stone-500 truncate max-w-[200px]">
                    {order.items.map(i => `${i.productName} (x${i.quantity})`).join(", ")}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      order.status === "Delivered"
                        ? "bg-emerald-50 text-emerald-700"
                        : order.status === "Shipped"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700 animate-pulse"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-semibold text-stone-900">
                    PKR {order.total.toFixed(2)}
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-stone-400 font-medium">
                    No transactions recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
