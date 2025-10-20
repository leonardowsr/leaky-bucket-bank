import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];

export function middleware(request: NextRequest) {
	const isPublicPath = PUBLIC_PATHS.some((path) =>
		request.nextUrl.pathname.startsWith(path),
	);

	const accessToken = request.cookies.get("access_token")?.value;

	if (!isPublicPath && !accessToken) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set(
			"redirectTo",
			request.nextUrl.pathname + request.nextUrl.search,
		);
		return NextResponse.redirect(loginUrl);
	}

	if (isPublicPath && accessToken) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	if (request.nextUrl.pathname === "/") {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
