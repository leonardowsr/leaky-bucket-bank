import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AccountService } from "./account.service";
import { CreateAccountDto, UpdateAccountDto } from "./dto/account.dto";

@ApiTags("account")
@ApiBearerAuth("JWT-auth")
@Controller("account")
export class AccountController {
	constructor(private readonly accountService: AccountService) {}

	@Post()
	create(@Body() createAccountDto: CreateAccountDto) {
		return this.accountService.create(createAccountDto);
	}

	@Get()
	findAll() {
		return this.accountService.findAll();
	}

	@Get("me")
	findAllByUser(@Req() request: Request) {
		const userId = request.user.sub as string;
		if (!userId) {
			throw new BadRequestException("User ID não fornecido");
		}
		return this.accountService.findAllByUser(userId);
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.accountService.findOne(id);
	}

	@Patch(":id")
	update(@Param("id") id: string, @Body() updateAccountDto: UpdateAccountDto) {
		return this.accountService.update(id, updateAccountDto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.accountService.remove(id);
	}
}
