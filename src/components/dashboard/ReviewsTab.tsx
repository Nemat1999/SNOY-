"use client";

import React, { useState } from "react";
import { Star, Trash2, MessageSquare, CornerDownRight, X, Heart } from "lucide-react";
import { Product, Review } from "../../types";

interface ReviewsTabProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  triggerAlert: (text: string, type?: "success" | "info") => void;
}

export default function ReviewsTab({ products, setProducts, triggerAlert }: ReviewsTabProps) {
  const [selectedReview, setSelectedReview] = useState<{ productId: string; reviewId: string; author: string } | null>(null);
  const [replyText, setReplyText] = useState("");

  // Aggregate all reviews across all products
  const reviewsList: { product: Product; review: Review }[] = [];
  products.forEach((p) => {
    if (p.reviews) {
      p.reviews.forEach((r) => {
        reviewsList.push({ product: p, review: r });
      });
    }
  });

  // Sort by date (latest first)
  reviewsList.sort((a, b) => new Date(b.review.date).getTime() - new Date(a.review.date).getTime());

  const handleOpenReplyModal = (productId: string, reviewId: string, author: string, existingReply?: string) => {
    setSelectedReview({ productId, reviewId, author });
    setReplyText(existingReply || "");
  };

  const handleSaveReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;

    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === selectedReview.productId) {
          const updatedReviews = (p.reviews || []).map((r) =>
            r.id === selectedReview.reviewId ? { ...r, reply: replyText.trim() || undefined } : r
          );
          return { ...p, reviews: updatedReviews };
        }
        return p;
      })
    );

    triggerAlert(`Replied to ${selectedReview.author}'s review.`, "success");
    setSelectedReview(null);
    setReplyText("");
  };

  const handleDeleteReview = (productId: string, reviewId: string, author: string) => {
    if (confirm(`Are you sure you want to delete ${author}'s review?`)) {
      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          if (p.id === productId) {
            const updatedReviews = (p.reviews || []).filter((r) => r.id !== reviewId);
            // Recompute review count and rating optionally or keep simple
            const reviewCount = updatedReviews.length;
            const averageRating =
              reviewCount > 0
                ? Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
                : 5;
            return {
              ...p,
              reviews: updatedReviews,
              reviewCount,
              rating: averageRating,
            };
          }
          return p;
        })
      );
      triggerAlert("Review removed.", "info");
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-stone-950">
          Product Reviews & Feedback
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Monitor customer ratings, moderate feedback, and respond to garment reviews.
        </p>
      </div>

      {/* Reviews Grid */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] font-bold uppercase tracking-wider text-stone-400 bg-stone-50/50">
                <th className="py-3.5 px-4">Product Info</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4 w-96">Feedback Comment</th>
                <th className="py-3.5 px-4">Date Submitted</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviewsList.map(({ product, review }) => (
                <tr
                  key={review.id}
                  className="border-b border-stone-100 last:border-0 hover:bg-stone-50/40 transition-colors align-top"
                >
                  {/* Product Info */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-stone-150 bg-stone-50 shrink-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="max-w-[150px]">
                        <h4 className="font-bold text-stone-900 leading-tight truncate" title={product.name}>
                          {product.name}
                        </h4>
                        <p className="text-[10px] text-stone-400 mt-0.5 font-bold uppercase tracking-wider">
                          PKR {product.price}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Author Name */}
                  <td className="py-4 px-4 font-bold text-stone-850">{review.author}</td>

                  {/* Rating Stars */}
                  <td className="py-4 px-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"
                          }`}
                        />
                      ))}
                    </div>
                  </td>

                  {/* Comment Column */}
                  <td className="py-4 px-4 font-normal text-stone-600 leading-relaxed max-w-sm">
                    <p>{review.text}</p>

                    {review.reply && (
                      <div className="mt-2.5 ml-2 p-2.5 rounded-lg bg-stone-50 border-l border-stone-800 text-[10px] text-stone-600 flex gap-1.5 items-start">
                        <CornerDownRight className="h-3.5 w-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-stone-900 uppercase tracking-wider text-[8px] block leading-none mb-1">
                            Atelier Admin Response:
                          </span>
                          {review.reply}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Date Column */}
                  <td className="py-4 px-4 text-stone-500 font-medium">{review.date}</td>

                  {/* Action Buttons */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          handleOpenReplyModal(product.id, review.id, review.author, review.reply)
                        }
                        className="rounded-lg bg-stone-950 text-white font-bold uppercase tracking-wider text-[9px] px-2.5 py-1.5 hover:bg-stone-850 cursor-pointer active:scale-95 flex items-center gap-1 shadow-xs"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-stone-300" />
                        {review.reply ? "Edit Reply" : "Reply"}
                      </button>
                      <button
                        onClick={() => handleDeleteReview(product.id, review.id, review.author)}
                        className="p-2 rounded-lg border border-stone-200 hover:border-red-200 hover:bg-stone-50 text-stone-500 hover:text-red-500 transition-all cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {reviewsList.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-stone-450 font-medium">
                    No product reviews exist in the catalog yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Reply Modal dialog */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedReview(null)}
            className="absolute inset-0 bg-stone-900/35 backdrop-blur-xs"
          />

          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-stone-100 flex items-center justify-between bg-stone-950 text-white">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-stone-850 flex items-center justify-center text-rose-350">
                  <MessageSquare className="h-4 w-4 text-stone-300" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Reply to {selectedReview.author}
                  </h3>
                  <p className="text-[9px] text-stone-450 mt-0.5">Publish an official customer response.</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveReply}>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Your Response Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a thoughtful, helpful response..."
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:border-stone-400 focus:outline-none placeholder-stone-300 leading-relaxed resize-none"
                  />
                </div>
              </div>

              {/* Form Footer */}
              <div className="px-6 py-4.5 bg-stone-50 border-t border-stone-100 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-650 hover:bg-white cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-stone-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-850 cursor-pointer active:scale-95 shadow-sm"
                >
                  Publish Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
