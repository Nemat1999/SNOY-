import { NextResponse } from "next/server";
import db from "../../../../../lib/db";
import { uploadToCloudinary } from "../../../../../lib/cloudinary";
import { authGuard } from "../../../../../lib/authGuard";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication to update categories
    const auth = await authGuard(req, "basic");
    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;
    const body = await req.json();

    let { name, description, image } = body;

    if (image && image.startsWith("data:image/")) {
      // Upload updated image to Cloudinary categories folder
      const uploadResult = await uploadToCloudinary(image, {
        folder: "snoy/categories",
      });
      image = uploadResult.url;
    }

    if (!db?.Category) {
      return NextResponse.json(
        { error: "Database service unavailable" },
        { status: 500 }
      );
    }

    const category = await db.Category.findByPk(id);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (name && name.trim().toLowerCase() !== (category as any).name.toLowerCase()) {
      const existing = await db.Category.findOne({
        where: { name: name.trim() }
      });
      if (existing) {
        return NextResponse.json(
          { error: "Another category with this name already exists" },
          { status: 400 }
        );
      }
    }

    await category.update({
      ...(name ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(image !== undefined ? { image } : {}),
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("PUT Category Error:", error);
    return NextResponse.json(
      { error: "Failed to update category", details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication to delete categories
    const auth = await authGuard(req, "basic");
    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;

    if (!db?.Category) {
      return NextResponse.json(
        { error: "Database service unavailable" },
        { status: 500 }
      );
    }

    const category = await db.Category.findByPk(id);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    await category.destroy();

    return NextResponse.json({
      success: true,
      message: `Category ${id} deleted successfully`,
    });
  } catch (error: any) {
    console.error("DELETE Category Error:", error);
    return NextResponse.json(
      { error: "Failed to delete category", details: error?.message },
      { status: 500 }
    );
  }
}
