import { NextResponse } from "next/server";
import { Op } from "sequelize";
import db from "../../../../../lib/db";
import { uploadToCloudinary } from "../../../../../lib/cloudinary";
import { authGuard } from "../../../../../lib/authGuard";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!db?.Product) {
      return NextResponse.json(
        { error: "Database service unavailable" },
        { status: 500 }
      );
    }

    const product = await db.Product.findOne({
      where: {
        [Op.or]: [{ id }, { slug: id }]
      },
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

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("GET Single Product Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product", details: error?.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication to update products
    const auth = await authGuard(req, "basic");
    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;

    if (!db?.Product) {
      return NextResponse.json(
        { error: "Database service unavailable" },
        { status: 500 }
      );
    }

    const product = await db.Product.findByPk(id);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    let {
      name,
      price,
      compareAtPrice,
      stock,
      description,
      details,
      images,
      sizes,
      colors,
      featured,
      status,
      categoryId,
      categoryName,
      sku
    } = body;

    // Process new images if Base64
    let updatedImages: string[] = [];
    if (Array.isArray(images)) {
      for (const img of images) {
        if (img && typeof img === "string" && img.startsWith("data:image/")) {
          const uploadResult = await uploadToCloudinary(img, {
            folder: "snoy/products"
          });
          updatedImages.push(uploadResult.url);
        } else if (img && typeof img === "string") {
          updatedImages.push(img);
        }
      }
    }

    // Resolve Category if categoryId changed
    let resolvedCategoryName = categoryName;
    if (categoryId && categoryId !== (product as any).categoryId && db.Category) {
      const categoryRecord = await db.Category.findByPk(categoryId);
      if (categoryRecord) {
        resolvedCategoryName = (categoryRecord as any).name;
      }
    }

    const updatePayload: any = {};
    if (name !== undefined) updatePayload.name = name.trim();
    if (price !== undefined) updatePayload.price = parseFloat(price);
    if (compareAtPrice !== undefined)
      updatePayload.compareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : null;
    if (stock !== undefined) updatePayload.stock = parseInt(stock, 10);
    if (description !== undefined) updatePayload.description = description.trim();
    if (details !== undefined) updatePayload.details = details;
    if (images !== undefined) updatePayload.images = updatedImages;
    if (sizes !== undefined) updatePayload.sizes = sizes;
    if (colors !== undefined) updatePayload.colors = colors;
    if (featured !== undefined) updatePayload.featured = Boolean(featured);
    if (status !== undefined) updatePayload.status = status;
    if (categoryId !== undefined) updatePayload.categoryId = categoryId;
    if (resolvedCategoryName !== undefined) updatePayload.categoryName = resolvedCategoryName;
    if (sku !== undefined) updatePayload.sku = sku;

    await product.update(updatePayload);

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("PUT Product Error:", error);
    return NextResponse.json(
      { error: "Failed to update product", details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication to delete products
    const auth = await authGuard(req, "basic");
    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;

    if (!db?.Product) {
      return NextResponse.json(
        { error: "Database service unavailable" },
        { status: 500 }
      );
    }

    const product = await db.Product.findByPk(id);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    await product.destroy();

    return NextResponse.json({
      success: true,
      message: `Product ${id} deleted successfully`
    });
  } catch (error: any) {
    console.error("DELETE Product Error:", error);
    return NextResponse.json(
      { error: "Failed to delete product", details: error?.message },
      { status: 500 }
    );
  }
}
