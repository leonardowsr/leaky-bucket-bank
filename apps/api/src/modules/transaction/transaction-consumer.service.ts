import { Injectable } from "@nestjs/common";
import { UpdateTransactionDto } from "./dto/create-transaction.dto";
import { TransactionService } from "./transaction.service";

@Injectable()
export class TransactionConsumerService {
	constructor(private readonly transactionService: TransactionService) {}

	async consumer(data: UpdateTransactionDto) {
		try {
			const result = await this.transactionService.updateTransaction(data);
			return await this.transactionService.updateStatus(result.id, "approved");
		} catch (error) {
			await this.transactionService.updateStatus(
				data.transactionId,
				"rejected",
			);
			throw error;
		}
	}
}
