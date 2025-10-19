import { Test, TestingModule } from "@nestjs/testing";
import { AccountKeyController } from "./account-key.controller";
import { AccountKeyService } from "./account-key.service";

describe("AccountKeyController", () => {
	let controller: AccountKeyController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AccountKeyController],
			providers: [AccountKeyService],
		}).compile();

		controller = module.get<AccountKeyController>(AccountKeyController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
