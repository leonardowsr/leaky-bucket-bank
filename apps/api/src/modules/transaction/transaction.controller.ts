import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { TransactionService } from "./transaction.service";

@ApiTags("Transaction")
@ApiBearerAuth("JWT-auth")
@Controller("transaction")
export class TransactionController {
	constructor(private readonly transactionService: TransactionService) {}

	@Post()
	create(@Body() createTransactionDto: CreateTransactionDto) {
		return this.transactionService.create(createTransactionDto);
	}

	@Get()
	findAll() {
		return this.transactionService.findAll();
	}

	@Get(":id/list-by-account")
	findAllByAccount(@Param("id") accountId: string) {
		return this.transactionService.findAllByAccount(accountId);
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.transactionService.findOne(id);
	}
}
