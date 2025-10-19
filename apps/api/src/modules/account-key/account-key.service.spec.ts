import { Test, TestingModule } from "@nestjs/testing";
import { AccountKeyService } from "./account-key.service";

describe("AccountKeyService", () => {
	let service: AccountKeyService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AccountKeyService],
		}).compile();

		service = module.get<AccountKeyService>(AccountKeyService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
