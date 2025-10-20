import { getFindMeUserQueryKey, useFindMeUser } from "@/api/client/users/users";
import { Button } from "./ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export const TokenDisplay = () => {
	const {
		data: user,
		isLoading,
		isError,
		refetch,
	} = useFindMeUser({
		query: {
			refetchInterval: 10000, // atualizar a cada 10 segundos
			queryKey: getFindMeUserQueryKey(),
		},
	});

	if (isLoading) {
		<LoadingSkeleton />;
	}

	if (isError)
		return (
			<Card className="@container/card">
				<div className="flex flex-col items-center justify-center gap-4 p-4">
					<div>Erro ao carregar os dados do usuário</div>
					<Button onClick={() => refetch()}>Tentar Novamente</Button>
				</div>
			</Card>
		);

	return (
		<Card className="@container/card">
			<CardHeader>
				<CardDescription>Tokens usados</CardDescription>
				<CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
					{isLoading ? "Carregando..." : `${user?.tokenCount} de 10`}
				</CardTitle>
			</CardHeader>
			<CardFooter className="flex-col items-start gap-1.5 text-sm">
				<div className="line-clamp-1 flex gap-2 font-medium">
					Regras de Negócio do Leaky Bucket
				</div>
				<div className="mt-3 space-y-1 text-muted-foreground text-xs">
					<p>
						• Cada requisição consome 1 token, se a requisição for bem-sucedida,
						o token é restaurado (não é consumido)
					</p>
					<p>
						• O token é gradualmente restaurado, <b>1 por hora</b>
					</p>
					<p>
						• Se todos os tokens forem consumidos, você receberá um mensagem de
						erro.
					</p>
				</div>
			</CardFooter>
		</Card>
	);
};

const LoadingSkeleton = () => {
	return (
		<Card className="@container/card">
			<CardHeader>
				<CardDescription>Tokens usados</CardDescription>
				<CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
					<div className="flex items-center gap-2">
						<Skeleton className="h-6 w-6" /> de 10
					</div>
				</CardTitle>
			</CardHeader>
		</Card>
	);
};
