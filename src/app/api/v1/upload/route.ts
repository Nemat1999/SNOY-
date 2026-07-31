import { NextResponse } from "next/server";
import { uploadToCloudinary } from "../../../../lib/cloudinary";
import { authGuard } from "../../../../lib/authGuard";

export async function POST(req: Request) {
  try {
    // Require authentication for file uploads
    const auth = await authGuard(req, "basic");
    if (auth.error) {
      return auth.error;
    }

    const contentType = req.headers.get("content-type") || "";

    let fileBuffer: Buffer | string;
    let folder = "snoy/categories"; // Default folder for categories

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const targetFolder = formData.get("folder") as string | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided in form data" },
          { status: 400 }
        );
      }

      if (targetFolder) {
        folder = targetFolder.startsWith("snoy/") ? targetFolder : `snoy/${targetFolder}`;
      }

      const bytes = await file.arrayBuffer();
      fileBuffer = Buffer.from(bytes);
    } else {
      // JSON body with base64 string
      const body = await req.json();
      const { file, folder: targetFolder } = body;

      if (!file) {
        return NextResponse.json(
          { error: "No file string provided in request body" },
          { status: 400 }
        );
      }

      if (targetFolder) {
        folder = targetFolder.startsWith("snoy/") ? targetFolder : `snoy/${targetFolder}`;
      }

      fileBuffer = file;
    }

    // Upload to Cloudinary with folder organization
    const uploadResult = await uploadToCloudinary(fileBuffer, { folder });

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        folder: uploadResult.folder,
      },
    });
  } catch (error: any) {
    console.error("Upload API route error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to upload image to Cloudinary",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
