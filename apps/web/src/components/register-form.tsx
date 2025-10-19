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
} from "./ui/field";
import { Input } from "./ui/input";

const registerSchema = z.object({
	name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
	email: z.string().email("Email inválido"),
	password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
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
		onSubmit: async ({ value }) => {
			// Validar com zod
			const validation = registerSchema.safeParse(value);
			if (!validation.success) {
				return;
			}

			try {
				const response = await registerMutation.mutateAsync({
					data: {
						name: value.name,
						email: value.email,
						password: value.password,
					},
				});

				// Redirecionar para login após sucesso
				if (response) {
					router.push("/login");
				}
			} catch (error) {
				// Erro já é tratado no onError do mutation
				console.error("Erro ao registrar:", error);
			}
		},
	});

	const validateField = (value: string, schema: z.ZodSchema) => {
		const validation = schema.safeParse(value);
		if (!validation.success) {
			return validation.error.issues[0]?.message;
		}
		return undefined;
	};

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
								validators={{
									onChange: ({ value }) =>
										validateField(
											value,
											z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
										),
								}}
							>
								{(field) => (
									<Field>
										<FieldLabel htmlFor={nameId}>Nome</FieldLabel>
										<Input
											id={nameId}
											type="text"
											placeholder="John Doe"
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
											placeholder="john@example.com"
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
										<FieldLabel htmlFor={passwordId}>Senha</FieldLabel>
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
										Registrar
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
