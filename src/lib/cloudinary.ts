import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from "cloudinary";

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  public_id: string;
  folder: string;
  format: string;
  width?: number;
  height?: number;
}

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
}

/**
 * Uploads a file buffer or base64 data string to Cloudinary in a specific folder.
 * Example folders: "snoy/categories", "snoy/products", etc.
 */
export async function uploadToCloudinary(
  fileInput: Buffer | string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { folder = "snoy/categories", publicId, tags } = options;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn(
      "[Cloudinary Warning]: Credentials not fully configured in environment variables. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  const uploadOptions: UploadApiOptions = {
    folder,
    resource_type: "auto",
    ...(publicId ? { public_id: publicId } : {}),
    ...(tags ? { tags } : {}),
  };

  return new Promise((resolve, reject) => {
    if (typeof fileInput === "string") {
      // Base64 or URL input
      cloudinary.uploader.upload(fileInput, uploadOptions, (error, result?: UploadApiResponse) => {
        if (error || !result) {
          return reject(error || new Error("Failed to upload image to Cloudinary"));
        }
        resolve({
          url: result.secure_url || result.url,
          public_id: result.public_id,
          folder: result.folder || folder,
          format: result.format,
          width: result.width,
          height: result.height,
        });
      });
    } else {
      // Buffer input (stream upload)
      const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result?: UploadApiResponse) => {
        if (error || !result) {
          return reject(error || new Error("Failed to upload stream to Cloudinary"));
        }
        resolve({
          url: result.secure_url || result.url,
          public_id: result.public_id,
          folder: result.folder || folder,
          format: result.format,
          width: result.width,
          height: result.height,
        });
      });

      uploadStream.end(fileInput);
    }
  });
}

/**
 * Deletes an image from Cloudinary by public_id
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return false;
  }
}

export default cloudinary;
