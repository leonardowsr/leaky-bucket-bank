"use server";

import { cookies } from "next/headers";

async function getTokens() {
	const cookiesStore = await cookies();
	const accessToken = cookiesStore.get("access_token")?.value;
	const refreshToken = cookiesStore.get("refresh_token")?.value;
	return { accessToken, refreshToken };
}
export { getTokens };
