import { GraduationCap } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4">
            <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
                    <GraduationCap className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">School Management</h1>
                    <p className="text-sm text-muted-foreground">System</p>
                </div>
            </div>
            {children}
        </div>
    );
}
