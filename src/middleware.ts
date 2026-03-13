import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = [
  "/login",
  "/api/auth",
  "/api/health",
  "/api/crm/webhooks",
  "/api/crm/oauth",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check JWT token (edge-compatible, no DB access)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Not authenticated → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated but on login page → redirect to dashboard
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Onboarding check: if tenant hasn't completed onboarding, redirect to /onboarding
  // (except if already on onboarding pages or API routes)
  const onboardingComplete = token.onboardingComplete as boolean | undefined;
  if (
    onboardingComplete === false &&
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/api/")
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // If onboarding is complete but user is on /onboarding, redirect to dashboard
  if (onboardingComplete === true && pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
