import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageSquare, Send, X, ArrowRight, User, ShoppingBag, Check } from "lucide-react";
import { CartItem, Product } from "../types";
import { PRODUCTS } from "../data";

interface AiStylistProps {
  cartItems: CartItem[];
  onAddToCart: (product: Product, size?: string, color?: { name: string; hex: string }) => void;
  recentlyViewed?: Product[];
}

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  recommendations?: Product[];
}

export default function AiStylist({ cartItems, onAddToCart, recentlyViewed = [] }: AiStylistProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewBadge, setHasNewBadge] = useState(false);

  // Trigger a new recommendation notification when cart changes
  useEffect(() => {
    if (cartItems.length > 0) {
      setHasNewBadge(true);
    }
  }, [cartItems.length]);

  // Initialize the stylist with an elegant, personalized welcome message based on the cart status
  useEffect(() => {
    if (messages.length === 0) {
      generateInitialMessage();
    }
  }, [cartItems]);

  const generateInitialMessage = () => {
    setIsTyping(true);
    setTimeout(() => {
      let welcomeText = "Good day. I am your Minimalist Wardrobe & Space Stylist. Let me help you assemble balanced, cohesive pairings.";
      let recs: Product[] = [];

      if (cartItems.length > 0) {
        const itemNames = cartItems.map((c) => c.product.name).join(" and ");
        welcomeText = `I noticed you added the ${itemNames} to your bag. That is an exceptional selection. To complement this, I have curated a few harmonious pairings for your consideration:`;
        
        // Dynamic smart suggestions based on what is in the cart
        const categories = cartItems.map((c) => c.product.category);
        if (categories.includes("Men's Clothing")) {
          // Suggest trench coat matching items or knitwear
          recs = PRODUCTS.filter((p) => p.id === "m5" || p.id === "m3" || p.id === "m2");
        } else if (categories.includes("Women's Clothing")) {
          // Suggest trousers or rib knit
          recs = PRODUCTS.filter((p) => p.id === "w4" || p.id === "w3" || p.id === "w1");
        } else if (categories.includes("Home Decor")) {
          // Suggest ceramics matching stone blocks
          recs = PRODUCTS.filter((p) => p.id === "h2" || p.id === "h4" || p.id === "h1");
        } else {
          recs = PRODUCTS.filter((p) => p.featured).slice(0, 3);
        }
      } else if (recentlyViewed.length > 0) {
        welcomeText = `I saw you were browsing the ${recentlyViewed[0].name}. It is characterized by high-grade material and clean geometries. Here are some options that align with its aesthetic profile:`;
        recs = PRODUCTS.filter((p) => p.category === recentlyViewed[0].category && p.id !== recentlyViewed[0].id).slice(0, 3);
      } else {
        welcomeText = "Welcome to our showroom. I specialize in building capsule wardrobes and choosing sculptural elements for modern spaces. What style of garment or home piece are you hoping to integrate today?";
        // Standard high-quality featured capsule items
        recs = PRODUCTS.filter((p) => p.featured).slice(0, 3);
      }

      setMessages([
        {
          id: "welcome",
          sender: "ai",
          text: welcomeText,
          recommendations: recs,
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    const newUserMessage: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userMsg,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    // Dynamic intelligent responses
    setTimeout(() => {
      let responseText = "Understood. The key to high-level minimalism is silhouette restraint and textural contrast. Pair matte structured elements with softer fluid wools.";
      let recs: Product[] = [];

      const query = userMsg.toLowerCase();

      if (query.includes("coat") || query.includes("winter") || query.includes("outerwear") || query.includes("jacket")) {
        responseText = "For structured outerwear, we focus on classical, tailored silhouettes. A heavy wool overcoat anchors a capsule wardrobe, giving height and architectural strength. Here are our premier coat and layering essentials:";
        recs = PRODUCTS.filter((p) => p.name.includes("Coat") || p.name.includes("Merino") || p.name.includes("Knit"));
      } else if (query.includes("dress") || query.includes("skirt") || query.includes("women")) {
        responseText = "Our women's collection emphasizes fluid drape and premium natural fabrics like sandwashed silk and organic linen. These pieces shift elegantly with movement. Here are my recommendations:";
        recs = PRODUCTS.filter((p) => p.category === "Women's Clothing" && (p.name.includes("Dress") || p.name.includes("Trousers") || p.name.includes("Coat")));
      } else if (query.includes("decor") || query.includes("home") || query.includes("room") || query.includes("living") || query.includes("vase")) {
        responseText = "To elevate a space, select sculptural, high-density accents over small clutter. Travertine marble, concrete task lights, and handmade stoneware introduce organic warmth while retaining a clean, serene environment. I suggest:";
        recs = PRODUCTS.filter((p) => p.category === "Home Decor");
      } else if (query.includes("shirt") || query.includes("tee") || query.includes("men")) {
        responseText = "A heavyweight, high-density cotton jersey tee provides clean shoulder structure that holds its shape. When paired with high-quality raw Japanese denim, it represents the ultimate clean capsule foundation. Consider these elements:";
        recs = PRODUCTS.filter((p) => p.category === "Men's Clothing" && (p.name.includes("Tee") || p.name.includes("Denim") || p.name.includes("Overshirt")));
      } else {
        responseText = "Indeed. Integrating high-craft materials like travertine, virgin wool, and mulberry silk creates visual complexity without adding color noise. I have selected these core versatile items from our catalog:";
        recs = PRODUCTS.filter((p) => p.featured).slice(0, 3);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: responseText,
          recommendations: recs,
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const [addedIds, setAddedIds] = useState<string[]>([]);
  const handleAddRecToCart = (product: Product) => {
    const defaultSize = product.sizes?.[0];
    const defaultColor = product.colors?.[0];
    onAddToCart(product, defaultSize, defaultColor);

    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 2000);
  };

  return (
    <>
      {/* Floating trigger button in the bottom-right */}
      <button
        id="ai-stylist-trigger"
        onClick={() => {
          setIsOpen(true);
          setHasNewBadge(false);
        }}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-stone-950 text-white shadow-xl hover:bg-stone-850 transition-all hover:scale-105 active:scale-95 group"
      >
        <Sparkles className="h-5.5 w-5.5 animate-pulse text-amber-200 group-hover:rotate-12 transition-transform" />
        {hasNewBadge && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] font-bold text-white items-center justify-center">1</span>
          </span>
        )}
      </button>

      {/* Stylist Side Panel Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-stone-900/30 backdrop-blur-xs"
            />

            <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 32, stiffness: 300 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full"
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-950 text-white">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-5 w-5 text-amber-300" />
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider">
                        Aesthetic AI Assistant
                      </h2>
                      <p className="text-[10px] text-stone-400 mt-0.5">Capsule Wardrobe & Interior Curator</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-1 text-stone-400 hover:bg-white/10 hover:text-white transition-all active:scale-90"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Messages Panel */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-stone-50/50">
                  {messages.map((msg) => (
                    <div key={msg.id} className="space-y-2.5">
                      {/* Message Bubble */}
                      <div className={`flex gap-3 items-start ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                        {/* Avatar */}
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                          msg.sender === "ai" ? "bg-stone-950 text-amber-200" : "bg-stone-200 text-stone-700"
                        }`}>
                          {msg.sender === "ai" ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </div>

                        {/* Content */}
                        <div className={`max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                          msg.sender === "ai"
                            ? "bg-white border border-stone-100 text-stone-800 rounded-tl-none font-normal"
                            : "bg-stone-900 text-white rounded-tr-none font-medium"
                        }`}>
                          {msg.text}
                        </div>
                      </div>

                      {/* Curated Recommendations inline cards */}
                      {msg.recommendations && msg.recommendations.length > 0 && (
                        <div className="ml-11 pl-1 space-y-3">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                            Suggested Capsule Pairings:
                          </span>
                          <div className="space-y-2.5">
                            {msg.recommendations.map((rec) => (
                              <div
                                key={rec.id}
                                className="flex gap-3 bg-white rounded-xl p-3 border border-stone-100 hover:border-stone-300 transition-all shadow-xs group"
                              >
                                <img
                                  src={rec.images[0]}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  className="h-14 w-11 object-cover rounded-lg bg-stone-50 border shrink-0"
                                />
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                  <div>
                                    <h4 className="text-[11px] font-bold text-stone-800 line-clamp-1">
                                      {rec.name}
                                    </h4>
                                    <p className="text-[10px] text-stone-500 font-medium">${rec.price}</p>
                                  </div>
                                  <div className="flex items-center justify-end mt-1.5">
                                    <button
                                      onClick={() => handleAddRecToCart(rec)}
                                      className="flex items-center gap-1 text-[10px] font-bold text-stone-900 hover:text-stone-700 transition-all uppercase tracking-wider"
                                    >
                                      {addedIds.includes(rec.id) ? (
                                        <span className="text-emerald-600 flex items-center gap-1">
                                          <Check className="h-3 w-3 stroke-[2.5]" /> Added
                                        </span>
                                      ) : (
                                        <>
                                          Add to Bag <ArrowRight className="h-2.5 w-2.5" />
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex gap-3 items-center ml-2.5">
                      <div className="h-8 w-8 rounded-full bg-stone-950 text-amber-200 flex items-center justify-center shrink-0">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="flex gap-1 bg-white border border-stone-100 px-4 py-3 rounded-2xl rounded-tl-none">
                        <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestions chips footer */}
                <div className="px-6 py-3 bg-stone-50/70 border-t border-stone-100 flex gap-2 overflow-x-auto whitespace-nowrap">
                  <button
                    onClick={() => {
                      setInputValue("Suggest a winter coat outfit");
                    }}
                    className="text-[10px] font-semibold text-stone-600 bg-white border border-stone-200 px-3 py-1.5 rounded-full hover:border-stone-400 transition-all shadow-2xs"
                  >
                    🧥 Winter Coat Capsule
                  </button>
                  <button
                    onClick={() => {
                      setInputValue("Curate minimal living room decor");
                    }}
                    className="text-[10px] font-semibold text-stone-600 bg-white border border-stone-200 px-3 py-1.5 rounded-full hover:border-stone-400 transition-all shadow-2xs"
                  >
                    🏺 Ceramic & Stone Decor
                  </button>
                  <button
                    onClick={() => {
                      setInputValue("What women's garments drape well?");
                    }}
                    className="text-[10px] font-semibold text-stone-600 bg-white border border-stone-200 px-3 py-1.5 rounded-full hover:border-stone-400 transition-all shadow-2xs"
                  >
                    👗 Drape & Silk Dress
                  </button>
                </div>

                {/* Input box */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-stone-100 flex gap-2 bg-white">
                  <input
                    type="text"
                    placeholder="Inquire about styling, pairings, capsuling..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-stone-950 p-2.5 text-white hover:bg-stone-850 transition-all active:scale-95"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
