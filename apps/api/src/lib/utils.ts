export const generateAccoutNumber = () => {
	const randomAccountNumber = Math.floor(
		100000 + Math.random() * 900000,
	).toString();

	return randomAccountNumber;
};

export function maskEmail(email: string): string {
	const [localPart, domain] = email.split("@");
	if (!localPart || !domain) return email;

	const maskedLocal = `${localPart.charAt(0)}***`;
	return `${maskedLocal}@${domain}`;
}
