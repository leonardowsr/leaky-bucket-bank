export type AcessTokenPayload = {
	sub: string;
	email: string;
};

export type RefreshTokenPayload = { refresh: true } & AcessTokenPayload;
