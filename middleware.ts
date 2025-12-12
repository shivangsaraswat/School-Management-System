import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

// Routes grouped by access level
const adminOnlyRoutes = ["/admin"]; // Super Admin only
const operationsRoutes = ["/operations"]; // Super Admin, Admin, Office Staff
const academicsRoutes = ["/academics"]; // Super Admin, Admin, Teacher
const studentRoutes = ["/student"]; // Student only
const profileRoutes = ["/profile"]; // All authenticated users

// All protected routes combined
const protectedRoutes = [
    ...adminOnlyRoutes,
    ...operationsRoutes,
    ...academicsRoutes,
    ...studentRoutes,
    ...profileRoutes,
];

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;

    // Check if it's a protected route
    const isProtectedRoute = protectedRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
    );

    // Redirect to login if accessing protected route without auth
    if (isProtectedRoute && !isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect logged-in users away from login page
    // BUT allow them to stay if there's an error (account deleted/deactivated)
    if (isLoggedIn && nextUrl.pathname === "/login") {
        const hasError = nextUrl.searchParams.has("error");
        if (!hasError) {
            // Redirect students to their portal
            if (userRole === ROLES.STUDENT) {
                return NextResponse.redirect(new URL("/student/results", nextUrl));
            }
            return NextResponse.redirect(new URL("/", nextUrl));
        }
    }

    // ==================================================
    // ROLE-BASED ROUTE PROTECTION
    // ==================================================

    // Admin routes - Super Admin ONLY
    const isAdminRoute = adminOnlyRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
    );
    if (isAdminRoute && userRole !== ROLES.SUPER_ADMIN) {
        return NextResponse.redirect(new URL("/", nextUrl));
    }

    // Operations routes - Super Admin, Admin, Office Staff
    const isOperationsRoute = operationsRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
    );
    if (
        isOperationsRoute &&
        userRole !== ROLES.SUPER_ADMIN &&
        userRole !== ROLES.ADMIN &&
        userRole !== ROLES.OFFICE_STAFF
    ) {
        return NextResponse.redirect(new URL("/", nextUrl));
    }

    // Academics routes - Super Admin, Admin, Teacher
    const isAcademicsRoute = academicsRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
    );
    if (
        isAcademicsRoute &&
        userRole !== ROLES.SUPER_ADMIN &&
        userRole !== ROLES.ADMIN &&
        userRole !== ROLES.TEACHER
    ) {
        return NextResponse.redirect(new URL("/", nextUrl));
    }

    // Student routes - Students ONLY
    const isStudentRoute = studentRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
    );
    if (isStudentRoute && userRole !== ROLES.STUDENT) {
        return NextResponse.redirect(new URL("/", nextUrl));
    }

    // ==================================================
    // SMART REDIRECTS FOR DASHBOARD HOME
    // ==================================================
    if (nextUrl.pathname === "/" && isLoggedIn) {
        // Students should go to their results page
        if (userRole === ROLES.STUDENT) {
            return NextResponse.redirect(new URL("/student/results", nextUrl));
        }
        // Teachers should go to their classes
        if (userRole === ROLES.TEACHER) {
            return NextResponse.redirect(new URL("/academics/my-classes", nextUrl));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!api|_next/static|_next/image|favicon.ico|images|logos).*)",
    ],
};
