import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Backblaze B2 client (S3-compatible)
const s3Client = new S3Client({
    endpoint: `https://s3.${process.env.BACKBLAZE_REGION || "us-west-004"}.backblazeb2.com`,
    region: process.env.BACKBLAZE_REGION || "us-west-004",
    credentials: {
        accessKeyId: process.env.BACKBLAZE_KEY_ID!,
        secretAccessKey: process.env.BACKBLAZE_APPLICATION_KEY!,
    },
});

const BUCKET_NAME = process.env.BACKBLAZE_BUCKET_NAME!;

export interface UploadResult {
    key: string;
    url: string;
    size: number;
}

// Upload file to Backblaze B2
export async function uploadFile(
    key: string,
    body: Buffer,
    contentType: string
): Promise<UploadResult> {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
    });

    await s3Client.send(command);

    // If using Cloudflare in front, use the Cloudflare URL
    const cloudflareUrl = process.env.CLOUDFLARE_R2_URL;
    const url = cloudflareUrl
        ? `${cloudflareUrl}/${key}`
        : `https://${BUCKET_NAME}.s3.${process.env.BACKBLAZE_REGION || "us-west-004"}.backblazeb2.com/${key}`;

    return {
        key,
        url,
        size: body.length,
    };
}

// Generate presigned URL for download
export async function getDownloadUrl(
    key: string,
    expiresIn: number = 3600 // 1 hour
): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
}

// Delete file from Backblaze B2
export async function deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    await s3Client.send(command);
}

// Generate unique file key
export function generateFileKey(
    folder: string,
    filename: string,
    studentId?: string
): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const prefix = studentId ? `${folder}/${studentId}` : folder;
    return `${prefix}/${timestamp}-${sanitizedFilename}`;
}
