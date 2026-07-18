"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, Check, Truck } from "lucide-react";
import { CartItem, DiscountCoupon } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, change: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onCheckout: (appliedPromo: string, discountAmount: number) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState("");

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Free shipping over $150
  const freeShippingThreshold = 150;
  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 15;
  const promoDiscount = subtotal * (discountPercent / 100);
  const taxCost = (subtotal - promoDiscount) * 0.08; // 8% tax
  const finalTotal = subtotal - promoDiscount + shippingCost + taxCost;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    const trimmed = promoCode.trim().toUpperCase();

    // Look up coupon dynamically in localStorage
    if (typeof window !== "undefined") {
      const savedCouponsStr = localStorage.getItem("minimal_coupons");
      if (savedCouponsStr) {
        try {
          const savedCoupons: DiscountCoupon[] = JSON.parse(savedCouponsStr);
          const match = savedCoupons.find((c) => c.code === trimmed);

          if (match) {
            if (!match.active) {
              setPromoError("This coupon code has expired");
              return;
            }
            if (match.minSpend && subtotal < match.minSpend) {
              setPromoError(`Minimum spend of $${match.minSpend} required`);
              return;
            }
            setPromoApplied(true);
            if (match.type === "percentage") {
              setDiscountPercent(match.value);
            } else {
              const calculatedPercent = (match.value / subtotal) * 100;
              setDiscountPercent(calculatedPercent);
            }
            setPromoCode("");
            return;
          }
        } catch (err) {
          console.error("Error parsing coupons from localStorage:", err);
        }
      }
    }

    if (trimmed === "MINIMAL20") {
      setPromoApplied(true);
      setDiscountPercent(20);
      setPromoCode("");
    } else if (trimmed === "FREESHIP") {
      setPromoApplied(true);
      setDiscountPercent(5); // also 5% off + just a fun code
      setPromoCode("");
    } else if (trimmed) {
      setPromoError("Invalid discount code");
    }
  };

  const handleCheckout = () => {
    onCheckout(promoApplied ? (discountPercent === 20 ? "MINIMAL20" : "FREESHIP") : "", promoDiscount);
  };

  const shippingPercent = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs"
          />

          {/* Drawer Container */}
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4.5 w-4.5 text-stone-800" />
                  <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider">
                    Your Shopping Bag
                  </h2>
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700">
                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-all active:scale-90"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Free Shipping Progress Indicator */}
              {subtotal > 0 && (
                <div className="bg-stone-50 px-6 py-3.5 border-b border-stone-100">
                  <div className="flex items-center justify-between text-xs font-medium text-stone-700">
                    {subtotal >= freeShippingThreshold ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                        <Truck className="h-4 w-4" /> You've unlocked Free Shipping!
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-stone-900">${freeShippingThreshold - subtotal}</strong> more for Free Shipping
                      </span>
                    )}
                    <span className="text-stone-400">{Math.round(shippingPercent)}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className="h-full bg-stone-900 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${shippingPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-50 text-stone-400 mb-4">
                      <ShoppingBag className="h-7 w-7" />
                    </div>
                    <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wide">
                      Your bag is empty
                    </h3>
                    <p className="mt-1 text-xs text-stone-500 max-w-[240px] leading-relaxed">
                      Explore our collections and add products to get started.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-5 rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white transition-all hover:bg-stone-850 active:scale-95"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 py-3.5 border-b border-stone-100 last:border-0 group"
                    >
                      {/* Image Thumbnail with rounded corners */}
                      <div className="relative h-20 w-16 overflow-hidden rounded-xl bg-stone-50 shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      {/* Info & Adjustments */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs font-semibold text-stone-900 line-clamp-1 hover:underline cursor-pointer">
                            {item.product.name}
                          </h4>
                          <span className="text-xs font-bold text-stone-950 whitespace-nowrap">
                            ${item.product.price * item.quantity}
                          </span>
                        </div>

                        {/* Attribute selection tags */}
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {item.selectedSize && (
                            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                              Size: {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600 flex items-center gap-1">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: item.selectedColor.hex }}
                              />
                              {item.selectedColor.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity selector */}
                          <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 p-0.5 scale-90 origin-left">
                            <button
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="flex h-7 w-7 items-center justify-center rounded text-stone-500 hover:bg-white active:scale-90"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-[11px] font-bold text-stone-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="flex h-7 w-7 items-center justify-center rounded text-stone-500 hover:bg-white active:scale-90"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Delete Item button */}
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-stone-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Summary Section */}
              {cartItems.length > 0 && (
                <div className="border-t border-stone-100 px-6 py-5 bg-stone-50/55 space-y-4">
                  {/* Promo Code Input */}
                  <form onSubmit={handleApplyPromo} className="relative flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Discount code (e.g. MINIMAL20)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={promoApplied}
                        className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 py-2 text-xs focus:border-stone-900 focus:outline-none disabled:bg-stone-50 disabled:text-stone-400"
                      />
                      <Tag className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                    </div>
                    <button
                      type="submit"
                      disabled={promoApplied}
                      className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-all active:scale-95 disabled:bg-emerald-600"
                    >
                      {promoApplied ? <Check className="h-4.5 w-4.5" /> : "Apply"}
                    </button>
                  </form>

                  {/* Promo status or error */}
                  {promoApplied && (
                    <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold px-1">
                      <span>Promo MINIMAL20 applied!</span>
                      <span>-20% off</span>
                    </div>
                  )}
                  {promoError && (
                    <div className="text-xs text-red-500 font-medium px-1">
                      {promoError}
                    </div>
                  )}

                  {/* Pricing Rows */}
                  <div className="space-y-2 border-t border-stone-100 pt-3 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-stone-900">${subtotal}</span>
                    </div>
                    {promoApplied && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Discount</span>
                        <span>-${promoDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="font-semibold text-stone-900">
                        {shippingCost === 0 ? "Free" : `$${shippingCost}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Tax (8%)</span>
                      <span className="font-semibold text-stone-900">${taxCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-stone-100 pt-3 text-sm font-bold text-stone-900">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    onClick={handleCheckout}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-stone-950 py-3.5 text-xs font-bold text-white shadow-lg transition-all hover:bg-stone-850 active:scale-98"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
