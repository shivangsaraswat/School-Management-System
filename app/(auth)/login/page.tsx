"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
    remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const error = searchParams.get("error");
    const [isLoading, setIsLoading] = useState(false);

    // Show error messages for account issues
    useEffect(() => {
        if (error === "account_deleted") {
            toast.error("Your account has been deleted. Please contact an administrator.");
        } else if (error === "account_deactivated") {
            toast.error("Your account has been deactivated. Please contact an administrator.");
        }
    }, [error]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            remember: false,
        },
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                // Check if it's a deactivated account error
                if (result.error.includes("account_deactivated") || result.code === "account_deactivated") {
                    toast.error("Your account has been deactivated. Please contact an administrator.");
                } else {
                    toast.error("Invalid email or password");
                }
                setIsLoading(false);
                return;
            }

            toast.success("Welcome back!");
            router.push(callbackUrl);
            router.refresh();
        } catch (_) {
            toast.error("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            {/* Account Error Alert */}
            {(error === "account_deleted" || error === "account_deactivated") && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-800">
                            {error === "account_deleted" ? "Account Deleted" : "Account Deactivated"}
                        </p>
                        <p className="text-sm text-red-600 mt-0.5">
                            {error === "account_deleted"
                                ? "Your account has been permanently deleted from the system."
                                : "Your account has been temporarily deactivated."
                            }
                            {" "}Please contact an administrator.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col space-y-4 mb-10">
                <h1 className="text-[32px] font-bold text-[#0f172a] leading-tight">
                    Log in to the Admin
                    <br />
                    Dashboard
                </h1>
                <p className="text-[#64748b] text-base">
                    Sign in with your credentials to access the dashboard
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {/* Email Input */}
                    <div className="relative group">
                        <div className="absolute top-3 left-4 text-[11px] font-medium text-[#64748b] z-10 transition-all duration-200">
                            Email address
                        </div>
                        <Input
                            id="email"
                            placeholder="admin@school.com"
                            type="email"
                            autoComplete="email"
                            disabled={isLoading}
                            className="h-[68px] pt-7 pb-2 px-4 bg-[#f8fafc] border-transparent focus:bg-white focus:ring-0 focus:border-[#e2e8f0] rounded-2xl text-[15px] font-medium text-[#0f172a] placeholder:text-muted-foreground/50 transition-all shadow-none"
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="border-l-2 border-destructive pl-2 mt-2 text-sm text-destructive font-medium">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="relative group">
                        <div className="absolute top-3 left-4 text-[11px] font-medium text-[#64748b] z-10 transition-all duration-200">
                            Password
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            disabled={isLoading}
                            className="h-[68px] pt-7 pb-2 px-4 bg-[#f8fafc] border-transparent focus:bg-white focus:ring-0 focus:border-[#e2e8f0] rounded-2xl text-[15px] font-medium text-[#0f172a] placeholder:text-muted-foreground/50 transition-all shadow-none"
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="border-l-2 border-destructive pl-2 mt-2 text-sm text-destructive font-medium">
                                {errors.password.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        id="remember"
                        className="h-5 w-5 rounded-md border-2 border-gray-300 text-primary focus:ring-primary/20 transition-colors cursor-pointer"
                        {...register("remember")}
                    />
                    <label
                        htmlFor="remember"
                        className="text-[14px] font-medium text-[#475569] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer transition-all duration-200"
                    >
                        Remember this computer
                    </label>
                </div>

                <div className="pt-2 space-y-6">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 rounded-2xl text-[16px] font-semibold bg-[#eb5a62] hover:bg-[#d6454d] text-white shadow-lg shadow-[#eb5a62]/20 transition-all"
                    >
                        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {isLoading ? "Logging In..." : "Log In"}
                    </Button>

                    <div className="text-left">
                        <Link
                            href="#"
                            className="text-[14px] font-medium text-[#eb5a62] underline underline-offset-4 decoration-[#eb5a62]/30 hover:decoration-[#eb5a62] transition-all"
                        >
                            Unable to login?
                        </Link>
                    </div>
                </div>
            </form>
            <div className="mt-10 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Demo Credentials</p>
                <div className="flex flex-col gap-1">
                    <code className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 w-fit">admin@school.com</code>
                    <code className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 w-fit">admin123</code>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
            <LoginContent />
        </Suspense>
    );
}
