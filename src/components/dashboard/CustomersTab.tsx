"use client";

import React from "react";
import { User, Mail, DollarSign, Calendar, MapPin } from "lucide-react";
import { Order } from "../../types";
import { DEFAULT_ORDERS } from "../../data";

interface CustomersTabProps {
  orders: Order[];
  setOrders?: React.Dispatch<React.SetStateAction<Order[]>>;
  triggerAlert?: (text: string, type?: "success" | "info") => void;
}

interface CustomerSummary {
  fullName: string;
  email: string;
  city: string;
  country: string;
  orderCount: number;
  totalSpend: number;
  latestOrderDate: string;
}

export default function CustomersTab({ orders, setOrders, triggerAlert }: CustomersTabProps) {
  // Aggregate customers from existing order array
  const customerMap: { [email: string]: CustomerSummary } = {};

  orders.forEach((order) => {
    const email = order.shippingAddress.email.trim().toLowerCase();
    const current = customerMap[email];

    if (current) {
      customerMap[email] = {
        ...current,
        orderCount: current.orderCount + 1,
        totalSpend: current.totalSpend + order.total,
        latestOrderDate: new Date(order.date) > new Date(current.latestOrderDate) ? order.date : current.latestOrderDate,
      };
    } else {
      customerMap[email] = {
        fullName: order.shippingAddress.fullName,
        email: order.shippingAddress.email,
        city: order.shippingAddress.city,
        country: order.shippingAddress.country,
        orderCount: 1,
        totalSpend: order.total,
        latestOrderDate: order.date,
      };
    }
  });

  const customersList = Object.values(customerMap).sort((a, b) => b.totalSpend - a.totalSpend);

  return (
    <div className="space-y-8 select-none">
      
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-stone-950">
          Customer Database
        </h1>
        <p className="text-xs text-stone-400 mt-1">Directory of customers aggregated from transactional histories.</p>
      </div>

      {/* Customers List Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] font-bold uppercase tracking-wider text-stone-400 bg-stone-50/50">
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Latest Order</th>
                <th className="py-3.5 px-4 text-right">Total Invested</th>
              </tr>
            </thead>
            <tbody>
              {customersList.map((c) => (
                <tr key={c.email} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-bold">
                        {c.fullName.charAt(0)}
                      </div>
                      <span className="font-bold text-stone-900 leading-tight">{c.fullName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-stone-550">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Mail className="h-3.5 w-3.5 text-stone-400" /> {c.email}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-stone-500">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-stone-400" /> {c.city}, {c.country}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono font-semibold text-stone-600">{c.orderCount}</td>
                  <td className="py-4 px-4 text-stone-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-stone-400" /> {c.latestOrderDate}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-stone-950">
                    PKR {c.totalSpend.toFixed(2)}
                  </td>
                </tr>
              ))}

              {customersList.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-stone-500 font-medium">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto p-6 space-y-4">
                      <div className="h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                        <User className="h-6 w-6 stroke-[1.5]" />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 text-sm">No Customers Found</p>
                        <p className="text-stone-400 mt-1 leading-normal text-xs">
                          Customers are dynamically aggregated from order transactions. Populate demo orders to see customer listings.
                        </p>
                      </div>
                      {setOrders && triggerAlert && (
                        <button
                          onClick={() => {
                            setOrders(DEFAULT_ORDERS);
                            triggerAlert("Demo customer and order records populated.", "success");
                          }}
                          className="rounded-xl bg-stone-950 text-white font-bold uppercase tracking-wider text-[10px] px-5 py-2.5 hover:bg-stone-850 cursor-pointer active:scale-95 transition-all shadow-sm"
                        >
                          Populate Demo Data
                        </button>
                      )}
                    </div>
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
