"use client";

import { SendIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useSidebar } from "@/hooks/use-sidebar";
import { NewTransactionDialogContent } from "./new-transaction-dialog-content";

export function NewTransactionDialog() {
	const [isOpen, setIsOpen] = useState(false);
	const { isOpen: isSidebarOpen } = useSidebar();

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
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
			<NewTransactionDialogContent onClose={() => setIsOpen(false)} />
		</Dialog>
	);
}
