"use client";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useLogin } from "@/api/client/auth/auth";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getErrorMessage } from "@/hooks/api-error";
import { cn } from "@/lib/utils";
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

	const loginMutation = useLogin({
		mutation: {
			onError(error) {
				const message = getErrorMessage(error, "Erro ao fazer login");
				toast.error(message);
			},
			onSuccess() {
				toast.success("Login realizado com sucesso!");
			},
		},
	});

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

			try {
				await loginMutation.mutateAsync({
					data: value,
				});

				// Cookies são setados automaticamente pelo servidor
				// Redireciona para home
				router.push("/");
			} catch (error) {
				// Erro já é tratado no onError do mutation
				console.error("Erro ao fazer login:", error);
			}
		},
	});

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Login to your account</CardTitle>
					<CardDescription>
						Enter your email below to login to your account
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
											<FieldLabel htmlFor={passwordId}>Password</FieldLabel>
											<Link
												href="#"
												className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
											>
												Forgot your password?
											</Link>
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
								<Button
									type="submit"
									disabled={loginMutation.isPending}
									className="w-full"
								>
									{loginMutation.isPending ? "Entrando..." : "Login"}
								</Button>
								<FieldDescription className="text-center">
									Don&apos;t have an account?{" "}
									<Link
										href="/register"
										className="text-primary hover:underline"
									>
										Sign up
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
