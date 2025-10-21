"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getFindMeAccountQueryKey,
	useFindMeAccount,
	useLoanRequest,
} from "@/api/client/account/account";
import type { AccountResponseDto } from "@/api/schemas";
import { PixKeysManager } from "@/components/account/pix-keys-manager";
import PlaceholderContent from "@/components/layout/placeholder-content";
import { ContentLayout } from "@/components/panel/content-layout";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function AccountPage() {
	const queryClient = useQueryClient();

	const loanRequestMutation = useLoanRequest({
		mutation: {
			onMutate: async (_variables) => {
				await queryClient.cancelQueries({
					queryKey: getFindMeAccountQueryKey(),
				});
				const previousAccount = queryClient.getQueryData(
					getFindMeAccountQueryKey(),
				) as AccountResponseDto;

				if (previousAccount) {
					queryClient.setQueryData(getFindMeAccountQueryKey(), {
						...previousAccount,
						balance: previousAccount.balance + 1000000,
					});
				}
				return { previousAccount };
			},
			onError: (_error, _variables, context) => {
				if (context?.previousAccount) {
					queryClient.setQueryData(
						getFindMeAccountQueryKey(),
						context.previousAccount,
					);
				}
			},
			onSuccess() {
				toast.success("Empréstimo solicitado com sucesso!");
			},
			onSettled() {
				queryClient.invalidateQueries({ queryKey: getFindMeAccountQueryKey() });
			},
		},
	});
	const { data: account } = useFindMeAccount();

	if (!account) {
		return (
			<ContentLayout title="Minha conta">
				<PlaceholderContent>
					Erro ao carregar os dados da conta.
				</PlaceholderContent>
			</ContentLayout>
		);
	}
	return (
		<ContentLayout title="Minha conta">
			<PlaceholderContent
				CardHeader={
					<CardHeader>
						<CardTitle>Gerenciar conta</CardTitle>
						<CardDescription>
							Aqui você pode gerenciar suas chaves PIX, e solicitar um
							empréstimo.
						</CardDescription>
					</CardHeader>
				}
			>
				<PixKeysManager />
				<div className="mt-4 space-y-6">
					<div className="@5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-2 lg:px-6 dark:*:data-[slot=card]:bg-card">
						<Card className="@container/card">
							<CardHeader>
								<CardDescription>Solicitar dinheiro ao banco</CardDescription>
								<CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
									<div className="flex items-center gap-4">
										<Button
											disabled={loanRequestMutation.isPending}
											onClick={async () =>
												await loanRequestMutation.mutateAsync({
													id: account.id,
												})
											}
										>
											{!loanRequestMutation.isPending
												? "Pedir Empréstimo"
												: "Aguarde..."}
										</Button>
										<p className="text-lg">R$ 10.000,00</p>
									</div>
								</CardTitle>
							</CardHeader>
							<CardFooter className="flex-col items-start gap-1.5 text-sm">
								<div className="font-bold text-muted-foreground">
									Seu saldo está baixo?
								</div>
								<p>
									Caso seu saldo esteja baixo, você pode solicitar um empréstimo
									ao banco. <br /> O valor será creditado em sua conta
									imediatamente e você terá 30 dias para pagar o valor
									solicitado.
								</p>
							</CardFooter>
						</Card>
					</div>
				</div>
			</PlaceholderContent>
		</ContentLayout>
	);
}
