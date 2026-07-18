"use client";

import React, { useState } from "react";
import { Save, Store, Mail, Globe, Bell } from "lucide-react";

interface SettingsTabProps {
  triggerAlert: (text: string, type?: "success" | "info") => void;
}

export default function SettingsTab({ triggerAlert }: SettingsTabProps) {
  const [storeName, setStoreName] = useState("Atelier Showroom");
  const [contactEmail, setContactEmail] = useState("concierge@atelierstore.com");
  const [currency, setCurrency] = useState("USD");
  const [shippingFee, setShippingFee] = useState("15");
  const [notifyNewOrders, setNotifyNewOrders] = useState(true);
  const [notifyLowStock, setNotifyLowStock] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAlert("Configuration profiles saved successfully.");
  };

  return (
    <div className="space-y-8 select-none max-w-2xl">
      
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-stone-950">
          Store Config
        </h1>
        <p className="text-xs text-stone-400 mt-1">Configure global variables, logistics variables, and messaging alerts.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Core General Info */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-850 flex items-center gap-1.5 border-b border-stone-100 pb-3">
            <Store className="h-4 w-4 text-stone-500" /> Identity & Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Showroom Title
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Concierge Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Currency & Logistics */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-850 flex items-center gap-1.5 border-b border-stone-100 pb-3">
            <Globe className="h-4 w-4 text-stone-500" /> Logistics & Localization
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none bg-white cursor-pointer"
              >
                <option value="USD">USD ($) United States</option>
                <option value="EUR">EUR (€) Euro</option>
                <option value="GBP">GBP (£) British Pound</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Standard Shipping Charge ($)
              </label>
              <input
                type="number"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-850 flex items-center gap-1.5 border-b border-stone-100 pb-3">
            <Bell className="h-4 w-4 text-stone-500" /> Notifications Settings
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyNewOrders}
                onChange={(e) => setNotifyNewOrders(e.target.checked)}
                className="rounded border-stone-300 accent-stone-950 h-4 w-4 cursor-pointer"
              />
              <span className="text-xs font-medium text-stone-750">Send email notification for every new transaction.</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyLowStock}
                onChange={(e) => setNotifyLowStock(e.target.checked)}
                className="rounded border-stone-300 accent-stone-950 h-4 w-4 cursor-pointer"
              />
              <span className="text-xs font-medium text-stone-750">Warn when inventory items lack sizing variations.</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="rounded-xl bg-stone-950 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-stone-850 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
        >
          <Save className="h-4 w-4" /> Save Configuration
        </button>

      </form>

    </div>
  );
}
