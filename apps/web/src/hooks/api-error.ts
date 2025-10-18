import axios from "axios";
import type { ApiErrorResponse } from "@/api/axiosClient";

/**
 * Extrai mensagem de erro da API
 * Suporta diferentes formatos de resposta de erro
 */
export function getErrorMessage(
	error: unknown,
	fallback = "Algo deu errado",
): string {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data as ApiErrorResponse | undefined;
		return data?.message || data?.error || fallback;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return fallback;
}
