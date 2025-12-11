import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Generate upload signature for client-side uploads
export function generateUploadSignature(folder: string) {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
        {
            timestamp,
            folder,
            upload_preset: "school_management",
        },
        process.env.CLOUDINARY_API_SECRET!
    );

    return {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
    };
}

// Upload image from server
export async function uploadImage(
    file: string,
    options: {
        folder?: string;
        publicId?: string;
        transformation?: object;
    } = {}
) {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: options.folder || "school_management",
            public_id: options.publicId,
            transformation: options.transformation || [
                { width: 400, height: 400, crop: "fill", gravity: "face" },
                { quality: "auto:good" },
                { fetch_format: "auto" },
            ],
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
        };
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Failed to upload image");
    }
}

// Delete image
export async function deleteImage(publicId: string) {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary delete error:", error);
    }
}
