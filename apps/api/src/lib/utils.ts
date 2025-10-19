export const generateAccoutNumber = () => {
	const randomAccountNumber = Math.floor(
		100000 + Math.random() * 900000,
	).toString();

	return randomAccountNumber;
};
