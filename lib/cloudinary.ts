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
    const isPDF = mimeType === "application/pdf";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: isPDF ? "raw" : "image", // PDF = raw, image = image
        public_id: `${Date.now()}-${filename}`,
        // PDF ke liye inline flag — browser mein open hoga
        ...(isPDF && {
          flags: "attachment:false",
        }),
      },
      (error, result) => {
        if (error) reject(error);
        else {
          // PDF URL mein fl_attachment:false add karo
          let url = result!.secure_url;
          if (isPDF) {
            // Cloudinary raw URL ko inline open karne ke liye
            url = url.replace("/raw/upload/", "/raw/upload/fl_attachment:false/");
          }
          resolve(url);
        }
      }
    );
    uploadStream.end(buffer);
  });
}

export default cloudinary;