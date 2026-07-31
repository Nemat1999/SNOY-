import { NextResponse } from "next/server";
import db from "../../../../lib/db";
import { uploadToCloudinary } from "../../../../lib/cloudinary";
import { authGuard } from "../../../../lib/authGuard";

export async function GET() {
  try {
    if (db?.Category) {
      const categories = await db.Category.findAll({
        order: [["createdAt", "DESC"]],
      });
      return NextResponse.json({ success: true, categories });
    }
    return NextResponse.json({ success: true, categories: [] });
  } catch (error: any) {
    console.error("GET Categories Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Require authentication to create categories
    const auth = await authGuard(req, "basic");
    if (auth.error) {
      return auth.error;
    }

    const contentType = req.headers.get("content-type") || "";

    let name = "";
    let description = "";
    let imageUrl = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      name = (formData.get("name") as string) || "";
      description = (formData.get("description") as string) || "";
      const imageFile = formData.get("image") as File | null;

      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        // Upload picture directly to Cloudinary inside the "snoy/categories" folder
        const uploadResult = await uploadToCloudinary(buffer, {
          folder: "snoy/categories",
        });
        imageUrl = uploadResult.url;
      }
    } else {
      const body = await req.json();
      name = body.name || "";
      description = body.description || "";
      let imageInput = body.image || body.imageUrl || "";

      if (imageInput && imageInput.startsWith("data:image/")) {
        // Base64 image provided: upload to Cloudinary inside "snoy/categories" folder
        const uploadResult = await uploadToCloudinary(imageInput, {
          folder: "snoy/categories",
        });
        imageUrl = uploadResult.url;
      } else {
        imageUrl = imageInput;
      }
    }

    if (!name.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    if (!db?.Category) {
      return NextResponse.json(
        { error: "Database service unavailable" },
        { status: 500 }
      );
    }

    // Check if category with exact name already exists
    const existing = await db.Category.findOne({
      where: { name: name.trim() }
    });

    if (existing) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 400 }
      );
    }

    const categoryId = `cat-${Date.now()}`;
    const created = await db.Category.create({
      id: categoryId,
      name: name.trim(),
      description: description.trim(),
      image: imageUrl,
    });

    return NextResponse.json(
      { success: true, category: created },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Category Error:", error);
    return NextResponse.json(
      { error: "Failed to create category", details: error?.message },
      { status: 500 }
    );
  }
}
