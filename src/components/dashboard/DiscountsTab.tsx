"use client";

import React, { useState } from "react";
import { Plus, Trash2, Tag, Percent, ToggleLeft, ToggleRight, X, Clock } from "lucide-react";
import { DiscountCoupon } from "../../types";

interface DiscountsTabProps {
  coupons: DiscountCoupon[];
  setCoupons: React.Dispatch<React.SetStateAction<DiscountCoupon[]>>;
  triggerAlert: (text: string, type?: "success" | "info") => void;
}

export default function DiscountsTab({ coupons, setCoupons, triggerAlert }: DiscountsTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState<number>(10);
  const [minSpend, setMinSpend] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState("2026-12-31");

  const handleToggleActive = (couponCode: string) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.code === couponCode) {
          const newState = !c.active;
          triggerAlert(`Coupon code ${c.code} ${newState ? "activated" : "deactivated"}.`, "info");
          return { ...c, active: newState };
        }
        return c;
      })
    );
  };

  const handleDelete = (couponCode: string) => {
    if (confirm(`Are you sure you want to delete coupon "${couponCode}"?`)) {
      setCoupons((prev) => prev.filter((c) => c.code !== couponCode));
      triggerAlert(`Coupon "${couponCode}" deleted successfully.`, "info");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      alert("Please enter a valid coupon code.");
      return;
    }

    if (value <= 0) {
      alert("Please enter a discount value greater than 0.");
      return;
    }

    if (coupons.some((c) => c.code === cleanCode)) {
      alert(`A coupon code with "${cleanCode}" already exists.`);
      return;
    }

    const newCoupon: DiscountCoupon = {
      code: cleanCode,
      type,
      value: Number(value),
      minSpend: Number(minSpend) || 0,
      active: true,
      usageCount: 0,
      expiryDate,
    };

    setCoupons((prev) => [...prev, newCoupon]);
    triggerAlert(`Coupon code "${cleanCode}" created.`, "success");
    setIsFormOpen(false);

    // Reset Form
    setCode("");
    setType("percentage");
    setValue(10);
    setMinSpend(0);
    setExpiryDate("2026-12-31");
  };

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-stone-950">
            Discounts & Coupons
          </h1>
          <p className="text-xs text-stone-400 mt-1">Manage promotion codes, set active states, and track campaign usage.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="rounded-xl bg-stone-950 text-white font-bold uppercase tracking-wider text-[10px] px-5 py-3 hover:bg-stone-850 cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4.5 w-4.5 stroke-[2.5]" /> Create Coupon
        </button>
      </div>

      {/* Coupons Table Grid */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] font-bold uppercase tracking-wider text-stone-400 bg-stone-50/50">
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount Value</th>
                <th className="py-3.5 px-4">Minimum Spend</th>
                <th className="py-3.5 px-4">Campaign Expiry</th>
                <th className="py-3.5 px-4">Usage Stats</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.code} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/40 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-stone-900">
                    <span className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-stone-450" />
                      {c.code}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-stone-700">
                    {c.type === "percentage" ? `${c.value}% OFF` : `$${c.value.toFixed(2)} OFF`}
                  </td>
                  <td className="py-4 px-4 font-mono text-stone-500">
                    {c.minSpend && c.minSpend > 0 ? `$${c.minSpend.toFixed(2)}` : "None"}
                  </td>
                  <td className="py-4 px-4 text-stone-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="h-3.5 w-3.5 text-stone-400" />
                      {c.expiryDate}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold">
                    <span className="font-mono text-stone-900">{c.usageCount}</span>
                    <span className="text-[10px] text-stone-400 font-normal ml-1">redeemed</span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleActive(c.code)}
                      className="cursor-pointer transition-transform active:scale-90"
                      title={c.active ? "Click to Deactivate" : "Click to Activate"}
                    >
                      {c.active ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-500 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                          Expired
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(c.code)}
                        className="p-1.5 rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-500 hover:text-stone-850 cursor-pointer transition-all"
                        title={c.active ? "Deactivate" : "Activate"}
                      >
                        {c.active ? (
                          <ToggleRight className="h-4 w-4 text-emerald-700" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-stone-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(c.code)}
                        className="p-1.5 rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-500 hover:text-red-650 hover:border-red-200 cursor-pointer transition-all"
                        title="Remove Coupon"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-stone-400 font-medium">
                    No discount codes created yet. Click "Create Coupon" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsFormOpen(false)}
            className="absolute inset-0 bg-stone-900/35 backdrop-blur-xs"
          />

          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-stone-100 flex items-center justify-between bg-stone-950 text-white">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-stone-850 flex items-center justify-center text-amber-250">
                  <Percent className="h-4 w-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Create Promo Coupon
                  </h3>
                  <p className="text-[9px] text-stone-450 mt-0.5">Introduce a new brand campaign code.</p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {/* Code field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. AUTUMN25"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:border-stone-400 focus:outline-none placeholder-stone-300 uppercase font-mono font-bold"
                  />
                </div>

                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Discount Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as "percentage" | "fixed")}
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-800 focus:border-stone-400 focus:outline-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={type === "percentage" ? "100" : "10000"}
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                      placeholder={type === "percentage" ? "20" : "50"}
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:border-stone-400 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Minimum Spend */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Min Spend ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={minSpend}
                      onChange={(e) => setMinSpend(Number(e.target.value))}
                      placeholder="e.g. 150"
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:border-stone-400 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      required
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-850 focus:border-stone-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="px-6 py-4.5 bg-stone-50 border-t border-stone-100 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-650 hover:bg-white cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-stone-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-850 cursor-pointer active:scale-95 shadow-sm"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
