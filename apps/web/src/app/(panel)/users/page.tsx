"use client";

import { Copy, CopyCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useFindAll as useFindAllUsers } from "@/api/client/users/users";
import PlaceholderContent from "@/components/layout/placeholder-content";
import { ContentLayout } from "@/components/panel/content-layout";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { moneyToString } from "@/lib/utils";

function maskEmail(email: string): string {
	const [localPart, domain] = email.split("@");
	if (!localPart || !domain) return email;

	const maskedLocal = `${localPart.charAt(0)}***`;
	return `${maskedLocal}@${domain}`;
}

export default function UsersPage() {
	const [copiedtext, setCopiedText] = useState<string>("");
	const { data: usersData = [], isLoading } = useFindAllUsers();

	return (
		<ContentLayout title="Usuários do Banco">
			<PlaceholderContent
				CardHeader={
					<CardHeader>
						<CardTitle>Lista de Usuários</CardTitle>
						<CardDescription>
							Aqui mostrará os 100 ultimos usuários registrados no banco.
						</CardDescription>
					</CardHeader>
				}
			>
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<p className="text-muted-foreground">Carregando...</p>
					</div>
				) : usersData.length === 0 ? (
					<div className="flex items-center justify-center py-8">
						<p className="text-muted-foreground">Nenhum usuário encontrado</p>
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nome</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Número da Conta</TableHead>
								<TableHead>Chaves PIX</TableHead>
								<TableHead className="text-right">Saldo</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{usersData.map((user) => {
								if (!user) return null;
								return (
									<TableRow key={user.id}>
										<TableCell className="font-medium">{user.name}</TableCell>
										<TableCell>{maskEmail(user.email)}</TableCell>
										<TableCell className="font-medium">
											{user.account?.accountNumber || "N/A"}
										</TableCell>

										<TableCell className="min-w-0">
											{" "}
											{/* Adiciona min-w-0 para permitir quebra de texto se necessário */}
											<div className="flex flex-col gap-1">
												{" "}
												{/* Usa flex-col com gap para espaçamento controlado */}
												{user.account?.accountKeys?.map((key, i) => {
													const Icon =
														copiedtext !== key.key ? Copy : CopyCheck;
													return (
														<div
															key={i}
															className="flex min-w-0 items-center gap-2"
														>
															<span className="truncate text-sm">
																{key.key as string}
															</span>
															<Icon
																className="h-5 w-5 flex-shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-primary"
																onClick={() => {
																	setCopiedText(key.key as string);
																	navigator.clipboard.writeText(
																		key.key as string,
																	);
																	toast.success(
																		`Chave PIX: ${key.key} copiada para a área de transferência`,
																	);
																}}
															/>
														</div>
													);
												})}
											</div>
										</TableCell>
										<TableCell className="text-right font-mono">
											{user.account
												? moneyToString(user.account.balance)
												: "R$ 0,00"}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				)}
			</PlaceholderContent>
		</ContentLayout>
	);
}
