import { JwtPayload } from "jsonwebtoken";

declare global {
	namespace Express {
		export interface UserPayload extends JwtPayload {
			sub: string;
			email?: string;
		}

		export interface Request {
			user?: UserPayload;
		}
	}
}
