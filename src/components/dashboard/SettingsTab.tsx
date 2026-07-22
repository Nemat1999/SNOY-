"use client";

import React, { useState, useEffect } from "react";
import { Save, Store, Globe, Bell, Shield, Monitor, Smartphone, LogOut, RefreshCw } from "lucide-react";
import { useAuth, SessionInfo } from "../../context/AuthContext";

interface SettingsTabProps {
  triggerAlert: (text: string, type?: "success" | "info") => void;
}

export default function SettingsTab({ triggerAlert }: SettingsTabProps) {
  const { user, getSessions, logoutAll } = useAuth();

  const [storeName, setStoreName] = useState("Atelier Showroom");
  const [contactEmail, setContactEmail] = useState("concierge@atelierstore.com");
  const [currency, setCurrency] = useState("USD");
  const [shippingFee, setShippingFee] = useState("15");
  const [notifyNewOrders, setNotifyNewOrders] = useState(true);
  const [notifyLowStock, setNotifyLowStock] = useState(true);

  // Active Sessions State
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const fetchSessionsList = async () => {
    setIsLoadingSessions(true);
    const data = await getSessions();
    setSessions(data);
    setIsLoadingSessions(false);
  };

  useEffect(() => {
    fetchSessionsList();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAlert("Configuration profiles saved successfully.");
  };

  const handleRevokeAll = async () => {
    if (confirm("Are you sure you want to sign out from all devices? You will be logged out immediately.")) {
      await logoutAll();
      window.location.href = "/admin/login";
    }
  };

  return (
    <div className="space-y-8 select-none max-w-2xl">
      
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-stone-950">
          Store Config & Security
        </h1>
        <p className="text-xs text-stone-400 mt-1">Configure global variables, active auth sessions, and messaging alerts.</p>
      </div>

      {/* Active User Security Profile */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-stone-200">
            <Shield className="h-4 w-4 text-emerald-400" /> Authenticated Profile
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
            {user?.role || "user"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-[10px] uppercase font-bold text-stone-400">Account Name</p>
            <p className="font-semibold text-stone-100 mt-0.5">{user?.name || "Super Admin"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-stone-400">Email Address</p>
            <p className="font-semibold text-stone-100 mt-0.5">{user?.email || "admin@snoy.com"}</p>
          </div>
        </div>
      </div>

      {/* Active Devices & Sessions Section */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-850 flex items-center gap-1.5">
            <Monitor className="h-4 w-4 text-stone-500" /> Active Logged-in Devices ({sessions.length})
          </h3>
          <button
            onClick={fetchSessionsList}
            disabled={isLoadingSessions}
            className="text-[10px] font-bold uppercase tracking-wider text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isLoadingSessions ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-xs text-stone-400 italic">No active session data found.</p>
          ) : (
            sessions.map((sess) => (
              <div
                key={sess.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-stone-150 bg-stone-50/50 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-stone-200 flex items-center justify-center text-stone-700">
                    {sess.userAgent.toLowerCase().includes("mobile") || sess.userAgent.toLowerCase().includes("iphone") ? (
                      <Smartphone className="h-4 w-4" />
                    ) : (
                      <Monitor className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900">{sess.userAgent}</span>
                      {sess.isCurrentDevice && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">
                          Current Device
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-400 font-medium">
                      IP: {sess.ipAddress} • Logged in: {new Date(sess.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {sessions.length > 0 && (
          <div className="pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={handleRevokeAll}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <LogOut className="h-4 w-4" /> Logout From All Devices
            </button>
          </div>
        )}
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
