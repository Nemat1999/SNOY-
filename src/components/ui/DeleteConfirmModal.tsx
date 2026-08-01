"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  itemName?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error("Deletion error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isDeleting ? onClose : undefined}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative z-10 w-full max-w-md rounded-3xl bg-white border border-stone-200/80 p-6 shadow-2xl space-y-5"
          >
            {/* Header Area */}
            <div className="flex justify-between items-start">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 border border-red-200/60 text-red-600">
                <AlertTriangle className="h-5.5 w-5.5" />
              </div>
              {!isDeleting && (
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Content text */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                {title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                {message}
              </p>
              {itemName && (
                <div className="rounded-xl bg-stone-100/80 border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 font-semibold font-mono break-all">
                  {itemName}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50 py-3 text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-stone-900 transition-all cursor-pointer text-center active:scale-98 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-red-600/20 hover:shadow-lg transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Confirm
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
