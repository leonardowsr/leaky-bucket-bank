"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface TransactionItemProps {
	transaction: {
		id: string;
		amount: number;
		createdAt: string;
		senderId: string;
		receiverId: string;
		sender?: {
			user?: { name?: string };
			accountNumber?: string;
		};
		receiver?: {
			user?: { name?: string };
			accountNumber?: string;
		};
	};
	currentAccountId: string;
}

export function TransactionItem({
	transaction,
	currentAccountId,
}: TransactionItemProps) {
	const isSent = transaction.senderId === currentAccountId;
	const otherParty = isSent ? transaction.receiver : transaction.sender;
	const name = otherParty?.user?.name || "Usuário desconhecido";
	const accountNumber = otherParty?.accountNumber || "N/A";

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value / 100);
	};

	const formatDateTime = (dateString: string) => {
		return new Intl.DateTimeFormat("pt-BR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(dateString));
	};

	return (
		<div className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
			<div className="flex flex-1 items-center gap-3">
				<div
					className={`flex h-10 w-10 items-center justify-center rounded-full ${
						isSent ? "bg-red-500/10" : "bg-green-500/10"
					}`}
				>
					{isSent ? (
						<ArrowUpRight className="h-4 w-4 text-red-500" />
					) : (
						<ArrowDownLeft className="h-4 w-4 text-green-500" />
					)}
				</div>
				<div className="min-w-0 flex-1">
					<p className="truncate font-medium text-sm">
						{isSent ? "Para " : "De "} {name}
					</p>
					<p className="text-muted-foreground text-xs">
						Conta: {accountNumber}
					</p>
				</div>
			</div>
			<div className="flex flex-col items-end gap-1">
				<p
					className={`font-semibold text-sm ${
						isSent ? "text-red-500" : "text-green-500"
					}`}
				>
					{isSent ? "-" : "+"}
					{formatCurrency(transaction.amount)}
				</p>
				<p className="text-muted-foreground text-xs">
					{formatDateTime(transaction.createdAt)}
				</p>
			</div>
		</div>
	);
}
