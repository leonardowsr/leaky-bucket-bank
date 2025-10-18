import { Card, CardContent } from "@/components/ui/card";

export default function PlaceholderContent({
	children,
}: {
	children?: React.ReactNode;
}) {
	return (
		<Card className="rounded-lg border-none">
			<CardContent>
				<div>{children}</div>
			</CardContent>
		</Card>
	);
}
