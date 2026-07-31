import { Product, CategoryItem, ExpenseItem, Order, DiscountCoupon } from "./types";

export const PRODUCTS: Product[] = [
  // --- MEN'S CLOTHING ---
  {
    id: "m1",
    name: "Minimalist Wool Trench Coat",
    category: "Men's Clothing",
    price: 320,
    description: "A tailored, single-breasted overcoat crafted from a heavy, premium wool blend. Designed with clean architectural lines, a concealed placket, and a soft satin lining for effortless layering during cooler seasons.",
    rating: 4.8,
    reviewCount: 42,
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=600&auto=format&fit=crop"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Charcoal", hex: "#2f3542" },
      { name: "Oatmeal", hex: "#dcdde1" },
      { name: "Camel", hex: "#c4a482" }
    ],
    details: [
      "75% virgin wool, 25% polyamide exterior",
      "100% viscose silk-touch inner lining",
      "Concealed button-front closure for a clean profile",
      "Two deep exterior welt pockets, two internal breast pockets",
      "Dry clean only"
    ],
    featured: true,
    reviews: [
      { id: "r1", author: "Ethan W.", rating: 5, text: "Absolutely stunning coat. The wool feels incredibly soft yet dense enough to block the wind. Beautiful tailoring.", date: "2026-06-10" },
      { id: "r2", author: "Marcus K.", rating: 4, text: "Fits perfectly in the shoulders. Very sleek, perfect for work or casual evening outs.", date: "2026-05-28" }
    ]
  },
  {
    id: "m2",
    name: "Organic Heavyweight Tee",
    category: "Men's Clothing",
    price: 48,
    description: "Constructed from 280gsm organic Supima cotton, this t-shirt offers a substantial weight and structured, boxy fit. Garment-dyed for a rich depth of color and a broken-in softness that improves with every wash.",
    rating: 4.7,
    reviewCount: 118,
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600&auto=format&fit=crop"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Off-White", hex: "#f5f5f0" },
      { name: "Sage", hex: "#8a9a86" },
      { name: "Ink Black", hex: "#1e1e24" }
    ],
    details: [
      "100% GOTS-certified organic Supima cotton",
      "Heavyweight 280gsm knit fabric",
      "Ribbed crewneck with double-needle stitching",
      "Pre-shrunk to prevent shrinking",
      "Made in Japan"
    ],
    featured: true,
    reviews: [
      { id: "r3", author: "Liam S.", rating: 5, text: "The weight on this tee is amazing. It hangs beautifully and feels incredibly robust.", date: "2026-07-02" }
    ]
  },
  {
    id: "m3",
    name: "Japanese Selvedge Denim",
    category: "Men's Clothing",
    price: 185,
    description: "Woven on vintage loom shuttles in Kojima, Okayama, these slim-straight jeans feature 14oz raw indigo selvedge denim. Over time, they will wear down to create a custom blueprint of your daily life.",
    rating: 4.9,
    reviewCount: 56,
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop"
    ],
    sizes: ["30", "31", "32", "33", "34", "36"],
    colors: [
      { name: "Indigo Raw", hex: "#1c2e4a" }
    ],
    details: [
      "100% long-staple cotton raw selvedge denim",
      "14oz heavyweight fabric from Okayama mills",
      "Classic red line selvedge ID on cuff",
      "Custom branded copper rivets and button fly",
      "Soak before washing, expect slight shrinkage"
    ],
    reviews: [
      { id: "r4", author: "Daniel H.", rating: 5, text: "True artisan quality. The starch is stiff initially but they break in beautifully. Absolutely worth the price.", date: "2026-06-15" }
    ]
  },
  {
    id: "m4",
    name: "Minimalist Linen Overshirt",
    category: "Men's Clothing",
    price: 95,
    description: "The ideal layer for warmer days, constructed from Belgian organic flax linen. Features a relaxed silhouette with two chest utility pockets and a straight hem, making it perfect to wear open over a tee.",
    rating: 4.5,
    reviewCount: 29,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Flax Sand", hex: "#ded0b6" },
      { name: "Navy Blue", hex: "#1f2937" }
    ],
    details: [
      "100% Belgian organic flax linen",
      "Highly breathable, moisture-wicking weave",
      "Two button-down chest pockets",
      "Natural corozo wood buttons",
      "Machine wash cold, air dry"
    ],
    reviews: [
      { id: "r5", author: "Alex M.", rating: 4, text: "Great fabric and relaxed cut. Perfect for warm summer nights.", date: "2026-07-01" }
    ]
  },
  {
    id: "m5",
    name: "Premium Merino Mock-Neck",
    category: "Men's Clothing",
    price: 135,
    description: "Knitted from ultra-fine 19.5 micron merino wool, this sweater combines thermal efficiency with an exceptionally soft hand-feel. Features a refined low mock-neck and ribbed cuffs.",
    rating: 4.6,
    reviewCount: 34,
    images: [
      "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Heather Gray", hex: "#a4b0be" },
      { name: "Midnight Black", hex: "#111215" }
    ],
    details: [
      "100% extra-fine Australian Merino wool",
      "Subtle 12-gauge knit construction",
      "Ribbed mock neck, cuffs, and hem",
      "Naturally odor-resistant and temperature regulating",
      "Hand wash cold, dry flat"
    ]
  },

  // --- WOMEN'S CLOTHING ---
  {
    id: "w1",
    name: "Classic Belted Trench Coat",
    category: "Women's Clothing",
    price: 295,
    description: "An elegant, double-breasted trench coat tailored from water-resistant cotton gabardine. Detailed with storm flaps, a traditional gun flap, shoulder epaulets, and a self-tie belt to cinch the waist.",
    rating: 4.9,
    reviewCount: 65,
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600&auto=format&fit=crop"
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Beige Khaki", hex: "#e5d4c0" },
      { name: "Sage", hex: "#8da399" }
    ],
    details: [
      "100% cotton gabardine weave",
      "Satin weave fluid lining",
      "Double-breasted front with 10 horn buttons",
      "Detachable buckled belt and wrist straps",
      "Dry clean only"
    ],
    featured: true,
    reviews: [
      { id: "rw1", author: "Sophia V.", rating: 5, text: "Absolutely gorgeous. The tailoring is flawless, the fabric has a nice weight, and it repels light rain effortlessly.", date: "2026-06-20" },
      { id: "rw2", author: "Amelie L.", rating: 5, text: "A timeless piece. The sand color goes with everything, and the waist cinch is incredibly flattering.", date: "2026-05-14" }
    ]
  },
  {
    id: "w2",
    name: "Silk Drape Wrap Dress",
    category: "Women's Clothing",
    price: 245,
    description: "A fluid, minimalist wrap dress cut from sandwashed mulberry silk. This dress falls gracefully on the body, featuring a deep V-neckline, subtle bell sleeves, and an adjustable waist tie.",
    rating: 4.8,
    reviewCount: 38,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop"
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Olive Green", hex: "#556b2f" },
      { name: "Sand Champagne", hex: "#ecd4be" }
    ],
    details: [
      "100% sandwashed Mulberry Silk (16 momme)",
      "V-neck with dynamic internal security snap button",
      "Self-tie belt for custom waist cinching",
      "Gently flared skirt with mid-calf length hem",
      "Dry clean recommended"
    ],
    featured: true,
    reviews: [
      { id: "rw3", author: "Isabella G.", rating: 5, text: "The fabric feels like absolute butter. Moves so beautifully when I walk.", date: "2026-07-04" }
    ]
  },
  {
    id: "w3",
    name: "Tailored Cream Trousers",
    category: "Women's Clothing",
    price: 140,
    description: "Designed to sit high on the waist, these trousers feature crisp front pleats and a relaxed wide leg. Tailored from a premium linen-wool blend for a breathable drape all year round.",
    rating: 4.6,
    reviewCount: 52,
    images: [
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=600&auto=format&fit=crop"
    ],
    sizes: ["0", "2", "4", "6", "8", "10"],
    colors: [
      { name: "Cream Alabaster", hex: "#fdfbf7" },
      { name: "Charcoal", hex: "#353b48" }
    ],
    details: [
      "60% linen, 40% merino wool",
      "High-rise with clean extended tab closure",
      "Front knife pleats and pressed creases",
      "Two side slash pockets, one rear welt pocket",
      "Dry clean"
    ],
    reviews: [
      { id: "rw4", author: "Elena M.", rating: 4, text: "Very comfortable and perfect drape. Needs to be hemmed if you are shorter, but overall excellent quality.", date: "2026-06-12" }
    ]
  },
  {
    id: "w4",
    name: "Ribbed Mock-Neck Knit",
    category: "Women's Clothing",
    price: 110,
    description: "A fitted knit sweater featuring a wide, flat ribbed texture. Crafted from fine organic cotton and cashmere blend, it is a versatile wardrobe foundation that layers seamlessly.",
    rating: 4.7,
    reviewCount: 47,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Cream", hex: "#f6f3eb" },
      { name: "Espresso", hex: "#2b1a1a" }
    ],
    details: [
      "90% organic long-staple cotton, 10% premium cashmere",
      "Elongated sleeves with refined split cuff detail",
      "Stretchy, medium-weight ribbed knit",
      "Comfortable fitted mock-neck collar",
      "Hand wash, dry flat"
    ],
    reviews: [
      { id: "rw5", author: "Olivia S.", rating: 5, text: "It's so soft! Perfect thickness to wear alone or under a blazer.", date: "2026-06-28" }
    ]
  },
  {
    id: "w5",
    name: "Minimalist Poplin Shirtdress",
    category: "Women's Clothing",
    price: 155,
    description: "An elegant take on a masculine classic. This midi shirtdress features a relaxed straight cut, an exaggerated pointed collar, dropped shoulders, and a curving side-split shirttail hem.",
    rating: 4.4,
    reviewCount: 22,
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=600&auto=format&fit=crop"
    ],
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Crisp White", hex: "#ffffff" },
      { name: "Pinstripe Blue", hex: "#adc7e6" }
    ],
    details: [
      "100% extra-long staple Egyptian cotton poplin",
      "Cool-touch, structured fabric that resists excessive wrinkling",
      "Full button-down placket with mother-of-pearl buttons",
      "Oversized cuffs with dual-button fasteners",
      "Machine wash warm, iron warm"
    ]
  },

  // --- HOME DECOR ---
  {
    id: "h1",
    name: "Handmade Ribbed Ceramic Vase",
    category: "Home Decor",
    price: 65,
    description: "Individually wheel-thrown by ceramicists, this stoneware vase boasts a matte-textured finish and delicate horizontal ribbing. Its narrow mouth is ideal for single botanical stems or dried reeds.",
    rating: 4.9,
    reviewCount: 88,
    images: [
      "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=600&auto=format&fit=crop"
    ],
    details: [
      "High-fire organic speckled stoneware",
      "Raw textured finish on exterior, water-tight glazed interior",
      "Individually hand-crafted; slight variations in height and glaze occur",
      "Dimensions: 8.5\" H x 4\" W",
      "Wipe clean with a damp cloth"
    ],
    featured: true,
    reviews: [
      { id: "rh1", author: "Clara J.", rating: 5, text: "Stunning craftsmanship. The texture is gorgeous and adds a wonderful organic feel to my shelves.", date: "2026-06-15" },
      { id: "rh2", author: "Julian R.", rating: 5, text: "Heavy and durable. The matte finish is so elegant under natural light.", date: "2026-05-30" }
    ]
  },
  {
    id: "h2",
    name: "Travertine Stone Pedestal Set",
    category: "Home Decor",
    price: 110,
    description: "Carved from premium Italian travertine marble, this set of two nesting display blocks highlights the natural porous beauty of volcanic limestone. Ideal for displaying perfume bottles, candles, or jewelry.",
    rating: 4.8,
    reviewCount: 31,
    images: [
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600&auto=format&fit=crop"
    ],
    details: [
      "100% natural Italian travertine stone",
      "Honed matte texture with natural unsealed fissures",
      "Set includes two pedestals (Small: 3\"x3\"x2\", Large: 4\"x4\"x4\")",
      "Anti-scratch protective felt pads on underside",
      "Do not expose to oils or dark acidic liquids"
    ],
    featured: true,
    reviews: [
      { id: "rh3", author: "Maya P.", rating: 5, text: "Beautiful travertine texture. Heavy, premium, and look gorgeous on my vanity.", date: "2026-07-09" }
    ]
  },
  {
    id: "h3",
    name: "Bouclé Textured Accent Cushion",
    category: "Home Decor",
    price: 54,
    description: "Woven with dynamic curly loops of alpaca and wool blend, this cushion cover provides an inviting tactile texture to minimalist furniture. Includes a premium RDS-certified down feather insert.",
    rating: 4.7,
    reviewCount: 45,
    images: [
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=600&auto=format&fit=crop"
    ],
    details: [
      "Cover: 40% wool, 30% alpaca, 30% cotton boucle fabric",
      "Includes 100% RDS-certified duck down feather insert",
      "Concealed YKK zipper on reverse bottom edge",
      "Dimensions: 20\" x 20\" square",
      "Dry clean cushion cover only"
    ],
    reviews: [
      { id: "rh4", author: "Lucas E.", rating: 4, text: "Very soft and thick bouclé. The insert is nice and fluffy, retains shape well.", date: "2026-06-25" }
    ]
  },
  {
    id: "h4",
    name: "Sculptural Matte Desk Lamp",
    category: "Home Decor",
    price: 165,
    description: "An architectural lighting piece featuring a heavy concrete cylinder base, a slender steel stem, and an adjustable domed head. Emits a soft, glare-free downward light perfect for a curated workspace.",
    rating: 4.9,
    reviewCount: 19,
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop"
    ],
    details: [
      "Base: Solid hand-poured raw concrete",
      "Shade/Stem: Powder-coated steel in matte charcoal black",
      "Adjustable shade head (30-degree rotation)",
      "Premium woven textile cord (6ft length) with inline rocker switch",
      "Compatible with dimmable E12 base bulb (included)"
    ],
    reviews: [
      { id: "rh5", author: "Naomi T.", rating: 5, text: "A work of art. Provides the perfect ambient lighting for my study.", date: "2026-07-05" }
    ]
  },
  {
    id: "h5",
    name: "Stoneware Footed Planter",
    category: "Home Decor",
    price: 45,
    description: "A geometric, elevated planter featuring a cylindrical body resting on three block feet. The speckled clay body has a subtle grain, offering a wonderful tactile contrast to glossy green plant foliage.",
    rating: 4.6,
    reviewCount: 39,
    images: [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600&auto=format&fit=crop"
    ],
    details: [
      "Speckled, sandy stoneware clay",
      "Drainage hole with removable rubber silicone plug included",
      "Cylindrical body with three integrated block-foot supports",
      "Dimensions: 6.5\" Inner Diameter x 7\" Height",
      "Suitable for indoor and covered outdoor use"
    ],
    reviews: [
      { id: "rh6", author: "Benjamin F.", rating: 5, text: "Excellent planter. The feet elevate the plants beautifully. Great drainage solution.", date: "2026-06-18" }
    ]
  }
];

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: "cat-1",
    name: "Men's Clothing",
    description: "Tailored garments, classic shapes, and high-density textures designed for durability.",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "cat-2",
    name: "Women's Clothing",
    description: "Structured tailoring and organic cotton layers displaying simple sculptural elegance.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "cat-3",
    name: "Home Decor",
    description: "Architectural travertine elements, handmade stoneware, and curated ambient home decorations.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop",
  },
];

export const DEFAULT_EXPENSES: ExpenseItem[] = [
  {
    id: "exp-1",
    date: "2026-07-10",
    category: "Inventory",
    amount: 1200,
    description: "Restocked heavyweight wool outerwear and travertine stone blocks",
  },
  {
    id: "exp-2",
    date: "2026-07-12",
    category: "Marketing",
    amount: 450,
    description: "Social media visual catalog sponsored advertising",
  },
  {
    id: "exp-3",
    date: "2026-07-14",
    category: "Logistics",
    amount: 280,
    description: "Eco-friendly recyclable cardboard box shipping supplies",
  },
  {
    id: "exp-4",
    date: "2026-07-15",
    category: "Software",
    amount: 85,
    description: "Domain name hosting and secure database server subscriptions",
  },
  {
    id: "exp-5",
    date: "2026-07-16",
    category: "Salaries",
    amount: 950,
    description: "Fulfillment center staffing weekly shifts",
  },
];

export const DEFAULT_ORDERS: Order[] = [
  {
    id: "ord-8291",
    date: "2026-07-15",
    items: [
      {
        productName: "Minimalist Wool Trench Coat",
        price: 320,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
        size: "M",
        color: "Charcoal",
      },
      {
        productName: "Organic Heavyweight Tee",
        price: 48,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
        size: "L",
        color: "Off-White",
      },
    ],
    subtotal: 416,
    shipping: 0,
    total: 416,
    shippingAddress: {
      fullName: "Liam Anderson",
      email: "liam.anderson@example.com",
      address: "148 West 23rd St, Apt 4B",
      city: "New York",
      postalCode: "10011",
      country: "United States",
    },
    status: "Delivered",
  },
  {
    id: "ord-4721",
    date: "2026-07-16",
    items: [
      {
        productName: "Japanese Selvedge Denim",
        price: 185,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop",
        size: "32",
        color: "Indigo Raw",
      },
    ],
    subtotal: 185,
    shipping: 15,
    total: 200,
    shippingAddress: {
      fullName: "Sophia Martinez",
      email: "sophia.mtz@example.com",
      address: "782 Peachtree St NE",
      city: "Atlanta",
      postalCode: "30308",
      country: "United States",
    },
    status: "Shipped",
  },
  {
    id: "ord-3942",
    date: "2026-07-17",
    items: [
      {
        productName: "Travertine Stone Pedestal Set",
        price: 110,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600&auto=format&fit=crop",
      },
    ],
    subtotal: 220,
    shipping: 0,
    total: 220,
    shippingAddress: {
      fullName: "Marcus Vance",
      email: "marcus.v@example.com",
      address: "1205 Pine St",
      city: "Seattle",
      postalCode: "98101",
      country: "United States",
    },
    status: "Processing",
  },
  {
    id: "ord-9012",
    date: "2026-07-12",
    items: [
      {
        productName: "Sculptural Matte Desk Lamp",
        price: 165,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop",
      },
      {
        productName: "Handmade Ribbed Ceramic Vase",
        price: 65,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600&auto=format&fit=crop",
      }
    ],
    subtotal: 230,
    shipping: 0,
    total: 230,
    shippingAddress: {
      fullName: "Elena Rostova",
      email: "elena.rostova@example.com",
      address: "248 Commonwealth Ave",
      city: "Boston",
      postalCode: "02116",
      country: "United States",
    },
    status: "Delivered",
  },
  {
    id: "ord-7154",
    date: "2026-07-14",
    items: [
      {
        productName: "Premium Merino Mock-Neck",
        price: 135,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop",
        size: "M",
        color: "Heather Gray",
      },
      {
        productName: "Handmade Ribbed Ceramic Vase",
        price: 65,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600&auto=format&fit=crop",
      }
    ],
    subtotal: 200,
    shipping: 0,
    total: 200,
    shippingAddress: {
      fullName: "Julian Krogh",
      email: "julian.krogh@example.com",
      address: "612 N Michigan Ave",
      city: "Chicago",
      postalCode: "60611",
      country: "United States",
    },
    status: "Delivered",
  },
  {
    id: "ord-6190",
    date: "2026-07-17",
    items: [
      {
        productName: "Handmade Ribbed Ceramic Vase",
        price: 65,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600&auto=format&fit=crop",
      },
      {
        productName: "Organic Heavyweight Tee",
        price: 48,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
        size: "S",
        color: "Ink Black",
      }
    ],
    subtotal: 113,
    shipping: 10,
    total: 123,
    shippingAddress: {
      fullName: "Yuki Tanaka",
      email: "yuki.tanaka@example.com",
      address: "2201 Fillmore St",
      city: "San Francisco",
      postalCode: "94115",
      country: "United States",
    },
    status: "Processing",
  },
  {
    id: "ord-1042",
    date: "2026-07-18",
    items: [
      {
        productName: "Organic Heavyweight Tee",
        price: 48,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
        size: "M",
        color: "Sage",
      }
    ],
    subtotal: 48,
    shipping: 10,
    total: 58,
    shippingAddress: {
      fullName: "Emily Watson",
      email: "emily.w@example.com",
      address: "742 Evergreen Terrace",
      city: "Springfield",
      postalCode: "62704",
      country: "United States",
    },
    status: "Processing",
  },
  {
    id: "ord-2983",
    date: "2026-07-17",
    items: [
      {
        productName: "Minimalist Wool Trench Coat",
        price: 320,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
        size: "L",
        color: "Camel",
      }
    ],
    subtotal: 320,
    shipping: 0,
    total: 320,
    shippingAddress: {
      fullName: "David Kim",
      email: "david.kim@example.com",
      address: "1042 Wilshire Blvd",
      city: "Los Angeles",
      postalCode: "90024",
      country: "United States",
    },
    status: "Shipped",
  },
  {
    id: "ord-5591",
    date: "2026-07-15",
    items: [
      {
        productName: "Minimalist Wool Trench Coat",
        price: 320,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
        size: "M",
        color: "Charcoal",
      },
      {
        productName: "Classic Belted Trench Coat",
        price: 295,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop",
        size: "S",
        color: "Beige Khaki",
      },
      {
        productName: "Silk Drape Wrap Dress",
        price: 245,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop",
        size: "M",
        color: "Olive Green",
      }
    ],
    subtotal: 1180,
    shipping: 0,
    total: 1180,
    shippingAddress: {
      fullName: "Chloe Dupont",
      email: "chloe.dupont@example.com",
      address: "45 Rue de la Harpe",
      city: "Paris",
      postalCode: "75005",
      country: "France",
    },
    status: "Delivered",
  },
  {
    id: "ord-4011",
    date: "2026-07-18",
    items: [
      {
        productName: "Sculptural Matte Desk Lamp",
        price: 165,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop",
      }
    ],
    subtotal: 165,
    shipping: 15,
    total: 180,
    shippingAddress: {
      fullName: "Mateo Ricci",
      email: "mateo.ricci@example.com",
      address: "Via dei Condotti 86",
      city: "Rome",
      postalCode: "00187",
      country: "Italy",
    },
    status: "Processing",
  },
  {
    id: "ord-7832",
    date: "2026-07-16",
    items: [
      {
        productName: "Tailored Cream Trousers",
        price: 140,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=600&auto=format&fit=crop",
        size: "4",
        color: "Cream Alabaster",
      },
      {
        productName: "Handmade Ribbed Ceramic Vase",
        price: 65,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600&auto=format&fit=crop",
      }
    ],
    subtotal: 205,
    shipping: 10,
    total: 215,
    shippingAddress: {
      fullName: "Sarah Jenkins",
      email: "sarah.j@example.com",
      address: "88 Baker St",
      city: "London",
      postalCode: "W1U 6SG",
      country: "United Kingdom",
    },
    status: "Shipped",
  },
  {
    id: "ord-8921",
    date: "2026-07-14",
    items: [
      {
        productName: "Bouclé Textured Accent Cushion",
        price: 54,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=600&auto=format&fit=crop",
      }
    ],
    subtotal: 54,
    shipping: 10,
    total: 64,
    shippingAddress: {
      fullName: "James O'Connor",
      email: "james.oc@example.com",
      address: "14 Merrion Square",
      city: "Dublin",
      postalCode: "D02",
      country: "Ireland",
    },
    status: "Delivered",
  }
];

export const DEFAULT_COUPONS: DiscountCoupon[] = [
  { code: "MINIMAL20", type: "percentage", value: 20, minSpend: 0, active: true, usageCount: 42, expiryDate: "2026-12-31" },
  { code: "FREESHIP", type: "percentage", value: 5, minSpend: 150, active: true, usageCount: 108, expiryDate: "2026-10-15" },
  { code: "WELCOME10", type: "percentage", value: 10, minSpend: 50, active: true, usageCount: 254, expiryDate: "2026-12-31" },
  { code: "SNOY30", type: "percentage", value: 30, minSpend: 100, active: false, usageCount: 15, expiryDate: "2026-06-30" },
  { code: "ARCHIVE15", type: "percentage", value: 15, minSpend: 0, active: true, usageCount: 0, expiryDate: "2026-08-31" },
];

