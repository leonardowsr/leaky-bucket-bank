import { Module } from "@nestjs/common";
import { AccountKeyController } from "./account-key.controller";
import { AccountKeyService } from "./account-key.service";

@Module({
	controllers: [AccountKeyController],
	providers: [AccountKeyService],
})
export class AccountKeyModule {}
