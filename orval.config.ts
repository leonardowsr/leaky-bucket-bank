import { defineConfig } from "orval";

export default defineConfig({
	apiClient: {
		input: "./apps/api/swagger.json", // caminho para o arquivo swagger,
		output: {
			mode: "tags-split", // gera um único arquivo
			target: "./apps/web/src/api/client", // destino do client no front
			client: "react-query", // ou 'axios' ou 'fetch'
			httpClient: "axios",
			schemas: "./apps/web/src/api/schemas", // onde salvar os schemas,
			clean: true,
			biome: true,
			override: {
				mutator: {
					path: "./apps/web/src/api/axiosClient.ts",
					name: "axiosClient",
				},
				operationName: (operation) => {
					const operationId = operation.operationId ?? "UnknownOperation";
					if (!operationId || operationId === "UnknownOperation") {
						return "UnknownOperation";
					}

					// Remove "Controller_" prefix (e.g., "UserController_findAll" -> "findAll")
					return operationId.replace(/^[A-Za-z]+Controller_/, "");
				},
			},
		},
	},
});
