import { Controller, Get, Param, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiParam, ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";

@ApiTags("users")
@ApiBearerAuth("JWT-auth")
@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiParam({ name: "page", required: false, type: Number })
	@ApiParam({ name: "limit", required: false, type: Number })
	@Get()
	findAll(@Query() query: { page: number; limit: number }) {
		return this.userService.findAll(query);
	}

	@Get("me")
	findMe(@Req() req: Request & { user: { sub: string } }) {
		const userId = req.user.sub;
		return this.userService.findMe(userId);
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.userService.findOne(id);
	}
}
