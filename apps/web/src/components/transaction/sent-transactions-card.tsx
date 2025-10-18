"use client";

import { useFindAllByAccount } from "@/api/client/transaction/transaction";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TransactionItem } from "./transaction-item";

interface SentTransactionsCardProps {
	accountId: string;
}

export function SentTransactionsCard({ accountId }: SentTransactionsCardProps) {
	const { data: transactions, isLoading } = useFindAllByAccount(accountId, {});
	return (
		<Card>
			<CardHeader>
				<CardTitle>Transações Enviadas</CardTitle>
				<CardDescription>
					{transactions?.length
						? `${transactions.length} transações enviadas`
						: "Nenhuma transação encontrada"}
				</CardDescription>
			</CardHeader>
			<ScrollArea className="h-96 w-full">
				{isLoading ? (
					<div className="flex h-full items-center justify-center p-4">
						<p className="text-muted-foreground">Carregando transações...</p>
					</div>
				) : transactions && transactions.length > 0 ? (
					<div className="space-y-1 p-4">
						{transactions.slice(0, 100).map((transaction) => (
							<TransactionItem
								key={transaction.id}
								transaction={transaction}
								currentAccountId={accountId}
							/>
						))}
					</div>
				) : (
					<div className="flex h-full items-center justify-center p-4">
						<p className="text-muted-foreground">Nenhuma transação enviada</p>
					</div>
				)}
			</ScrollArea>
		</Card>
	);
}
