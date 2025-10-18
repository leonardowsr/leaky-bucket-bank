export const API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

if (!API_URL) {
	throw new Error("API_URL is not defined");
}
export const SSE_URL = (transactionId: string) => {
	return `${API_URL}/transaction/${transactionId}/sse`;
};
