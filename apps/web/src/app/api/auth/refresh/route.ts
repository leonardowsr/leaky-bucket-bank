import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

function isTokenExpired(token: string): boolean {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		const currentTime = Date.now() / 1000;
		return payload.exp < currentTime;
	} catch {
		return true;
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { refreshToken } = body;

		if (!refreshToken) {
			return NextResponse.json(
				{ error: "Refresh token is required" },
				{ status: 400 },
			);
		}

		if (isTokenExpired(refreshToken)) {
			redirect("/api/logout");
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/refresh-token`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ refreshToken }),
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
		console.error("Refresh error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
