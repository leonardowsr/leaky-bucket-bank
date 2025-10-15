import { configuration } from "@api/config/configuration";
import { UsersModule } from "@api/users/users.module";
import { Module } from "@nestjs/common";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

@Module({
	imports: [
		UsersModule,
		JwtModule.register({
			global: true,
			secret: configuration.jwtSecret,
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		{
			provide: APP_GUARD,
			useFactory: (jwtService: JwtService, reflector: Reflector) => {
				return new AuthGuard(jwtService, reflector);
			},
			inject: [JwtService, Reflector], // Informe quais dependências injetar
		},
	],
	exports: [AuthService],
})
export class AuthModule {}
