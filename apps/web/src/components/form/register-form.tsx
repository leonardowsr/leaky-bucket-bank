/** biome-ignore-all lint/correctness/noChildrenProp: no need*/
"use client";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useId } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useRegister } from "@/api/client/auth/auth";
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
} from "../ui/field";
import { Input } from "../ui/input";

// como fazer dar erros se apenas tiver espaços em branco?
const registerSchema = z.object({
	name: z.string().trim().min(3, "Nome não pode ser apenas espaços em branco"),
	email: z.email("Email inválido"),
	password: z
		.string()
		.min(8, "Senha deve ter no mínimo 8 caracteres")
		.trim()
		.min(1, "Senha não pode ser apenas espaços em branco"),
});

export function RegisterForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const nameId = useId();
	const emailId = useId();
	const passwordId = useId();

	const registerMutation = useRegister({
		mutation: {
			onError(error) {
				getErrorMessage(error, "Erro ao registrar");
			},
			onSuccess() {
				toast.success("Conta criada com sucesso! Redirecionando para login...");
			},
		},
	});

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		validators: {
			onChangeAsync: registerSchema,
			onChangeAsyncDebounceMs: 500,
		},
		onSubmit: async ({ value }) => {
			try {
				const response = await registerMutation.mutateAsync({
					data: {
						name: value.name,
						email: value.email,
						password: value.password,
					},
				});

				if (response) {
					router.push("/login");
				}
			} catch (error) {
				getErrorMessage(error, "Erro ao registrar");
			}
		},
	});

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Crie sua conta</CardTitle>
					<CardDescription>
						Preencha as informações abaixo para criar sua conta
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
								name="name"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={nameId}>Nome</FieldLabel>
											<Input
												id={nameId}
												type="text"
												placeholder="John Doe"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												aria-invalid={isInvalid}
												autoComplete="name"
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>

							<form.Field
								name="email"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={emailId}>Email</FieldLabel>
											<Input
												id={emailId}
												type="email"
												placeholder="john@example.com"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												aria-invalid={isInvalid}
												autoComplete="email"
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>

							<form.Field
								name="password"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={passwordId}>Senha</FieldLabel>
											<Input
												id={passwordId}
												type="password"
												placeholder="••••••••"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												aria-invalid={isInvalid}
												autoComplete="new-password"
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>

							<Field>
								<Button
									type="submit"
									disabled={registerMutation.isPending}
									className="w-full"
								>
									{registerMutation.isPending ? "Registrando..." : "Register"}
								</Button>
								<FieldDescription className="text-center">
									Já tem uma conta?{" "}
									<Link href="/login" className="text-primary hover:underline">
										Faça login
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
