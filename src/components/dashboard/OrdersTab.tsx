"use client";

import React, { useState } from "react";
import { Eye, Truck, Check, Clock, X, ArrowRight, User } from "lucide-react";
import { Order } from "../../types";
import { DEFAULT_ORDERS } from "../../data";

interface OrdersTabProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  triggerAlert: (text: string, type?: "success" | "info") => void;
}

export default function OrdersTab({ orders, setOrders, triggerAlert }: OrdersTabProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handlePopulateDemo = () => {
    setOrders(DEFAULT_ORDERS);
    triggerAlert("Demo orders populated successfully.", "success");
  };

  const handleUpdateStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    
    // Update active modal details too if it is open
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    triggerAlert(`Order status updated to ${newStatus}.`);
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-stone-950">
          Customer Orders
        </h1>
        <p className="text-xs text-stone-400 mt-1">Monitor, inspect, and fulfill retail customer orders.</p>
      </div>

      {/* Orders List Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] font-bold uppercase tracking-wider text-stone-400 bg-stone-50/50">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Date Placed</th>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Delivery Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-stone-850">{o.id}</td>
                  <td className="py-3.5 px-4 text-stone-500">{o.date}</td>
                  <td className="py-3.5 px-4">
                    <div>
                      <p className="font-semibold text-stone-900 leading-tight">{o.shippingAddress.fullName}</p>
                      <p className="text-[10px] text-stone-400 leading-none mt-0.5">{o.shippingAddress.email}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-stone-900">PKR {o.total.toFixed(2)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      o.status === "Delivered"
                        ? "bg-emerald-50 text-emerald-700 font-semibold"
                        : o.status === "Shipped"
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "bg-amber-50 text-amber-700 font-semibold animate-pulse"
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end gap-2.5">
                      {/* Update controls inline */}
                      {o.status === "Processing" && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, "Shipped")}
                          className="rounded-lg bg-stone-950 text-white font-bold uppercase tracking-wider text-[9px] px-2.5 py-1.5 hover:bg-stone-850 cursor-pointer active:scale-95 flex items-center gap-1"
                        >
                          <Truck className="h-3 w-3 text-amber-200" /> Mark Shipped
                        </button>
                      )}
                      {o.status === "Shipped" && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, "Delivered")}
                          className="rounded-lg bg-emerald-700 text-white font-bold uppercase tracking-wider text-[9px] px-2.5 py-1.5 hover:bg-emerald-800 cursor-pointer active:scale-95 flex items-center gap-1"
                        >
                          <Check className="h-3 w-3 stroke-[2.5]" /> Fulfill
                        </button>
                      )}
                      
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-2 rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-600 hover:text-stone-950 transition-all cursor-pointer active:scale-95"
                        title="View Full Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-stone-500 font-medium">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto p-6 space-y-4">
                      <div className="h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                        <Truck className="h-6 w-6 stroke-[1.5]" />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 text-sm">No Orders Placed Yet</p>
                        <p className="text-stone-400 mt-1 leading-normal text-xs">
                          There are currently no orders in your store database. Simulate a checkout or populate demo data.
                        </p>
                      </div>
                      <button
                        onClick={handlePopulateDemo}
                        className="rounded-xl bg-stone-950 text-white font-bold uppercase tracking-wider text-[10px] px-5 py-2.5 hover:bg-stone-850 cursor-pointer active:scale-95 transition-all shadow-sm"
                      >
                        Populate Demo Orders
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Order Modal dialog */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedOrder(null)}
            className="absolute inset-0 bg-stone-900/35 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-stone-100 flex items-center justify-between bg-stone-950 text-white">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-stone-850 flex items-center justify-center text-amber-200 text-[10px] font-mono">ID</span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Inspect Order {selectedOrder.id}
                  </h3>
                  <p className="text-[9px] text-stone-400 mt-0.5">Recorded on {selectedOrder.date}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Status Banner */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border border-stone-150 rounded-2xl p-4 bg-stone-50/50">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Order Delivery Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      selectedOrder.status === "Delivered"
                        ? "bg-emerald-50 text-emerald-700"
                        : selectedOrder.status === "Shipped"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700 animate-pulse"
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {selectedOrder.status !== "Delivered" && (
                    <>
                      {selectedOrder.status === "Processing" && (
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id, "Shipped")}
                          className="rounded-xl bg-stone-950 text-white font-bold uppercase tracking-wider text-[10px] px-4 py-2.5 hover:bg-stone-850 cursor-pointer active:scale-95 flex items-center gap-1.5"
                        >
                          <Truck className="h-4 w-4 text-amber-200" /> Mark as Shipped
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, "Delivered")}
                        className="rounded-xl bg-emerald-755 text-white font-bold uppercase tracking-wider text-[10px] px-4 py-2.5 hover:bg-emerald-800 cursor-pointer active:scale-95 flex items-center gap-1.5"
                      >
                        <Check className="h-4 w-4" /> Complete Delivery
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Items Card list */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Ordered Showroom Items</h4>
                <div className="border border-stone-150 rounded-2xl overflow-hidden divide-y divide-stone-100">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white hover:bg-stone-50/20">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-lg overflow-hidden border border-stone-200 bg-stone-50 shrink-0">
                          <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-stone-900 leading-tight">{item.productName}</h5>
                          <p className="text-[10px] text-stone-400 mt-1 font-medium flex gap-2">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-stone-900 font-mono">PKR {item.price}</p>
                        <p className="text-[10px] text-stone-450 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Billing details */}
                <div className="border border-stone-150 rounded-2xl p-4 space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Customer Contact
                  </h4>
                  <div className="text-xs font-medium space-y-1">
                    <p className="text-stone-850 font-bold">{selectedOrder.shippingAddress.fullName}</p>
                    <p className="text-stone-500">{selectedOrder.shippingAddress.email}</p>
                  </div>
                </div>

                {/* Shipping details */}
                <div className="border border-stone-150 rounded-2xl p-4 space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Shipping Destination</h4>
                  <div className="text-xs font-medium space-y-1.5">
                    <p className="text-stone-800">{selectedOrder.shippingAddress.address}</p>
                    <p className="text-stone-550">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}
                    </p>
                    <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>

              </div>

              {/* Subtotal calculation details */}
              <div className="border-t border-stone-100 pt-4 flex flex-col items-end space-y-2 text-xs">
                <div className="w-56 flex justify-between">
                  <span className="text-stone-450">Subtotal:</span>
                  <span className="font-mono text-stone-900">PKR {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="w-56 flex justify-between">
                  <span className="text-stone-450">Shipping charges:</span>
                  <span className="font-mono text-stone-900">PKR {selectedOrder.shipping.toFixed(2)}</span>
                </div>
                <div className="w-56 flex justify-between border-t border-stone-150 pt-2 text-sm">
                  <span className="font-bold text-stone-850 uppercase tracking-wider text-[10px]">Grand Total:</span>
                  <span className="font-mono font-bold text-stone-950">PKR {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4.5 bg-stone-50 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-800 transition-all cursor-pointer active:scale-95"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
