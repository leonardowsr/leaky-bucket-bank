"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
	getFindMeQueryKey,
	useFindAll,
	useFindMe,
} from "@/api/client/account/account";
import {
	getFindAllByAccountQueryKey,
	getSseQueryKey,
	useCreate,
} from "@/api/client/transaction/transaction";
import { Button } from "@/components/ui/button";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransactionSubscription } from "@/hooks/use-transaction-subscription";
import { moneyToString } from "@/lib/utils";
import { TransactionProgress } from "./loading-transaction";

interface NewTransactionDialogContentProps {
	onClose: () => void;
}

export function NewTransactionDialogContent({
	onClose,
}: NewTransactionDialogContentProps) {
	const [transactionId, setTransactionId] = useState<string | "">("");
	const QueryClient = useQueryClient();

	const { data: meAccount } = useFindMe();

	const senderId = meAccount?.id;
	const { transaction, isLoading, isFinished } =
		useTransactionSubscription(transactionId);

	const { data: allAccounts = [] } = useFindAll();

	const { mutate: createTransaction, isPending } = useCreate();

	const form = useForm({
		defaultValues: {
			receiverId: "",
			amount: "",
		},
		onSubmit: async ({ value }) => {
			if (!senderId) {
				alert("Conta de envio não encontrada");
				return;
			}

			const amountInCentavos = Math.round(
				(value.amount as unknown as number) * 100,
			);

			createTransaction(
				{
					data: {
						amount: amountInCentavos,
						senderId,
						receiverId: value.receiverId,
					},
				},
				{
					onSuccess: (data) => {
						form.reset();
						setTransactionId(data.transactionId);
					},
					onError: (error) => {
						console.error("Erro ao criar transação:", error);
					},
				},
			);
		},
	});

	useEffect(() => {
		if (isFinished) {
			QueryClient.removeQueries({
				queryKey: getSseQueryKey(transactionId),
			});
			QueryClient.invalidateQueries({
				queryKey: getFindMeQueryKey(),
			});
			QueryClient.invalidateQueries({
				queryKey: getFindAllByAccountQueryKey(meAccount?.id),
			});
			const timer = setTimeout(async () => {
				setTransactionId("");
				onClose();
				form.reset();
			}, 3000);
			return () => {
				clearTimeout(timer);
			};
		}
	}, [isFinished, transactionId, meAccount?.id, QueryClient, onClose, form]);

	const availableAccounts = allAccounts.filter(
		(account) => account?.id !== senderId,
	);

	const showLoading = isLoading || isFinished;

	return (
		<DialogContent showCloseButton={!isLoading}>
			<DialogHeader>
				<DialogTitle>
					{!isFinished && !isLoading && "Nova Transação"}
					{isFinished && "Resultado da transação"}
					{isLoading && "Aguardando..."}
				</DialogTitle>
				{!isFinished && !isLoading && (
					<DialogDescription>
						Envie dinheiro para outra conta bancária
						<br />
						Saldo disponível:{" "}
						<span className="font-semibold text-primary">
							{moneyToString(meAccount?.balance)}
						</span>
					</DialogDescription>
				)}
			</DialogHeader>
			{showLoading || isFinished ? (
				<div className="flex h-40 items-center justify-center">
					<TransactionProgress
						running={isLoading}
						finalLabel={
							transaction?.status === "approved"
								? "Transação aprovada!"
								: transaction?.status === "rejected"
									? "Transação recusada."
									: "Transação concluída."
						}
					/>
				</div>
			) : (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					{/* Conta de Destino */}
					<form.Field
						name="receiverId"
						validators={{
							onChange: ({ value }) =>
								!value ? "Selecione uma conta destinatária" : undefined,
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Para qual conta?</Label>
								<select
									id={field.name}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								>
									<option value="">Selecione a conta destinatária</option>
									{availableAccounts.length > 0 ? (
										availableAccounts.map((account) => (
											<option key={account?.id} value={account?.id}>
												{account?.accountNumber}
											</option>
										))
									) : (
										<option disabled>Nenhuma conta disponível</option>
									)}
								</select>
								{field.state.meta.errors?.length > 0 && (
									<p className="text-red-500 text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>
					{/* Valor */}
					<form.Field
						name="amount"
						validators={{
							onChange: ({ value }) => {
								if (!value) return "Valor é obrigatório";
								const num = Number.parseFloat(value);
								if (Number.isNaN(num) || num <= 0)
									return "Digite um valor válido";
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Valor (em R$)</Label>
								<Input
									id={field.name}
									type="number"
									step="0.01"
									min="0"
									placeholder="0,00"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors?.length > 0 && (
									<p className="text-red-500 text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>
					{/* Botões */}
					<DialogFooter className="mt-6">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isPending}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Enviando..." : "Enviar"}
						</Button>
					</DialogFooter>
				</form>
			)}
		</DialogContent>
	);
}
