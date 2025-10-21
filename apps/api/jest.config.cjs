module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	rootDir: __dirname,
	moduleNameMapper: {
		"^@api/(.*)$": "<rootDir>/src/$1",
		"^@db/(.*)$": "<rootDir>/prisma/$1",
		"^@modules/(.*)$": "<rootDir>/src/modules/$1",
	},
	modulePaths: ["<rootDir>"],
	moduleDirectories: ["node_modules"],
};
