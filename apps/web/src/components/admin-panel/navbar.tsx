"use client";

import { SendIcon } from "lucide-react";
import { useState } from "react";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";
import { UserNav } from "@/components/admin-panel/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { NewTransactionDialogContent } from "@/components/transaction/new-transaction-dialog-content";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "../ui/dialog";

interface NavbarProps {
	title: string;
}

export function Navbar({ title }: NavbarProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
			<div className="mx-4 flex h-14 items-center sm:mx-8">
				<div className="flex items-center space-x-4 lg:space-x-0">
					<SheetMenu />
					<h1 className="font-bold">{title}</h1>
				</div>
				<div className="flex flex-1 justify-center">
					<Dialog open={isOpen} onOpenChange={setIsOpen}>
						<DialogTrigger asChild>
							<Button className="ml-2 p-5">
								<SendIcon className="mr-2 h-4 w-4" />
								Nova Transação
							</Button>
						</DialogTrigger>
						<NewTransactionDialogContent onClose={() => setIsOpen(false)} />
					</Dialog>
				</div>
				<div className="flex items-center justify-end">
					<ModeToggle />
					<UserNav />
				</div>
			</div>
		</header>
	);
}
