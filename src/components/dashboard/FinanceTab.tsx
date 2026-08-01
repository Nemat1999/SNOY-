"use client";

import React, { useState } from "react";
import { Plus, Trash2, DollarSign, Wallet, ArrowUpRight, TrendingDown, TrendingUp, X } from "lucide-react";
import { ExpenseItem, Order } from "../../types";

interface FinanceTabProps {
  expenses: ExpenseItem[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  orders: Order[];
  triggerAlert: (text: string, type?: "success" | "info") => void;
}

export default function FinanceTab({
  expenses,
  setExpenses,
  orders,
  triggerAlert,
}: FinanceTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [category, setCategory] = useState("Inventory");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - totalExpenses;

  const handleOpenAddForm = () => {
    setCategory("Inventory");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setIsFormOpen(true);
  };

  const handleDelete = (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense record?")) {
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      triggerAlert("Expense record deleted.", "info");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount.trim() || !description.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      date,
      category,
      amount: amtNum,
      description: description.trim(),
    };

    setExpenses((prev) => [newExpense, ...prev]);
    triggerAlert("Expense logged successfully.");
    setIsFormOpen(false);
  };

  // Group expenses by category for breakdown visualizer
  const categoryTotals: { [cat: string]: number } = {};
  expenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const formattedSales = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalSales);

  const formattedExpenses = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalExpenses);

  const formattedProfit = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(netProfit);

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-stone-950">
            Showroom Finance
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Fulfillment ledger, operations costs, and net margin computations.
          </p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="rounded-xl bg-stone-950 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-stone-850 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
        >
          <Plus className="h-4 w-4" /> Log Expense
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Gross Sales */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-450">
              Gross Showroom Sales
            </span>
            <h3 className="font-display text-2xl font-bold text-stone-950">{formattedSales}</h3>
            <span className="text-[9px] font-semibold text-emerald-600 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> Fulfillments income
            </span>
          </div>
          <div className="p-3 bg-stone-100 rounded-2xl text-stone-900 shrink-0">
            <DollarSign className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-450">
              Total Operations Cost
            </span>
            <h3 className="font-display text-2xl font-bold text-stone-950">{formattedExpenses}</h3>
            <span className="text-[9px] font-semibold text-amber-600 flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5" /> Outgoings ledger
            </span>
          </div>
          <div className="p-3 bg-stone-100 rounded-2xl text-stone-900 shrink-0">
            <Wallet className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-450">
              Net Profit Margin
            </span>
            <h3 className={`font-display text-2xl font-bold ${netProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>
              {formattedProfit}
            </h3>
            <span className={`text-[9px] font-semibold flex items-center gap-1 ${netProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {netProfit >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {netProfit >= 0 ? "Profitable return" : "Net operating deficit"}
            </span>
          </div>
          <div className="p-3 bg-stone-100 rounded-2xl text-stone-900 shrink-0">
            <DollarSign className="h-5.5 w-5.5" />
          </div>
        </div>

      </div>

      {/* Expense Allocation visualizer */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="border-b border-stone-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-850">Operating Costs Allocation</h3>
          <p className="text-[10px] text-stone-400 mt-0.5">Budget allocations categorized by ledger accounts</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {["Inventory", "Marketing", "Salaries", "Software", "Rent", "Utilities"].map((cat) => {
            const amt = categoryTotals[cat] || 0;
            const pct = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0;
            return (
              <div key={cat} className="border border-stone-100 rounded-xl p-3 bg-stone-50/50 flex flex-col justify-between h-24">
                <div>
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{cat}</h4>
                  <p className="text-xs font-bold text-stone-900 mt-1 font-mono">PKR {amt.toFixed(0)}</p>
                </div>
                <div className="w-full bg-stone-200 h-1 rounded-full overflow-hidden mt-2">
                  <div style={{ width: `${pct}%` }} className="bg-stone-900 h-full rounded-full" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenses Ledger */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-stone-100 bg-stone-50/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-850">Outgoings Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] font-bold uppercase tracking-wider text-stone-400 bg-stone-50/50">
                <th className="py-3 px-4">Date logged</th>
                <th className="py-3 px-4">Ledger Account</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/40 transition-colors">
                  <td className="py-3.5 px-4 text-stone-500 font-mono">{e.date}</td>
                  <td className="py-3.5 px-4 font-semibold text-stone-900">{e.category}</td>
                  <td className="py-3.5 px-4 text-stone-550 max-w-xs truncate">{e.description}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-stone-900">PKR {e.amount.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="p-1.5 rounded-lg border border-stone-200 hover:border-red-350 hover:bg-red-50 text-stone-500 hover:text-red-650 transition-all cursor-pointer active:scale-95"
                      title="Remove Record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400 font-medium">
                    No operating costs logged. Click "Log Expense" to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Expense Dialog Slider */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            onClick={() => setIsFormOpen(false)}
            className="absolute inset-0 bg-stone-900/25 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-screen max-w-md bg-white shadow-2xl flex flex-col h-full z-10 border-l border-stone-200">
            <div className="px-6 py-5 border-b border-stone-150 flex items-center justify-between bg-stone-950 text-white">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider">Log Operating Cost</h3>
                <p className="text-[10px] text-stone-400 mt-0.5">Record operations or overhead expense</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Ledger Account *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Inventory">Inventory</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Software">Software</option>
                    <option value="Rent">Rent</option>
                    <option value="Utilities">Utilities</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Logged Amount (PKR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 350.00"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Description / Vendor Details *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details explaining the expense (e.g. Stripe transaction processing fees, domain hosting renewal...)"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 rounded-xl border border-stone-200 hover:border-stone-400 py-3 text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-stone-950 transition-all cursor-pointer text-center active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-stone-950 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-850 shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                >
                  Log Outlay <Plus className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
