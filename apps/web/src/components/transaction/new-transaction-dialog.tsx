"use client";

import { SendIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useSidebar } from "@/hooks/use-sidebar";
import { NewTransactionDialogContent } from "./new-transaction-dialog-content";

export function NewTransactionDialog() {
	const [isOpen, setIsOpen] = useState(false);
	const { isOpen: isSidebarOpen } = useSidebar();

	const dialogKeyRef = useRef(0);

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (open) {
			dialogKeyRef.current += 1;
		}
	};
	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button className="w-full p-5">
					{isSidebarOpen ? (
						<>
							<SendIcon className="mr-2 h-4 w-4" />
							Nova Transação
						</>
					) : (
						<SendIcon />
					)}
				</Button>
			</DialogTrigger>
			<NewTransactionDialogContent
				key={dialogKeyRef.current}
				onClose={() => setIsOpen(false)}
			/>
		</Dialog>
	);
}
