import { NextRequest, NextResponse } from "next/server";

// Define all available roles
const ROLES = {
  SYSTEM: "SYSTEM",
  ADMIN: "ADMIN",
  MANUF_ADMIN: "MANUF_ADMIN",
  MANUF_ACCOUNTS: "MANUF_ACCOUNTS",
  MANUF_MANAGER: "MANUF_MANAGER",
  MANUF_SALES: "MANUF_SALES",
  MANUF_TECHNICAL: "MANUF_TECHNICAL",
  MANUF_TECH_GEN: "MANUF_TECH_GEN",
  MANUF_TECH_EXPERT: "MANUF_TECH_EXPERT",
  MANUF_TECH_MANAGER: "MANUF_TECH_MANAGER",
  DEALER_ADMIN: "DEALER_ADMIN",
  DEALER_ACCOUNTS: "DEALER_ACCOUNTS",
  DEALER_MANAGER: "DEALER_MANAGER", 
  DEALER_SALES: "DEALER_SALES",
  USER: "USER",
  ACCOUNTS: "ACCOUNTS",
  SALES: "SALES",
  TECHNICAL: "TECHNICAL",
} as const;

type UserRole = (typeof ROLES)[keyof typeof ROLES];

export function proxy(request: NextRequest) {
  const idCookie = request.cookies.get("id");
  const id = idCookie?.value.toString();
  const userrole = request.cookies.get("role");
  const role = userrole?.value.toString();

  const pathname = request.nextUrl.pathname;

  // Define public routes that don't require authentication
  const loginRoutes = ["/login", "/adminlogin"];

  // Skip middleware for static files and Next.js internal routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes("/favicon.ico") ||
    pathname.includes(".") // Skip files with extensions
  ) {
    return NextResponse.next();
  }

  // Allow access to home page and public routes without any checks
  if (pathname == "/" || pathname == "/adduser" || pathname == "/adduser") {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const isAuthenticated = !!id;

  // Helper function to check if role is valid
  const isValidRole = (role: string | undefined): role is UserRole => {
    return !!role && Object.values(ROLES).includes(role as UserRole);
  };

  if (!isAuthenticated && loginRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // If not authenticated, redirect to appropriate login page
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/adminlogin", request.url));
  }

  // If authenticated but role is invalid, redirect to login
  if (!isValidRole(role)) {
    return NextResponse.redirect(new URL("/adminlogin", request.url));
  }

  // Define role-to-route mapping
  const roleRoutes: Record<UserRole, string> = {
    SYSTEM: "/admin",
    ADMIN: "/admin",
    USER: "/customer",
    ACCOUNTS: "/accounts",
    SALES: "/sales",
    TECHNICAL: "/technical",
    MANUF_ADMIN: "/company",
    MANUF_ACCOUNTS: "/company",
    MANUF_MANAGER: "/company",
    MANUF_SALES: "/company",
    MANUF_TECHNICAL: "/company",
    MANUF_TECH_GEN: "/company",
    MANUF_TECH_EXPERT: "/company",
    MANUF_TECH_MANAGER: "/company",
    DEALER_ADMIN: "/dealer",
    DEALER_ACCOUNTS: "/dealer",
    DEALER_MANAGER: "/dealer",
    DEALER_SALES: "/dealer",
  };

  // Get the expected route for the user's role
  const expectedRoute = roleRoutes[role as UserRole];

  // Check if user is trying to access a route they're authorized for
  if (expectedRoute && pathname.startsWith(expectedRoute)) {
    return NextResponse.next();
  }

  // If user is trying to access an unauthorized route, redirect to their appropriate page
  if (expectedRoute) {
    return NextResponse.redirect(new URL(expectedRoute, request.url));
  }

  return NextResponse.next();
}
