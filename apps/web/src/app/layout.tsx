import type { Metadata } from "next";

import "./index.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ReactQueryProvider } from "@/components/react-query-provider";

export const metadata: Metadata = {
	title: "My App",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ReactQueryProvider>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
						{children}
					</ThemeProvider>
				</ReactQueryProvider>
			</body>
		</html>
	);
}
