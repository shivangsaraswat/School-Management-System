"use server";

import { generateUploadSignature } from "@/lib/cloudinary";
import { requireAuth } from "@/lib/dal";

export async function getUploadSignature(folder: string = "school_management/students") {
    await requireAuth();
    return generateUploadSignature(folder);
}
