"use client";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useId, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn, getErrorMessage } from "@/lib/utils";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "./ui/field";
import { Input } from "./ui/input";

const loginSchema = z.object({
	email: z.string().email("Email inválido"),
	password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const emailId = useId();
	const passwordId = useId();
	const [isPending, startTransition] = useTransition();

	const validateField = (value: string, schema: z.ZodSchema) => {
		const validation = schema.safeParse(value);
		if (!validation.success) {
			return validation.error.issues[0]?.message;
		}
		return undefined;
	};

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			// Validar com zod
			const validation = loginSchema.safeParse(value);
			if (!validation.success) {
				return;
			}

			startTransition(async () => {
				try {
					const response = await fetch("/api/auth/login", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(value),
					});

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.message || "Erro ao fazer login");
					}

					toast.success("Login realizado com sucesso!");
					router.push("/dashboard");
				} catch (error) {
					getErrorMessage(error);
				} finally {
					startTransition(() => {
						form.resetField("password");
					});
				}
			});
		},
	});

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Entre com a sua conta</CardTitle>
					<CardDescription>
						Insira seu email abaixo para fazer login na sua conta
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<FieldGroup>
							<form.Field
								name="email"
								validators={{
									onChange: ({ value }) =>
										validateField(value, z.string().email("Email inválido")),
								}}
							>
								{(field) => (
									<Field>
										<FieldLabel htmlFor={emailId}>Email</FieldLabel>
										<Input
											id={emailId}
											type="email"
											placeholder="m@example.com"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
										/>
										{field.state.meta.errorMap?.onChange && (
											<FieldError>
												{field.state.meta.errorMap.onChange}
											</FieldError>
										)}
									</Field>
								)}
							</form.Field>
							<form.Field
								name="password"
								validators={{
									onChange: ({ value }) =>
										validateField(
											value,
											z
												.string()
												.min(8, "Senha deve ter no mínimo 8 caracteres"),
										),
								}}
							>
								{(field) => (
									<Field>
										<div className="flex items-center">
											<FieldLabel htmlFor={passwordId}>Senha</FieldLabel>
										</div>
										<Input
											id={passwordId}
											type="password"
											placeholder="••••••••"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
										/>
										{field.state.meta.errorMap?.onChange && (
											<FieldError>
												{field.state.meta.errorMap.onChange}
											</FieldError>
										)}
									</Field>
								)}
							</form.Field>
							<Field>
								<Button type="submit" disabled={isPending} className="w-full">
									{isPending ? "Entrando..." : "Entrar"}
								</Button>
								<FieldDescription className="text-center">
									Não tem uma conta?{" "}
									<Link
										href="/register"
										className="text-primary hover:underline"
									>
										Criar conta
									</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
