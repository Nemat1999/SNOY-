"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push("/admin/dashboard");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      router.push("/admin/dashboard");
    } else {
      setError(result.error || "Invalid credentials");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Decorative clean background mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-stone-200/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-stone-250/50 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-xl relative z-10"
      >
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-stone-950 text-white mb-2">
            <Sparkles className="h-5 w-5 text-amber-200" />
          </div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-stone-950">
            Atelier Showroom
          </h1>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Authorized administrator credentials required to manage e-commerce showroom catalogs and customer order fulfillment.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@snoy.com"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/40 pl-10 pr-4 py-3.5 text-xs focus:border-stone-900 focus:outline-none transition-all placeholder:text-stone-400 font-medium"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] font-bold uppercase tracking-wider text-stone-450 hover:text-stone-900 transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/40 pl-10 pr-10 py-3.5 text-xs focus:border-stone-900 focus:outline-none transition-all placeholder:text-stone-400 font-medium"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50/50 p-3.5 text-[11px] text-red-600 font-medium leading-relaxed"
            >
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 rounded-xl bg-stone-950 px-5 py-3.5 text-xs font-bold text-white shadow-lg shadow-stone-950/15 hover:bg-stone-850 transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
          >
            {isLoading ? (
              <span className="h-4 w-4 border-2 border-stone-400 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign in to Dashboard <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Helper Banner */}
        <div className="mt-8 border-t border-stone-100 pt-6 text-center">
          <p className="text-[10px] text-stone-400 font-medium">
            Super Admin: <code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono text-stone-600">admin@snoy.com</code> / <code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono text-stone-600">Admin@123456</code>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
