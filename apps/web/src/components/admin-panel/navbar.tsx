"use client";

import { useState } from "react";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";
import { UserNav } from "@/components/admin-panel/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { NewTransactionDialog } from "../transaction/new-transaction-dialog";

interface NavbarProps {
	title: string;
}

export function Navbar({ title }: NavbarProps) {
	const [_isOpen, _setIsOpen] = useState(false);

	return (
		<header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
			<div className="mx-4 flex h-14 items-center sm:mx-8">
				<div className="flex items-center space-x-4 lg:space-x-0">
					<SheetMenu />
					<h1 className="font-bold">{title}</h1>
				</div>
				<div className="flex flex-1 justify-center">
					<div>
						<NewTransactionDialog />
					</div>
				</div>
				<div className="flex items-center justify-end">
					<ModeToggle />
					<UserNav />
				</div>
			</div>
		</header>
	);
}
