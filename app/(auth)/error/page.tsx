"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have access to this resource.",
    Verification: "The verification link has expired or is invalid.",
    CredentialsSignin: "Invalid email or password.",
    Default: "An error occurred during authentication.",
};

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error") || "Default";
    const errorMessage = errorMessages[error] || errorMessages.Default;

    return (
        <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Authentication Error
                    </CardTitle>
                </div>
                <CardDescription>{errorMessage}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full">
                    <Link href="/login">Back to Login</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
