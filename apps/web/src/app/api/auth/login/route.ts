import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, password } = body;

		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 },
			);
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/login`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			},
		);

		if (!response.ok) {
			const errorData = await response.json();
			return NextResponse.json(errorData, { status: response.status });
		}
		const data = await response.json();
		const { access_token, refresh_token } = data;

		const cookieStore = await cookies();

		cookieStore.set("access_token", access_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 3, // 3 hours
		});

		cookieStore.set("refresh_token", refresh_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 2, // 2 days
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
