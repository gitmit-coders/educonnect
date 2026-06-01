// lib/cloudinary.ts

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  mimeType?: string,
  folder: string = "educonnect"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, "")}`,
        format: mimeType === "application/pdf" ? "pdf" : undefined,
        // PDF inline open hoga
        type: "upload",
        access_mode: "public",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          let url = result!.secure_url;
          // PDF ke liye fl_attachment:false — browser mein open ho
          if (mimeType === "application/pdf") {
            url = url.replace(
              "/upload/",
              "/upload/fl_attachment:false/"
            );
          }
          resolve(url);
        }
      }
    );
    uploadStream.end(buffer);
  });
}

export default cloudinary;