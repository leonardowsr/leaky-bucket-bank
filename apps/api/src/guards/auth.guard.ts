/** biome-ignore-all lint/complexity/useLiteralKeys: no need */
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		private reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.getAllAndOverride<boolean>(
			"IS_PUBLIC_KEY",
			[context.getHandler(), context.getClass()],
		);
		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request>();
		const token = request.headers.authorization?.split(" ")[1];

		if (!token) {
			throw new UnauthorizedException("Token não fornecido");
		}

		try {
			const payload = await this.jwtService.verifyAsync(token);
			request["user"] = payload;
		} catch (_err) {
			throw new UnauthorizedException("Token inválido");
		}
		return true;
	}
}
