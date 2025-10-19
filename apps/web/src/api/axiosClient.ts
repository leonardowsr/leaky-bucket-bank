import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { getTokens } from "@/actions/get-tokens";

export const axiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
	withCredentials: true,
});

export interface ApiErrorResponse {
	message?: string;
	error?: string;
	statusCode?: number;
	details?: unknown;
}

axiosInstance.interceptors.request.use(async (config) => {
	try {
		const { accessToken } = await getTokens();
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
	} catch (error) {
		console.error("Erro ao obter tokens:", error);
	}
	return config;
});

axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		const { refreshToken } = await getTokens();

		if (!refreshToken) {
			window.location.href = "/api/logout";
			return;
		}

		if (!originalRequest._retryCount) {
			originalRequest._retryCount = 0;
		}

		if (error.response?.status === 401 && originalRequest._retryCount < 2) {
			originalRequest._retryCount += 1;
			try {
				await axios.post(
					`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/refresh-token`,
					{ refreshToken: refreshToken },
					{ withCredentials: true },
				);

				return axiosClient(originalRequest);
			} catch (refreshError) {
				console.error("Refresh token falhou", refreshError);
				if (originalRequest._retryCount >= 2) {
					window.location.href = "/api/logout";
				}
			}
		}

		// Se excedeu 2 retries, redireciona para logout
		if (error.response?.status === 401 && originalRequest._retryCount >= 2) {
			window.location.href = "/api/logout";
		}

		return Promise.reject(error);
	},
);

export const axiosClient = async <T = unknown>(
	config: AxiosRequestConfig,
): Promise<T> => {
	try {
		const response = await axiosInstance.request<T>(config);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const apiError: AxiosError<ApiErrorResponse> = error;
			throw (
				apiError.response?.data || {
					error: "Internal Server Error",
					message: "Erro interno no servidor, tente novamente mais tarde.",
					status: 500,
				}
			);
		}
		throw error;
	}
};
