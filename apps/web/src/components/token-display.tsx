import { useState } from "react";
import {
	getFindByKeyQueryKey,
	useFindByKey,
} from "@/api/client/account-keys/account-keys";
import { getFindMeUserQueryKey, useFindMeUser } from "@/api/client/users/users";
import { getErrorMessage } from "@/lib/utils";
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
	const [accountKey, setAccountKey] = useState(crypto.randomUUID());
	const { refetch: accountKeyRefetch, isLoading: isLoadingAccountKey } =
		useFindByKey(
			{ key: accountKey },
			{
				query: {
					queryKey: [...getFindByKeyQueryKey(), accountKey],
					enabled: false,
					retry: false,
					retryOnMount: false,
				},
			},
		);

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
				<CardTitle className="flex justify-between gap-2 font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
					{isLoading ? (
						<div className="flex items-center gap-2">
							<Skeleton className="h-6 w-6" />
							de 10
						</div>
					) : (
						`${user?.tokenCount} de 10`
					)}
					<Button
						disabled={isLoadingAccountKey || isLoading}
						variant={"destructive"}
						onClick={async () => {
							const res = (await accountKeyRefetch({
								cancelRefetch: true,
							})) as { error?: string };

							getErrorMessage(res.error, "Erro ao forçar erro");

							refetch();
							setAccountKey(crypto.randomUUID());
						}}
					>
						{isLoadingAccountKey ? "Aguarde..." : "Forçar erro"}
					</Button>
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
					<p className="mt-2">
						Para ver como funciona a segurança do pix, consulte o DICT do Banco
						Central:{" "}
						<a
							href="https://www.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT.html"
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-500 underline"
						>
							{" "}
							clique aqui
						</a>
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
