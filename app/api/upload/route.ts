import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateUploadSignature } from "@/lib/cloudinary";

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { folder = "uploads" } = await request.json();

        const signature = generateUploadSignature(folder);

        return NextResponse.json(signature);
    } catch (error) {
        console.error("Upload signature error:", error);
        return NextResponse.json(
            { error: "Failed to generate upload signature" },
            { status: 500 }
        );
    }
}
