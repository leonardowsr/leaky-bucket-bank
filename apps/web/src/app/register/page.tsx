import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
	return (
		<div
			className="absolute inset-0 z-0 flex min-h-svh w-full items-center justify-center p-6 md:p-10"
			style={{
				backgroundImage: `
        radial-gradient(circle 600px at 0% 200px, #fed7aa, transparent),
        radial-gradient(circle 600px at 100% 200px, #fed7aa, transparent)
      `,
			}}
		>
			<div className="w-full max-w-sm">
				<RegisterForm />
			</div>
		</div>
	);
}
