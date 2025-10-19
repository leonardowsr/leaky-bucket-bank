"use client";

import { toast } from "sonner";
import { useFindMe, useLoanRequest } from "@/api/client/account/account";
import { PixKeysManager } from "@/components/account/pix-keys-manager";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import PlaceholderContent from "@/components/demo/placeholder-content";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function AccountPage() {
	const loanRequestMutation = useLoanRequest();
	const { data: account } = useFindMe();

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
			<PlaceholderContent>
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
												await loanRequestMutation.mutateAsync(
													{
														id: account.id,
													},
													{
														onSuccess: () => {
															toast.success(
																"Empréstimo solicitado com sucesso!",
															);
														},
													},
												)
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
