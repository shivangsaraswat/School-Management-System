"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, File } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { getUploadSignature } from "@/lib/actions/upload";

interface FileUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label: string;
    accept?: string; // e.g., "image/*,application/pdf"
    className?: string;
    folder?: string;
}

export function FileUpload({
    value,
    onChange,
    label,
    accept = "image/*",
    className,
    folder = "school_management/students",
}: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should be less than 5MB");
            return;
        }

        setIsUploading(true);
        try {
            // Get signature from server
            const { signature, timestamp, cloudName, apiKey } = await getUploadSignature(folder);

            // Prepare form data
            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", apiKey || "");
            formData.append("timestamp", timestamp.toString());
            formData.append("signature", signature);
            formData.append("folder", folder);
            formData.append("upload_preset", "school_management"); // Assuming this preset exists or using signed upload doesn't strictly need it if signature covers params

            // Upload to Cloudinary
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Upload failed:", errorData);
                throw new Error("Upload failed");
            }

            const data = await response.json();
            onChange(data.secure_url);
            toast.success("File uploaded successfully");
        } catch (error) {
            console.error("Error uploading file:", error);
            toast.error("Failed to upload file. Please try again.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = () => {
        onChange("");
    };

    const isImage = value?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    return (
        <div className={cn("space-y-2", className)}>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {label}
            </label>

            {!value ? (
                <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors h-32",
                        isUploading && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    )}
                    <span className="text-xs text-muted-foreground font-medium">
                        {isUploading ? "Uploading..." : "Click to upload"}
                    </span>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </div>
            ) : (
                <div className="relative group border rounded-lg overflow-hidden h-32 w-32 flex items-center justify-center bg-muted/20">
                    <button
                        onClick={handleRemove}
                        type="button"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                        <X className="h-3 w-3" />
                    </button>

                    {isImage ? (
                        <div className="relative w-full h-full">
                            <Image
                                src={value}
                                alt="Uploaded file"
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center p-2 text-center">
                            <File className="h-8 w-8 text-primary mb-1" />
                            <span className="text-[10px] text-muted-foreground truncate w-full px-2">
                                File uploaded
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
