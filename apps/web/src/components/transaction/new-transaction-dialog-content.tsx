/** biome-ignore-all lint/correctness/noChildrenProp: <explanation> */
"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import * as z from "zod";
import {
	getFindMeAccountQueryKey,
	useFindMeAccount,
} from "@/api/client/account/account";
import {
	getFindByKeyQueryKey,
	useFindByKey,
} from "@/api/client/account-keys/account-keys";
import {
	getFindAllByAccountQueryKey,
	useCreate,
} from "@/api/client/transaction/transaction";
import { getFindAllQueryKey } from "@/api/client/users/users";
import { Button } from "@/components/ui/button";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTransactionSubscription } from "@/hooks/use-transaction-subscription";
import { getErrorMessage, moneyToString } from "@/lib/utils";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { MaskInput } from "../ui/mask-input";
import { TransactionProgress } from "./loading-transaction";

interface NewTransactionDialogContentProps {
	onClose: () => void;
}

interface RecipientInfo {
	accountNumber: string;
	recipientName: string;
	receiverKey: string;
}

const formSchema = z.object({
	receiverKey: z
		.string("Digite a chave PIX do destinatário")
		.min(1, "Digite a chave PIX do destinatário"),
	amount: z
		.string()
		.nonempty("Digite o valor a ser transferido")
		.refine(
			(val) => {
				const num = Number.parseFloat(val);
				return !Number.isNaN(num) && num > 0;
			},
			{
				message: "Digite um valor válido",
			},
		),
});

export function NewTransactionDialogContent({
	onClose,
}: NewTransactionDialogContentProps) {
	const [transactionId, setTransactionId] = useState<string>("");
	const [step, setStep] = useState<1 | 2>(1);
	const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(
		null,
	);
	const [searchKey, setSearchKey] = useState<string>("");

	const queryClient = useQueryClient();
	const { data: meAccount } = useFindMeAccount();

	const {
		data: accountKeyData,
		isFetching: isFetchingKey,
		error: accountKeyError,
	} = useFindByKey(
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
	const { mutateAsync: createTransaction, isPending } = useCreate();

	const form = useForm({
		defaultValues: { receiverKey: "", amount: "" },
		validators: {
			onChangeAsync: formSchema,
			onChangeAsyncDebounceMs: 500,
		},
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
				await createTransaction(
					{
						data: {
							amount: amountInCentavos,
							senderId,
							receiverKey: value.receiverKey,
						},
					},
					{
						onSuccess: (data) => {
							setTransactionId(data.transactionId);
						},
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
		if (!isFetchingKey && accountKeyError) {
			const error = accountKeyError as {
				statusCode?: number;
				message?: string;
			};
			if (error.statusCode === 404) {
				form.setFieldMeta("receiverKey", (prev) => ({
					...prev,
					isTouched: true,
					errors: ["Chave PIX não encontrada"],
				}));
				form.setErrorMap({
					onChange: {
						fields: { receiverKey: "Chave PIX não encontrada" },
					},
				});
			}
			getErrorMessage(accountKeyError, "Destinatário da chave não encontrado");
		}
	}, [accountKeyData, searchKey, isFetchingKey, accountKeyError, form]);

	useEffect(() => {
		if (!transactionId || !isFinished) return;
		queryClient.invalidateQueries({ queryKey: getFindMeAccountQueryKey() });
		queryClient.invalidateQueries({ queryKey: getFindAllQueryKey() });
		queryClient.invalidateQueries({
			queryKey: getFindAllByAccountQueryKey(meAccount?.id),
		});
		queryClient.removeQueries({
			queryKey: ["transaction-sse", transactionId],
		});
		const timer = setTimeout(() => {
			onClose();
		}, 1500);

		return () => clearTimeout(timer);
	}, [isFinished, transactionId, queryClient, meAccount?.id, onClose]);

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
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>
												Chave PIX do destinatário
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												onBlur={field.handleBlur}
												placeholder="email@exemplo.com, CPF, telefone..."
												value={field.state.value}
												aria-invalid={isInvalid}
												autoComplete="off"
												onChange={(e) => field.handleChange(e.target.value)}
											/>

											{Boolean(accountKeyError) &&
												searchKey === form.state.values.receiverKey && (
													<FieldError
														errors={[accountKeyError ?? { message: "" }]}
													/>
												)}
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>

							<form.Field
								name="amount"
								validators={{
									onChange: ({ value }) => {
										const num = Number.parseFloat(value);
										if (meAccount && !Number.isNaN(num)) {
											const amountInCentavos = Math.round(num * 100);
											if (amountInCentavos > meAccount.balance) {
												return {
													message: "Saldo insuficiente para esta transação",
												};
											}
										}

										return undefined;
									},
								}}
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;

									return (
										<Field className="space-y-2" data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>
												Valor (em R$)
											</FieldLabel>
											<MaskInput
												mask={"currency"}
												onBlur={field.handleBlur}
												name={field.name}
												aria-invalid={isInvalid}
												placeholder="R$ 0,00"
												value={field.state.value}
												onValueChange={(_, value) => field.handleChange(value)}
											/>
											{/* <Input
												id={field.name}
												type="number"
												step="0.01"
												aria-invalid={isInvalid}
												onBlur={field.handleBlur}
												min="0"
												placeholder="0,00"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
											/> */}
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>
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
