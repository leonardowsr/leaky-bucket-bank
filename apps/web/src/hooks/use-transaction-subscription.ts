import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getSseQueryKey, useSse } from "@/api/client/transaction/transaction";
import { SSE_URL } from "@/lib/constant";

export const useTransactionSubscription = (transactionId: string | "") => {
	const [isFinished, setIsFinished] = useState(false);
	const queryClient = useQueryClient();
	const eventSourceRef = useRef<EventSource | null>(null);

	const {
		data: transaction,
		error,
		isLoading,
	} = useSse(transactionId, {
		query: {
			queryKey: [getSseQueryKey(transactionId)],
			enabled: !!transactionId,
		},
	});
	useEffect(() => {
		if (!transactionId) {
			return;
		}

		const eventSource = new EventSource(SSE_URL(transactionId), {
			withCredentials: true,
		});

		eventSourceRef.current = eventSource;

		eventSource.addEventListener("TRANSACTION_UPDATE", (event) => {
			try {
				const updatedTransaction = JSON.parse(event.data);

				queryClient.setQueryData(
					[getSseQueryKey(transactionId)],
					updatedTransaction,
				);
			} catch (e) {
				console.error("Erro ao processar evento SSE:", e);
			}
		});

		eventSource.onerror = (err) => {
			console.error("Erro na conexão EventSource:", err);
			eventSource.close();
		};

		return () => {
			eventSource.close();
		};
	}, [queryClient, transactionId]);

	useEffect(() => {
		setIsFinished(false);
	}, []);

	useEffect(() => {
		if (transaction && transaction.status !== "pending") {
			eventSourceRef.current?.close();
			setIsFinished(true);
		}
	}, [transaction]);

	return {
		transaction,
		error,
		isLoading,
		isFinished,
	};
};
