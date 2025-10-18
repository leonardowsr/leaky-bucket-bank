"use client";
import { TrendingUp } from "lucide-react";
import { useFindMe } from "@/api/client/account/account";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import PlaceholderContent from "@/components/demo/placeholder-content";
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
	const { data: account } = useFindMe();
	const accountId = account?.id;

	return (
		<ContentLayout title="Dashboard">
			<PlaceholderContent>
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
								Trending up this month <TrendingUp className="size-4" />
							</div>
							<div className="text-muted-foreground">
								Visitors for the last 6 months
							</div>
						</CardFooter>
					</Card>
					<Card className="@container/card">
						<CardHeader>
							<CardDescription>Total Revenue</CardDescription>
							<CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
								$1,250.00
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
								Trending up this month <TrendingUp className="size-4" />
							</div>
							<div className="text-muted-foreground">
								Visitors for the last 6 months
							</div>
						</CardFooter>
					</Card>
				</div>

				<div className="mt-4 grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
					<SentTransactionsCard accountId={accountId || ""} />
					<ReceivedTransactionsCard accountId={accountId || ""} />
				</div>
			</PlaceholderContent>
		</ContentLayout>
	);
}
