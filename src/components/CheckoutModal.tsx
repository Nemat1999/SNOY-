"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Truck, CreditCard, ShoppingBag, Eye, ArrowRight, ArrowLeft } from "lucide-react";
import { CartItem, Order } from "../types";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  discountAmount: number;
  promoCode: string;
  onOrderPlaced: (order: Order) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  discountAmount,
  promoCode,
  onOrderPlaced,
}: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Shipping, 2: Payment, 3: Review, 4: Success
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Karachi");
  const [province, setProvince] = useState("Punjab");
  const [landmark, setLandmark] = useState("");
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Pakistan");

  const [generatedOrder, setGeneratedOrder] = useState<Order | null>(null);

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingCost = subtotal >= 150 ? 0 : 15;
  const taxCost = (subtotal - discountAmount) * 0.08;
  const total = subtotal - discountAmount + shippingCost + taxCost;

  const handleNextStep = () => {
    if (step === 1) {
      if (!email || !fullName || !address || !city || !phone) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderId = `MIN-${Math.floor(100000 + Math.random() * 900000)}`;
      const today = new Date();
      const dateString = today.toISOString().split("T")[0];

      const newOrder = {
        id: orderId,
        date: dateString,
        items: cartItems.map((item) => ({
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images[0],
          size: item.selectedSize,
          color: item.selectedColor?.name,
        })),
        subtotal,
        shipping: shippingCost,
        total,
        shippingAddress: {
          fullName,
          email,
          address: `${address}${landmark ? ` (Landmark: ${landmark})` : ""} | Phone: ${phone} | Province: ${province}`,
          city,
          postalCode: postalCode || "00000",
          country,
        },
        status: "Processing",
      };

      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOrder),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit order");
      }

      const resData = await res.json();
      const savedOrder = resData.order || newOrder;

      setGeneratedOrder(savedOrder);
      onOrderPlaced(savedOrder);
      setStep(4);
    } catch (err: any) {
      console.error("Fulfillment placement error:", err);
      alert(err.message || "Something went wrong while placing the order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={step !== 4 ? onClose : undefined}
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative z-10 w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Close button - hidden on success screen */}
            {step !== 4 && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            )}

            {/* Left side: Main Checkout form */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[50vh] md:max-h-full">
              {/* Stepper Header */}
              {step !== 4 && (
                <div className="mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Step {step} of 3</span>
                  <h2 className="text-lg font-bold text-stone-900 uppercase tracking-wider mt-1">
                    {step === 1 && "Shipping Information"}
                    {step === 2 && "Payment Details"}
                    {step === 3 && "Review Order"}
                  </h2>
                  {/* Progress Line */}
                  <div className="mt-3 flex gap-1 h-1 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-stone-900 transition-all duration-300 rounded-full`} style={{ width: `${(step / 3) * 100}%` }} />
                  </div>
                </div>
              )}

              {/* STEP 1: SHIPPING */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sajid Ali"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="sajidali@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Phone Number (Mobile) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 03001234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Nearest Landmark / Area</label>
                      <input
                        type="text"
                        placeholder="e.g. Near Shell Pump, Opp. Millennium Mall"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Street Address (House #, Block/Sector, Area) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. House No. 45-B, Sector 11-A, North Karachi"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">City *</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none bg-white cursor-pointer"
                      >
                        <option value="Karachi">Karachi</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Faisalabad">Faisalabad</option>
                        <option value="Multan">Multan</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Quetta">Quetta</option>
                        <option value="Sialkot">Sialkot</option>
                        <option value="Gujranwala">Gujranwala</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Sargodha">Sargodha</option>
                        <option value="Bahawalpur">Bahawalpur</option>
                        <option value="Sukkur">Sukkur</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Postal Code</label>
                      <input
                        type="text"
                        placeholder="e.g. 75500"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Province *</label>
                      <select
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none bg-white cursor-pointer"
                      >
                        <option value="Punjab">Punjab</option>
                        <option value="Sindh">Sindh</option>
                        <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa (KPK)</option>
                        <option value="Balochistan">Balochistan</option>
                        <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                        <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                        <option value="Azad Kashmir">Azad Kashmir</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Country</label>
                      <input
                        type="text"
                        disabled
                        value={country}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs focus:outline-none text-stone-500 font-semibold"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleNextStep}
                    disabled={!email || !fullName || !address || !city || !phone}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-stone-950 py-3 px-4 text-xs font-bold text-white shadow-md hover:bg-stone-850 transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none mt-6 cursor-pointer"
                  >
                    Continue to Payment Method <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* STEP 2: PAYMENT */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="rounded-2xl border-2 border-stone-900 bg-stone-50/50 p-5 flex items-start gap-4">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white mt-0.5">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <div className="text-xs">
                      <strong className="block text-stone-900 text-sm uppercase tracking-wider font-semibold">Cash on Delivery (COD)</strong>
                      <p className="text-stone-500 mt-1 leading-relaxed">
                        Pay with cash upon receipt of your package at your shipping address. Our courier agent will contact you on your mobile number prior to delivery.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-150 p-5 bg-white space-y-3.5 text-xs">
                    <h4 className="font-bold text-stone-900 uppercase text-[10px] tracking-wider">COD Billing Summary</h4>
                    <div className="flex justify-between text-stone-600">
                      <span>Order Value</span>
                      <span className="font-mono">PKR {(subtotal - discountAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Delivery Cost</span>
                      <span className="font-mono">{shippingCost === 0 ? "Free" : `PKR ${shippingCost.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-stone-900 font-bold border-t border-stone-100 pt-3 text-sm">
                      <span>Amount Due on Delivery</span>
                      <span className="font-mono">PKR {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handlePrevStep}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 px-4 py-3 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-all active:scale-95 cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-stone-950 py-3 text-xs font-bold text-white hover:bg-stone-850 transition-all active:scale-98 cursor-pointer"
                    >
                      Continue to Summary <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW SUMMARY */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-stone-100 bg-stone-50 p-4 space-y-3.5 text-xs text-stone-600">
                    <div>
                      <h4 className="font-bold text-stone-900 uppercase text-[10px] tracking-wider mb-1">Shipping Details</h4>
                      <p className="font-semibold text-stone-850">{fullName}</p>
                      <p className="mt-1">{address}</p>
                      {landmark && <p className="text-stone-500 font-medium">Landmark: {landmark}</p>}
                      <p>{city}, {province} {postalCode && `- ${postalCode}`}</p>
                      <p>{country}</p>
                      <div className="mt-2 text-[10px] text-stone-400 font-medium space-y-0.5">
                        <p>Email: {email}</p>
                        <p className="font-mono">Phone: {phone}</p>
                      </div>
                    </div>

                    <div className="border-t border-stone-200/60 pt-3 flex items-center gap-2 text-stone-800">
                      <Truck className="h-4 w-4 text-stone-500" />
                      <div>
                        <h4 className="font-bold text-stone-900 uppercase text-[10px] tracking-wider">Payment Method</h4>
                        <p className="text-[11px] font-semibold text-emerald-700">Cash on Delivery (COD)</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-stone-100 p-4">
                    <h4 className="font-bold text-stone-900 uppercase text-[10px] tracking-wider mb-3">Order Delivery Estimate</h4>
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-50 text-stone-800">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-stone-800">Standard Insured Courier Delivery</p>
                        <p className="text-stone-500 mt-0.5">Est. Arrival: 3 - 5 Business Days</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handlePrevStep}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 px-4 py-3 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-all active:scale-95"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-stone-950 py-3 text-xs font-bold text-white shadow-lg transition-all hover:bg-stone-850 active:scale-98 disabled:opacity-50"
                    >
                      {isSubmitting ? "Placing Order..." : `Place Secure Order (PKR ${total.toFixed(2)})`}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: ORDER SUCCESS RECEIPT */}
              {step === 4 && generatedOrder && (
                <div className="flex flex-col items-center text-center py-6">
                  {/* Confirmed checkmark */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4"
                  >
                    <Check className="h-8 w-8 stroke-[3]" />
                  </motion.div>

                  <h3 className="text-lg font-bold text-stone-900 uppercase tracking-widest">Order Confirmed</h3>
                  <p className="text-xs text-stone-500 mt-1.5">
                    Thank you, {fullName}. We've received your order and are preparing it.
                  </p>

                  {/* Order Card Detail */}
                  <div className="mt-6 w-full rounded-2xl border border-stone-100 bg-stone-50/50 p-5 text-left">
                    <div className="flex justify-between border-b border-stone-100 pb-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Order Reference</span>
                        <strong className="text-stone-800 text-sm font-semibold">{generatedOrder.id}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Order Date</span>
                        <strong className="text-stone-800 text-xs font-semibold">{generatedOrder.date}</strong>
                      </div>
                    </div>

                    <div className="py-4 space-y-3.5">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Items Purchased</span>
                      <div className="max-h-[140px] overflow-y-auto space-y-3">
                        {generatedOrder.items.map((item, index) => (
                          <div key={index} className="flex gap-3 items-center">
                            <img src={item.image} alt="" referrerPolicy="no-referrer" className="h-10 w-8 object-cover rounded-md bg-white border" />
                            <div className="flex-1 min-w-0 text-xs">
                              <p className="font-semibold text-stone-800 line-clamp-1">{item.productName}</p>
                              <p className="text-stone-400 mt-0.5">
                                {item.quantity}x • {item.size && `Size ${item.size}`} {item.color && `• Color ${item.color}`}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-stone-800">PKR {item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-stone-100 pt-3 space-y-1.5 text-xs text-stone-600">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>PKR {generatedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-medium">
                          <span>Discount Applied</span>
                          <span>-PKR {discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Shipping & Delivery</span>
                        <span>{generatedOrder.shipping === 0 ? "Free" : `PKR ${generatedOrder.shipping}`}</span>
                      </div>
                      <div className="flex justify-between font-bold text-stone-900 border-t border-stone-100 pt-3">
                        <span>Amount Paid</span>
                        <span>PKR {generatedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
                    <button
                      onClick={onClose}
                      className="flex-1 rounded-xl border border-stone-200 px-4 py-3 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-all active:scale-95"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Summary invoice card (hidden on success page) */}
            {step !== 4 && (
              <div className="w-full md:w-80 bg-stone-50/70 p-6 md:p-8 border-t md:border-t-0 md:border-l border-stone-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-stone-800 mb-4">
                    Bag Summary
                  </h3>

                  {/* Items list inline */}
                  <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center">
                        <div className="h-12 w-9 rounded-lg overflow-hidden bg-white border shrink-0">
                          <img src={item.product.images[0]} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 text-[11px]">
                          <p className="font-semibold text-stone-800 line-clamp-1">{item.product.name}</p>
                          <p className="text-stone-400">
                            Qty {item.quantity} {item.selectedSize && `• Size ${item.selectedSize}`}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-stone-900">PKR {item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-stone-200 pt-4 mt-6 space-y-2.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-stone-900">PKR {subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Promo discount</span>
                      <span>-PKR {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold text-stone-900">{shippingCost === 0 ? "Free" : `PKR ${shippingCost}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Tax (8%)</span>
                    <span className="font-semibold text-stone-900">PKR {taxCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 pt-3 text-sm font-bold text-stone-900">
                    <span>Grand Total</span>
                    <span>PKR {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
