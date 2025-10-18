/** biome-ignore-all lint/a11y/useSemanticElements: no need*/
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils"; // se não tiver, troque por classnames simples

type TransactionProgressProps = {
	running: boolean; // true enquanto a transação estiver pendente
	finalLabel?: string; // texto quando finalizar (ex.: "Transação concluída")
	className?: string;
	intervalMs?: number; // tempo entre mensagens
	steps?: string[]; // mensagens personalizadas
};

const DEFAULT_STEPS = [
	"Validando os dados...",
	"Reservando saldo na sua conta...",
	"Enfileirando a transação com o provedor...",
	"Comunicando o banco emissor...",
	"Aguardando confirmação...",
	"Finalizando com segurança...",
];

export function TransactionProgress({
	running,
	finalLabel = "Transação concluída",
	className,
	intervalMs = 1600,
	steps = DEFAULT_STEPS,
}: TransactionProgressProps) {
	const [idx, setIdx] = useState(0);
	const timerRef = useRef<number | null>(null);

	// reinicia quando voltar a rodar
	useEffect(() => {
		if (running) setIdx(0);
	}, [running]);

	// avança as mensagens no intervalo
	useEffect(() => {
		if (!running) {
			if (timerRef.current) window.clearInterval(timerRef.current);
			timerRef.current = null;
			return;
		}
		timerRef.current = window.setInterval(() => {
			setIdx((i) => (i + 1) % steps.length);
		}, intervalMs);
		return () => {
			if (timerRef.current) window.clearInterval(timerRef.current);
			timerRef.current = null;
		};
	}, [running, steps.length, intervalMs]);

	const current = useMemo(
		() => (running ? steps[idx] : finalLabel),
		[running, steps, idx, finalLabel],
	);

	return (
		<div
			className={cn(
				"w-full rounded-2xl border bg-card/60 p-5 shadow-sm backdrop-blur",
				"md:p-6",
				className,
			)}
			aria-live="polite"
			aria-busy={running}
		>
			<div className="flex items-start gap-4">
				{running ? (
					<Spinner className="mt-0.5" />
				) : (
					<Checkmark className="mt-0.5" />
				)}

				<div className="flex-1">
					<p className="text-muted-foreground text-sm">Processando transação</p>

					<div className="mt-1.5 min-h-[32px]">
						<AnimatePresence mode="wait">
							<motion.div
								key={current}
								initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
								animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
								exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
								transition={{ duration: 0.35 }}
								className="font-medium text-base tracking-tight"
							>
								{current}
							</motion.div>
						</AnimatePresence>
					</div>

					{/* barra de progresso */}
					<div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
						{running ? (
							<motion.div
								className="h-full w-1/3 rounded-full bg-primary"
								initial={{ x: "-100%" }}
								animate={{ x: ["-100%", "120%"] }}
								transition={{
									duration: 1.4,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
							/>
						) : (
							<div className="h-full w-full rounded-full bg-primary" />
						)}
					</div>

					{/* dicas/sutilezas */}
					{running ? (
						<p className="mt-3 text-muted-foreground text-xs">
							Não feche esta janela. Sua transação está sendo confirmada com o
							banco.
						</p>
					) : (
						<p className="mt-3 text-muted-foreground text-xs">
							Você já pode voltar ao dashboard. Obrigado por aguardar.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

/* ====== Ícones ====== */
function Spinner({ className }: { className?: string }) {
	return (
		<div
			className={cn("relative size-6", className)}
			role="status"
			aria-label="Carregando"
		>
			<div className="absolute inset-0 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
		</div>
	);
}

function Checkmark({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"grid size-6 place-items-center rounded-full bg-primary/10",
				className,
			)}
		>
			<svg
				className="size-4 text-primary"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="M20 6 9 17l-5-5" />
			</svg>
		</div>
	);
}
