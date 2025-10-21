import { configuration } from "@api/config/configuration";
import { LeakyBucketGuard } from "@api/guards/leaky-bucket.guard";
import { LeakyBucketInterceptor } from "@api/guards/leaky-bucket.interceptor";
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	InternalServerErrorException,
	Param,
	Post,
	Query,
	Sse,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { interval, map, switchMap, takeWhile } from "rxjs";
import {
	CreateTransactionDto,
	TransactionStatusDto,
} from "./dto/create-transaction.dto";
import {
	CreateTransactionResponseDto,
	TransactionResponseDto,
} from "./dto/transaction-response.dto";
import { TransactionService } from "./transaction.service";

@ApiTags("Transaction")
@ApiBearerAuth("JWT-auth")
@Controller("transaction")
export class TransactionController {
	constructor(
		private readonly transactionService: TransactionService,
		@Inject(configuration.rabbitmq.injection_name)
		private client: ClientProxy,
	) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: "Cria uma nova transação bancária",
		description:
			"Cria uma nova transação entre duas contas. A transação é inicialmente criada com status PENDING e é enfileirada no RabbitMQ para processamento assíncrono",
	})
	@ApiBody({
		type: CreateTransactionDto,
		description: "Dados da transação a ser criada",
	})
	@ApiResponse({
		status: 201,
		description: "Transação criada e enfileirada com sucesso",
		type: CreateTransactionResponseDto,
	})
	@ApiResponse({
		status: 400,
		description:
			"Dados inválidos ou validação falhou (ex: contas iguais, saldo insuficiente)",
	})
	@ApiResponse({
		status: 401,
		description: "Token JWT ausente ou inválido",
	})
	@ApiResponse({
		status: 500,
		description: "Erro ao enfileirar a transação no RabbitMQ",
	})
	@UseGuards(LeakyBucketGuard)
	@UseInterceptors(LeakyBucketInterceptor)
	async create(@Body() createTransactionDto: CreateTransactionDto) {
		await this.transactionService.validateTransaction(createTransactionDto);
		const transaction =
			await this.transactionService.createPendingTransaction(
				createTransactionDto,
			);
		try {
			this.client.emit(configuration.rabbitmq.queue.transactionsCreated, {
				transactionId: transaction.id,
				...createTransactionDto,
			});
			return { transactionId: transaction.id, status: transaction.status };
		} catch (error) {
			console.error("Erro ao enviar evento:", error);
			throw new InternalServerErrorException("Falha ao enfileirar transação");
		}
	}

	@Get()
	@ApiOperation({
		summary: "Lista todas as transações",
		description:
			"Retorna uma lista de todas as transações bancárias registradas no sistema",
	})
	@ApiResponse({
		status: 200,
		description: "Lista de transações retornada com sucesso",
		type: [TransactionResponseDto],
	})
	@ApiResponse({
		status: 401,
		description: "Token JWT ausente ou inválido",
	})
	findAll() {
		return this.transactionService.findAll();
	}

	@Get(":id/list-by-account")
	@ApiParam({
		name: "id",
		description: "UUID da conta para filtrar transações",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiOperation({
		summary: "Lista transações de uma conta específica",
		description:
			"Retorna todas as transações (enviadas e recebidas) de uma conta bancária",
	})
	@ApiResponse({
		status: 200,
		description: "Transações da conta retornadas com sucesso",
		type: [TransactionResponseDto],
	})
	@ApiResponse({
		status: 401,
		description: "Token JWT ausente ou inválido",
	})
	@ApiResponse({
		status: 404,
		description: "Conta não encontrada",
	})
	@ApiQuery({
		name: "limit",
		required: false,
		schema: { default: 100 },
		description: "Número máximo de transações a serem retornadas",
	})
	@ApiQuery({
		name: "page",
		required: false,
		schema: { default: 1 },
		description: "Número da página a ser retornada",
	})
	@ApiQuery({
		name: "type",
		required: false,
		schema: { enum: ["sent", "received"] },
		description:
			"Filtrar por tipo de transação: 'sent' (enviadas) ou 'received' (recebidas)",
	})
	findAllByAccount(
		@Param("id") accountId: string,
		@Query("limit") limit?: number,
		@Query("page") page?: number,
		@Query("type") type?: "sent" | "received",
	) {
		return this.transactionService.findAllByAccount(
			accountId,
			limit,
			page,
			type,
		);
	}

	@Get(":id")
	@ApiParam({
		name: "id",
		description: "UUID da transação a ser recuperada",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiOperation({
		summary: "Obtém uma transação específica",
		description: "Retorna os dados detalhados de uma transação pelo seu UUID",
	})
	@ApiResponse({
		status: 200,
		description: "Transação encontrada e retornada com sucesso",
		type: TransactionResponseDto,
	})
	@ApiResponse({
		status: 401,
		description: "Token JWT ausente ou inválido",
	})
	@ApiResponse({
		status: 404,
		description: "Transação não encontrada com esse UUID",
	})
	findOne(@Param("id") id: string) {
		return this.transactionService.findOne(id);
	}

	@ApiResponse({
		status: 200,
		type: TransactionStatusDto,
		description: "Fluxo SSE para atualizações de status da transação iniciado",
	})
	@ApiResponse({
		status: 401,
		description: "Token JWT ausente ou inválido",
	})
	@ApiResponse({
		status: 404,
		description: "Transação não encontrada com esse UUID",
	})
	@ApiOperation({
		summary: "Fluxo SSE para atualizações de status da transação",
		description:
			"Fornece um fluxo Server-Sent Events (SSE) que envia atualizações em tempo real sobre o status de uma transação específica",
	})
	@ApiParam({
		name: "transactionId",
		description: "UUID da transação para receber atualizações de status",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@Sse(":transactionId/sse")
	async sse(@Param("transactionId") transactionId: string) {
		return interval(500).pipe(
			switchMap(() =>
				this.transactionService.transactionStatusUpdateMapper(transactionId),
			),
			takeWhile((statusDto) => statusDto.status === "pending", true),
			map((statusDto) => ({
				data: statusDto,
			})),
		);
	}
}
