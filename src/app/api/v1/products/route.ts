import { NextResponse } from "next/server";
import { Op } from "sequelize";
import db from "../../../../lib/db";
import { uploadToCloudinary } from "../../../../lib/cloudinary";
import { authGuard } from "../../../../lib/authGuard";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const categoryName = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (categoryName) {
      where.categoryName = { [Op.iLike]: `%${categoryName.trim()}%` };
    }

    if (featured !== null && featured !== undefined) {
      where.featured = featured === "true";
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search.trim()}%` } },
        { description: { [Op.iLike]: `%${search.trim()}%` } },
        { sku: { [Op.iLike]: `%${search.trim()}%` } }
      ];
    }

    if (!db?.Product) {
      return NextResponse.json({ success: true, products: [], total: 0 });
    }

    const { rows: products, count: total } = await db.Product.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      include: db.Category
        ? [
            {
              model: db.Category,
              as: "categoryDetails",
              attributes: ["id", "name", "description", "image"]
            }
          ]
        : []
    });

    return NextResponse.json({ success: true, total, products });
  } catch (error: any) {
    console.error("GET Products Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Require authentication for adding products
    const auth = await authGuard(req, "basic");
    if (auth.error) {
      return auth.error;
    }

    if (!db?.Product) {
      return NextResponse.json(
        { error: "Database service unavailable" },
        { status: 500 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let body: any = {};
    let uploadedImages: string[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      body.name = formData.get("name");
      body.categoryId = formData.get("categoryId");
      body.categoryName = formData.get("categoryName") || formData.get("category");
      body.price = parseFloat(formData.get("price") as string);
      body.compareAtPrice = formData.get("compareAtPrice")
        ? parseFloat(formData.get("compareAtPrice") as string)
        : null;
      body.stock = formData.get("stock")
        ? parseInt(formData.get("stock") as string, 10)
        : 100;
      body.description = formData.get("description");
      body.sku = formData.get("sku");
      body.featured = formData.get("featured") === "true";
      body.status = formData.get("status") || "active";

      try {
        body.details = formData.get("details")
          ? JSON.parse(formData.get("details") as string)
          : [];
        body.sizes = formData.get("sizes")
          ? JSON.parse(formData.get("sizes") as string)
          : [];
        body.colors = formData.get("colors")
          ? JSON.parse(formData.get("colors") as string)
          : [];
      } catch (e) {
        // Fallback if strings
        body.details = formData.get("details") ? [formData.get("details")] : [];
        body.sizes = formData.get("sizes") ? [formData.get("sizes")] : [];
        body.colors = [];
      }

      // Process uploaded files
      const imageFiles = formData.getAll("images") as (File | string)[];
      for (const item of imageFiles) {
        if (typeof item === "object" && item.size > 0) {
          const bytes = await item.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const uploadResult = await uploadToCloudinary(buffer, {
            folder: "snoy/products"
          });
          uploadedImages.push(uploadResult.url);
        } else if (typeof item === "string" && item.trim()) {
          uploadedImages.push(item.trim());
        }
      }
    } else {
      body = await req.json();
      const rawImages = body.images || (body.image ? [body.image] : []);

      for (const img of rawImages) {
        if (img && img.startsWith("data:image/")) {
          const uploadResult = await uploadToCloudinary(img, {
            folder: "snoy/products"
          });
          uploadedImages.push(uploadResult.url);
        } else if (img && typeof img === "string") {
          uploadedImages.push(img);
        }
      }
    }

    const {
      name,
      categoryId,
      categoryName,
      price,
      compareAtPrice,
      stock = 100,
      description = "",
      details = [],
      sizes = [],
      colors = [],
      featured = false,
      status = "active"
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (price === undefined || isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Valid product price is required" },
        { status: 400 }
      );
    }

    // Resolve Category information if categoryId is provided
    let categoryRecord = null;
    let finalCategoryId = categoryId || null;
    let finalCategoryName = categoryName || "";

    if (categoryId && db.Category) {
      categoryRecord = await db.Category.findByPk(categoryId);
      if (categoryRecord) {
        finalCategoryName = (categoryRecord as any).name;
      }
    } else if (categoryName && db.Category) {
      categoryRecord = await db.Category.findOne({
        where: { name: { [Op.iLike]: categoryName.trim() } }
      });
      if (categoryRecord) {
        finalCategoryId = (categoryRecord as any).id;
        finalCategoryName = (categoryRecord as any).name;
      }
    }

    const productId = `prod-${Date.now()}`;
    const baseSlug = slugify(name);
    const skuCode = body.sku || `SN-${baseSlug.substring(0, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    let finalSlug = baseSlug;

    // Ensure unique slug
    const existingSlug = await db.Product.findOne({ where: { slug: finalSlug } });
    if (existingSlug) {
      finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Create Product in DB
    const newProduct = await db.Product.create({
      id: productId,
      sku: skuCode,
      name: name.trim(),
      slug: finalSlug,
      categoryId: finalCategoryId,
      categoryName: finalCategoryName,
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      stock: parseInt(stock, 10),
      description: description ? description.trim() : "",
      details: Array.isArray(details) ? details : [details],
      images: uploadedImages,
      sizes: Array.isArray(sizes) ? sizes : [sizes],
      colors: Array.isArray(colors) ? colors : [],
      featured: Boolean(featured),
      status,
      rating: 5.0,
      reviewCount: 0
    });

    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Product Error:", error);
    return NextResponse.json(
      { error: "Failed to create product", details: error?.message },
      { status: 500 }
    );
  }
}
