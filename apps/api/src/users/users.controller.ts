import { Controller, Get, Param, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiParam, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiBearerAuth("JWT-auth")
@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@ApiParam({ name: "page", required: false, type: Number })
	@ApiParam({ name: "limit", required: false, type: Number })
	@Get()
	findAll(@Query() query: { page: number; limit: number }) {
		return this.usersService.findAll(query);
	}

	@Get("me")
	findMe(@Req() req: Request & { user: { sub: string } }) {
		const userId = req.user.sub;
		return this.usersService.findMe(userId);
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.usersService.findOne(id);
	}
}
