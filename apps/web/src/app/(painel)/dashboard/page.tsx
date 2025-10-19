"use client";
import { TrendingUp } from "lucide-react";
import { useFindMeAccount } from "@/api/client/account/account";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import PlaceholderContent from "@/components/demo/placeholder-content";
import { TokenDisplay } from "@/components/token-display";
import { NewTransactionDialog } from "@/components/transaction/new-transaction-dialog";
import { ReceivedTransactionsCard } from "@/components/transaction/received-transactions-card";
import { SentTransactionsCard } from "@/components/transaction/sent-transactions-card";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { moneyToString } from "@/lib/utils";

export default function HomePage() {
	const { data: account } = useFindMeAccount();
	const accountId = account?.id;

	return (
		<ContentLayout title="Dashboard">
			<PlaceholderContent
				CardHeader={
					<CardHeader>
						<CardTitle>Bem vindo!</CardTitle>
						<CardDescription>
							Visão geral da sua conta e atividades recentes
						</CardDescription>
					</CardHeader>
				}
			>
				<div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-2 lg:px-6 dark:*:data-[slot=card]:bg-card">
					<Card className="@container/card">
						<CardHeader>
							<CardDescription>Saldo disponível</CardDescription>
							<CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
								{moneyToString(account?.balance)}
							</CardTitle>
							<CardAction>
								<Badge variant="outline">
									<TrendingUp />
									+12.5%
								</Badge>
							</CardAction>
						</CardHeader>
						<CardFooter className="flex-col items-start gap-1.5 text-sm">
							<div className="line-clamp-1 flex gap-2 font-medium">
								Ultima atualização:{" "}
								<span className="font-normal text-muted-foreground">
									{new Date().toLocaleString()}
								</span>
							</div>
							<NewTransactionDialog />
						</CardFooter>
					</Card>
					<TokenDisplay />
				</div>

				<div className="mt-4 grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
					<SentTransactionsCard accountId={accountId || ""} />
					<ReceivedTransactionsCard accountId={accountId || ""} />
				</div>
			</PlaceholderContent>
		</ContentLayout>
	);
}
