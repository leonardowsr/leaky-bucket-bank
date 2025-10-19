"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { getFindMeQueryKey, useFindMe } from "@/api/client/account/account";
import {
	getFindByKeyQueryKey,
	useFindByKey,
} from "@/api/client/account-keys/account-keys";
import {
	getFindAllByAccountQueryKey,
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
import { Separator } from "@/components/ui/separator";
import { useTransactionSubscription } from "@/hooks/use-transaction-subscription";
import { getErrorMessage, moneyToString } from "@/lib/utils";
import { TransactionProgress } from "./loading-transaction";

interface NewTransactionDialogContentProps {
	onClose: () => void;
}

interface RecipientInfo {
	accountNumber: string;
	recipientName: string;
	receiverKey: string;
}

export function NewTransactionDialogContent({
	onClose,
}: NewTransactionDialogContentProps) {
	const [transactionId, setTransactionId] = useState<string>("");
	const [step, setStep] = useState<1 | 2>(1);
	const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(
		null,
	);
	const [searchKey, setSearchKey] = useState<string>("");

	const QueryClient = useQueryClient();
	const { data: meAccount } = useFindMe();

	const { data: accountKeyData, isFetching: isFetchingKey } = useFindByKey(
		{ key: searchKey },
		{
			query: {
				queryKey: [...getFindByKeyQueryKey(), searchKey],
				enabled: !!searchKey,
				retry: false,
			},
		},
	);

	const senderId = meAccount?.id;
	const { transaction, isLoading, isFinished } =
		useTransactionSubscription(transactionId);
	const { mutate: createTransaction, isPending } = useCreate();

	const form = useForm({
		defaultValues: { receiverKey: "", amount: "" },
		onSubmit: async ({ value }) => {
			if (step === 1) {
				if (!value.receiverKey) return;
				if (meAccount?.accountKeys?.some((k) => k.key === value.receiverKey)) {
					getErrorMessage(
						new Error("Você não pode enviar dinheiro para si mesmo"),
						"Erro",
					);
					return;
				}
				setSearchKey(value.receiverKey);
			} else {
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
							receiverKey: value.receiverKey,
						},
					},
					{
						onSuccess: (data) => setTransactionId(data.transactionId),
						onError: (error) =>
							getErrorMessage(error, "Erro ao criar transação"),
					},
				);
			}
		},
	});

	useEffect(() => {
		if (accountKeyData && searchKey && !isFetchingKey) {
			setRecipientInfo({
				accountNumber: accountKeyData.accountNumber ?? "",
				recipientName: accountKeyData.recipientName ?? "",
				receiverKey: accountKeyData.key ?? "",
			});
			setStep(2);
			setSearchKey("");
		}
	}, [accountKeyData, searchKey, isFetchingKey]);

	// Fecha automaticamente após finalizar (sem estados extras)
	useEffect(() => {
		if (!transactionId || !isFinished) return;
		QueryClient.invalidateQueries({ queryKey: getFindMeQueryKey() });
		QueryClient.invalidateQueries({
			queryKey: getFindAllByAccountQueryKey(meAccount?.id),
		});
		QueryClient.removeQueries({
			queryKey: ["transaction-sse", transactionId],
		});
		const timer = setTimeout(() => {
			onClose();
		}, 1500);

		return () => clearTimeout(timer);
	}, [isFinished, transactionId, QueryClient, meAccount?.id, onClose]);

	const showLoading = (isLoading || isFinished) && !!transactionId;

	return (
		<DialogContent
			showCloseButton={!showLoading}
			onPointerDownOutside={(e) => {
				if (showLoading) e.preventDefault();
			}}
		>
			<DialogHeader>
				<DialogTitle>
					{!showLoading && step === 1 && "Nova Transação"}
					{!showLoading && step === 2 && "Confirmar Transação"}
					{isFinished && "Resultado da transação"}
					{isLoading && !isFinished && "Aguardando..."}
				</DialogTitle>
				{!showLoading && (
					<DialogDescription>
						{step === 1 && "Insira os dados do destinatário"}
						{step === 2 && "Revise os dados e confirme a transação"}
						<br />
						Saldo disponível:{" "}
						<span className="font-semibold text-primary">
							{moneyToString(meAccount?.balance)}
						</span>
					</DialogDescription>
				)}
			</DialogHeader>

			{showLoading ? (
				<>
					<div className="flex h-40 items-center justify-center">
						<TransactionProgress
							running={isLoading && !isFinished}
							finalLabel={
								transaction?.status === "approved"
									? "Transação aprovada!"
									: transaction?.status === "rejected"
										? "Transação recusada."
										: "Transação concluída."
							}
						/>
					</div>
					{isFinished && (
						<div className="text-center text-muted-foreground text-xs">
							Você já pode voltar ao dashboard. Obrigado por aguardar.
						</div>
					)}
				</>
			) : (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					{step === 1 ? (
						<>
							<form.Field
								name="receiverKey"
								validators={{
									onChange: ({ value }) =>
										!value ? "Digite a chave PIX do destinatário" : undefined,
								}}
							>
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>
											Chave PIX do destinatário
										</Label>
										<Input
											id={field.name}
											placeholder="email@exemplo.com, CPF, telefone..."
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

							<form.Field
								name="amount"
								validators={{
									onChange: ({ value }) => {
										if (!value) return "Valor é obrigatório";
										const num = Number.parseFloat(value);
										if (Number.isNaN(num) || num <= 0)
											return "Digite um valor válido";
										if (num * 100 > (meAccount?.balance ?? 0)) {
											return "Saldo insuficiente";
										}
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
						</>
					) : (
						<div className="space-y-4 rounded-lg border p-4">
							<div className="flex items-start gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
									<Check className="h-5 w-5 text-green-600 dark:text-green-400" />
								</div>
								<div className="flex-1 space-y-1">
									<p className="font-medium text-sm">Destinatário</p>
									<p className="font-semibold text-lg">
										{recipientInfo?.recipientName}
									</p>
									<p className="text-muted-foreground text-sm">
										Conta: {recipientInfo?.accountNumber}
									</p>
									<p className="text-muted-foreground text-sm">
										Chave: {recipientInfo?.receiverKey}
									</p>
								</div>
							</div>

							<Separator />

							<div className="space-y-1">
								<p className="font-medium text-sm">Valor a transferir</p>
								<p className="font-bold text-2xl text-primary">
									{moneyToString(
										Math.round(
											(form.state.values.amount as unknown as number) * 100,
										),
									)}
								</p>
							</div>
						</div>
					)}

					<DialogFooter className="mt-6">
						{step === 1 ? (
							<>
								<Button
									type="button"
									variant="outline"
									onClick={onClose}
									disabled={isPending || isFetchingKey}
								>
									Cancelar
								</Button>
								<Button type="submit" disabled={isPending || isFetchingKey}>
									{isFetchingKey ? "Verificando..." : "Continuar"}
								</Button>
							</>
						) : (
							<>
								<Button
									type="button"
									variant="outline"
									onClick={() => setStep(1)}
									disabled={isPending}
								>
									Voltar
								</Button>
								<Button type="submit" disabled={isPending}>
									{isPending ? "Enviando..." : "Confirmar Transação"}
								</Button>
							</>
						)}
					</DialogFooter>
				</form>
			)}
		</DialogContent>
	);
}
