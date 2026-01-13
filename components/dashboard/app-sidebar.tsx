"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    BookOpen,
    ClipboardCheck,
    FileText,
    LayoutDashboard,
    Receipt,
    Settings,
    Shield,
    UserPlus,
    Users,
    BarChart3,
    GraduationCap,
    Award,
    ChevronRight,
    Eye,
    CreditCard,
    History,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
    canAccessSuperAdmin,
    canAccessOperations,
    canAccessAcademics,
    canAccessStudentPortal
} from "@/lib/permissions";
import { ROLES, type Role } from "@/lib/constants";
import { LucideIcon } from "lucide-react";

// Type for regular menu items
interface MenuItem {
    title: string;
    url: string;
    icon: LucideIcon;
}

// Type for menu items with submenus
interface MenuItemWithSub {
    title: string;
    icon: LucideIcon;
    subItems: {
        title: string;
        url: string;
        icon?: LucideIcon;
    }[];
}

type NavItem = MenuItem | MenuItemWithSub;

function hasSubItems(item: NavItem): item is MenuItemWithSub {
    return 'subItems' in item;
}

export function AppSidebar({ userRole, ...props }: React.ComponentProps<typeof Sidebar> & { userRole: Role }) {
    const pathname = usePathname();

    const superAdminNav = {
        label: "Administration",
        checkAccess: canAccessSuperAdmin,
        items: [
            { title: "User Accounts", url: "/admin/users", icon: Users },
            { title: "Audit Logs", url: "/admin/audit-logs", icon: Shield },
            { title: "Revenue", url: "/admin/revenue", icon: BarChart3 },
            { title: "Settings", url: "/admin/settings", icon: Settings },
        ] as NavItem[],
    };

    const operationsNav = {
        label: "Operations",
        checkAccess: canAccessOperations,
        items: [
            { title: "Students", url: "/operations/students", icon: Users },
            { title: "Teachers", url: "/operations/teachers", icon: GraduationCap },
            { title: "Admissions", url: "/operations/admissions", icon: UserPlus },
        ] as NavItem[],
    };

    const feesNav = {
        label: "Fees",
        checkAccess: canAccessOperations, // Inherit usage permission
        items: [
            { title: "Overview", url: "/operations/fees", icon: Eye },
            { title: "Collect Fees", url: "/operations/fees/collect", icon: CreditCard },
            { title: "Transactions", url: "/operations/fees/transactions", icon: History },
        ] as NavItem[],
    };

    const academicsNav = {
        label: "Academics",
        checkAccess: canAccessAcademics,
        items: [
            { title: "Attendance", url: "/academics/attendance", icon: ClipboardCheck },
            { title: "Exams", url: "/academics/exams", icon: FileText },
            { title: "My Classes", url: "/academics/my-classes", icon: BookOpen },
        ] as NavItem[],
    };

    const studentNav = {
        label: "Student Portal",
        checkAccess: canAccessStudentPortal,
        items: [
            { title: "My Results", url: "/student/results", icon: Award },
        ] as NavItem[],
    };

    const groups: { label: string; items: NavItem[] }[] = [];

    if (userRole !== ROLES.STUDENT) {
        groups.push({
            label: "General",
            items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
        });
    }

    if (canAccessSuperAdmin(userRole)) {
        groups.push(superAdminNav);
    }

    if (canAccessOperations(userRole)) {
        groups.push(operationsNav);
        // Fees is part of operations technically, but shown visually separate
        groups.push(feesNav);
    }

    if (canAccessAcademics(userRole)) {
        groups.push(academicsNav);
    }

    if (canAccessStudentPortal(userRole)) {
        groups.push(studentNav);
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={userRole === ROLES.STUDENT ? "/student/results" : "/"}>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <GraduationCap className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left leading-tight">
                                    <span className="truncate text-sm font-semibold">
                                        {userRole === ROLES.STUDENT ? "Student Portal" : "Ptbs School"}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground capitalize">{userRole.replace("_", " ")}</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {groups.map((group) => (
                    <SidebarGroup key={group.label} className="py-2">
                        <SidebarGroupLabel className="text-xs uppercase tracking-wider px-3 py-1.5">{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    if (hasSubItems(item)) {
                                        // Check if any subitem is active
                                        const isSubActive = item.subItems.some(
                                            (sub) => pathname === sub.url || pathname.startsWith(sub.url + "/")
                                        );

                                        return (
                                            <Collapsible
                                                key={item.title}
                                                asChild
                                                defaultOpen={isSubActive}
                                                className="group/collapsible"
                                            >
                                                <SidebarMenuItem>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton
                                                            tooltip={item.title}
                                                            isActive={isSubActive}
                                                            className="text-sidebar-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                                        >
                                                            <item.icon className="size-4" />
                                                            <span className="text-sm font-medium">{item.title}</span>
                                                            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <SidebarMenuSub>
                                                            {item.subItems.map((subItem) => {
                                                                // Use most specific match to avoid prefix collisions (e.g., /fees vs /fees/collect)
                                                                const isBetterMatch = item.subItems.some(
                                                                    (other) => other !== subItem && other.url.length > subItem.url.length && (pathname === other.url || pathname.startsWith(other.url + "/"))
                                                                );
                                                                const isActive = (pathname === subItem.url || pathname.startsWith(subItem.url + "/")) && !isBetterMatch;

                                                                return (
                                                                    <SidebarMenuSubItem key={subItem.title}>
                                                                        <SidebarMenuSubButton
                                                                            asChild
                                                                            isActive={isActive}
                                                                        >
                                                                            <Link href={subItem.url}>
                                                                                {subItem.icon && <subItem.icon className="size-4" />}
                                                                                <span>{subItem.title}</span>
                                                                            </Link>
                                                                        </SidebarMenuSubButton>
                                                                    </SidebarMenuSubItem>
                                                                );
                                                            })}
                                                        </SidebarMenuSub>
                                                    </CollapsibleContent>
                                                </SidebarMenuItem>
                                            </Collapsible>
                                        );
                                    }

                                    // Regular menu item
                                    // Use most specific match logic to avoid prefix collisions (especially for Fees Overview)
                                    const isBetterMatch = group.items.some(
                                        (other) => !hasSubItems(other) && other !== item && other.url.length > item.url.length && (pathname === other.url || pathname.startsWith(other.url + "/"))
                                    );
                                    const isActive = (pathname === item.url || pathname.startsWith(item.url + "/")) && !isBetterMatch;

                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                tooltip={item.title}
                                                className="text-sidebar-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                            >
                                                <Link href={item.url}>
                                                    <item.icon className="size-4" />
                                                    <span className="text-sm font-medium">{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter className="p-3" />

            <SidebarRail />
        </Sidebar>
    )
}
