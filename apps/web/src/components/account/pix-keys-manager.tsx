"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Key, Loader2, Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { useFindMe } from "@/api/client/account/account";
import {
	useCreate,
	useFindAll,
	useRemove,
} from "@/api/client/account-keys/account-keys";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PixKeysManager() {
	const [newKey, setNewKey] = useState("");
	const queryClient = useQueryClient();
	const inputId = useId();

	const { data: account } = useFindMe();

	const { data: pixKeys, isLoading: isLoadingKeys } = useFindAll();

	const createMutation = useCreate({
		mutation: {
			onSuccess: () => {
				toast.success("Chave PIX cadastrada com sucesso!");
				setNewKey("");
				// Refetch das chaves
				queryClient.invalidateQueries({ queryKey: ["/account-key"] });
			},
			onError: (error: unknown) => {
				const errorMessage =
					(error as { response?: { data?: { message?: string } } })?.response
						?.data?.message || "Ocorreu um erro ao cadastrar a chave PIX.";
				toast.error(errorMessage);
			},
		},
	});

	const removeMutation = useRemove({
		mutation: {
			onSuccess: () => {
				toast.success("Chave PIX removida com sucesso!");
				queryClient.invalidateQueries({ queryKey: ["/account-key"] });
			},
			onError: (error: unknown) => {
				const errorMessage =
					(error as { response?: { data?: { message?: string } } })?.response
						?.data?.message || "Ocorreu um erro ao remover a chave PIX.";
				toast.error(errorMessage);
			},
		},
	});

	const handleCreateKey = () => {
		if (!newKey.trim()) {
			toast.error("Por favor, informe a chave PIX.");
			return;
		}

		if (!account?.id) {
			toast.error("Conta não encontrada.");
			return;
		}

		createMutation.mutate({
			data: {
				accountId: account.id,
				key: newKey.trim(),
			},
		});
	};

	const handleRemoveKey = async (keyId: string) => {
		await removeMutation.mutateAsync({ id: keyId });
	};

	return (
		<div className="px-4 lg:px-6">
			<h2 className="mb-4 font-bold text-2xl">Gerenciar Chaves PIX</h2>

			<div className="grid gap-4 md:grid-cols-2">
				{/* Card para criar nova chave */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Plus className="h-5 w-5" />
							Nova Chave PIX
						</CardTitle>
						<CardDescription>
							Adicione uma nova chave PIX à sua conta <br />
							<span className="text-primary">
								Obs: não coloque dados sensíveis reais. Use dados fictícios.
							</span>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor={inputId}>Chave PIX</Label>
							<div className="flex gap-2">
								<Input
									id={inputId}
									placeholder="nome, email ou chave-aleatória."
									value={newKey}
									onChange={(e) =>
										setNewKey(e.target.value.replaceAll(" ", "-"))
									}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleCreateKey();
										}
									}}
									disabled={createMutation.isPending}
								/>
								<Button
									onClick={() => {
										// Gerar chave aleatória
										const randomKey = crypto.randomUUID();
										setNewKey(randomKey);
									}}
								>
									Gerar
								</Button>
							</div>
							<p className="text-muted-foreground text-xs">
								Pode ser um email, telefone, CPF, CNPJ ou chave aleatória
							</p>
						</div>
						<Button
							onClick={handleCreateKey}
							disabled={createMutation.isPending || !newKey.trim()}
							className="w-full"
						>
							{createMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Cadastrando...
								</>
							) : (
								<>
									<Plus className="mr-2 h-4 w-4" />
									Cadastrar Chave
								</>
							)}
						</Button>
					</CardContent>
				</Card>

				{/* Card com lista de chaves */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Key className="h-5 w-5" />
							Minhas Chaves PIX
						</CardTitle>
						<CardDescription>
							{pixKeys?.length
								? `${pixKeys.length} ${pixKeys.length === 1 ? "chave cadastrada" : "chaves cadastradas"}`
								: "Nenhuma chave cadastrada"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ScrollArea className="h-[300px] w-full pr-4">
							{isLoadingKeys ? (
								<div className="flex h-full items-center justify-center">
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								</div>
							) : pixKeys && pixKeys.length > 0 ? (
								<div className="space-y-2">
									{pixKeys.map((pixKey) => (
										<div
											key={pixKey.id}
											className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
										>
											<div className="flex-1 space-y-1">
												<p className="font-medium text-sm">{pixKey.key}</p>
												<p className="text-muted-foreground text-xs">
													Cadastrada em{" "}
													{new Date(pixKey.createdAt).toLocaleDateString(
														"pt-BR",
													)}
												</p>
											</div>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleRemoveKey(pixKey.id)}
												disabled={removeMutation.isPending}
												className="text-destructive hover:bg-destructive/10 hover:text-destructive"
											>
												{removeMutation.isPending ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Trash2 className="h-4 w-4" />
												)}
											</Button>
										</div>
									))}
								</div>
							) : (
								<div className="flex h-full flex-col items-center justify-center gap-2 text-center">
									<Key className="h-12 w-12 text-muted-foreground/50" />
									<p className="text-muted-foreground text-sm">
										Nenhuma chave PIX cadastrada
									</p>
									<p className="text-muted-foreground text-xs">
										Cadastre sua primeira chave para começar a receber
										transferências
									</p>
								</div>
							)}
						</ScrollArea>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
