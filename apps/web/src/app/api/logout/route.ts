import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
	const cookiesStore = await cookies();
	cookiesStore.delete("access_token");
	cookiesStore.delete("refresh_token");

	redirect("/login");
}
