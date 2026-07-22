"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User as UserIcon, Sparkles, ArrowRight, AlertCircle, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { user, login, register, logout } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    if (mode === "login") {
      const res = await login(email, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || "Login failed");
      }
    } else {
      const res = await register(name, email, password);
      if (res.success) {
        setSuccessMsg("Account created successfully! Logging you in...");
        const loginRes = await login(email, password);
        if (loginRes.success) {
          setTimeout(() => onClose(), 800);
        }
      } else {
        setError(res.error || "Registration failed");
      }
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-stone-400 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Logged in view */}
          {user ? (
            <div className="space-y-6 text-center py-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-stone-950 text-white font-display text-lg font-bold">
                {user.name ? user.name.slice(0, 2).toUpperCase() : "US"}
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-stone-950 uppercase tracking-wider">
                  {user.name || "Customer Account"}
                </h3>
                <p className="text-xs text-stone-500 mt-1">{user.email}</p>
                <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-stone-100 text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Role: {user.role}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex flex-col gap-2">
                {user.role === "super_admin" && (
                  <a
                    href="/admin/dashboard"
                    className="w-full rounded-xl bg-stone-950 px-4 py-3 text-xs font-bold text-white uppercase tracking-wider shadow-md hover:bg-stone-850 transition-all text-center"
                  >
                    Go to Admin Dashboard
                  </a>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-xs font-bold text-stone-700 hover:text-stone-950 hover:bg-stone-50 uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Login / Register Form */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-950 text-white mb-1">
                  <Sparkles className="h-4 w-4 text-amber-200" />
                </div>
                <h2 className="font-display text-xl font-bold uppercase tracking-wider text-stone-950">
                  {mode === "login" ? "Welcome Back" : "Join Atelier"}
                </h2>
                <p className="text-xs text-stone-500">
                  {mode === "login"
                    ? "Sign in to access your order history & saved wishlist."
                    : "Create an account for personalized styling & swift checkout."}
                </p>
              </div>

              {/* Mode Toggle Pills */}
              <div className="flex p-1 rounded-xl bg-stone-100 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className={`flex-1 py-2 rounded-lg transition-all uppercase tracking-wider text-[10px] font-bold cursor-pointer ${
                    mode === "login"
                      ? "bg-white text-stone-950 shadow-xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className={`flex-1 py-2 rounded-lg transition-all uppercase tracking-wider text-[10px] font-bold cursor-pointer ${
                    mode === "register"
                      ? "bg-white text-stone-950 shadow-xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 py-3 text-xs focus:border-stone-900 focus:outline-none"
                      />
                      <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@example.com"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 py-3 text-xs focus:border-stone-900 focus:outline-none"
                    />
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 py-3 text-xs focus:border-stone-900 focus:outline-none"
                    />
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-[11px] text-red-600 font-medium">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-[11px] text-emerald-700 font-medium">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 rounded-xl bg-stone-950 px-4 py-3.5 text-xs font-bold text-white uppercase tracking-wider shadow-md hover:bg-stone-850 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isLoading ? (
                    <span className="h-4 w-4 border-2 border-stone-400 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === "login" ? "Sign In" : "Register Account"}{" "}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
