import { requireAuth } from "@/lib/dal";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Header } from "@/components/dashboard/header";
import { HeaderProvider } from "@/components/dashboard/header-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageContainer } from "@/components/dashboard/page-container";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireAuth();

    return (
        <SidebarProvider>
            <HeaderProvider>
                <AppSidebar userRole={user.role} variant="inset" />
                <SidebarInset>
                    <Header user={user} />
                    <PageContainer>
                        {children}
                    </PageContainer>
                </SidebarInset>
            </HeaderProvider>
        </SidebarProvider>
    );
}
