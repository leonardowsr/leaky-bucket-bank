# @financial/commons

Coleção de esquemas (Zod) compartilhados para validação e tipagem das entidades do domínio financeiro da aplicação. Este pacote facilita a validação de payloads (ex.: handlers de API) e o compartilhamento de tipos entre front-end e back-end.

- Baseado em Zod
- Alinhado aos modelos Prisma do projeto
- Inclui esquemas de criação/atualização (Create/Update) e tipos inferidos

## Instalação

O pacote faz parte do mono-repo e é publicado como `@financial/commons`. Em projetos que consumirem este pacote:

    import {
      // Schemas e tipos...
    } from "@prismo/core";

## Conceitos e convenções

- DateTime

  - Os campos de data/hora aceitam `Date` ou string ISO 8601 com offset (ex.: `2025-01-01T00:00:00Z`).
  - Dica: em payloads JSON, prefira strings ISO com `Z` (UTC) ou offset explícito.

- Decimals

  - Valores monetários são armazenados como números inteiros em centavos para evitar problemas de precisão.
  - Ex.: R$ 1234,56 é armazenado como `123456` centavos.
  - Valores percentuais são armazenados em centavos (ex: 5,25% = `525`).

- Update schemas
  - Schemas de atualização são parciais e `strict()` (rejeitam chaves desconhecidas).
  - Úteis para `PATCH`/`PUT` de APIs.

## Exemplo rápido: validando um payload de criação

    import {
      MovementCreateSchema,
      MovementTypeSchema,
    } from "@prismo/core";

    const payload = {
      spaceId: "64b8b2a6-3e8b-4b12-9cc8-2d4cbd0a0c11",
      type: MovementTypeSchema.enum.EXPENSE,
      description: "Aluguel",
      amount: "3500.00",            // string recomendado
      movementDate: "2025-01-01T00:00:00Z",
      isRecurrent: true,
      frequency: "MONTHLY",
    };

    const result = MovementCreateSchema.safeParse(payload);
    if (!result.success) {
      console.error(result.error.flatten());
      // Retorne 400 na API, por exemplo
    } else {
      // result.data está tipado e validado
      console.log(result.data);
    }

## Exemplo: tipos inferidos

    import type {
      MovementCreateInput,
      Movement,
    } from "@prismo/core";

    function createMovement(data: MovementCreateInput): Promise<Movement> {
      // ...
      return Promise.resolve({} as Movement);
    }

## Esquemas disponíveis

Abaixo um panorama dos principais exports. Todos já são re-exportados pelo `@financial/commons`.

- Enums

  - `RoleSchema` — "user" | "admin"
  - `FamilyProfileSchema` — "SINGLE" | "COUPLE_NO_CHILDREN" | "COUPLE_WITH_CHILDREN" | "SINGLE_PARENT"
  - `MemberRoleSchema` — "OWNER" | "EDITOR" | "VIEWER"
  - `MovementTypeSchema` — "INCOME" | "EXPENSE" | "CONTRIBUTION" | "REDEMPTION"
  - `TransactionTypeSchema` — "BUY" | "SELL" | "DIVIDEND" | "INTEREST"
  - `PolicyTypeSchema` — "LIFE" | "DISABILITY" | "HEALTH"

- Shared (primitivos/ajudantes)

  - `UUIDSchema` — string UUID (RFC 4122)
  - `DateTimeStringSchema` — string ISO 8601 com offset
  - `DateTimeSchema` — `Date | DateTimeStringSchema`
  - `DecimalStringSchema` — string decimal
  - `DecimalSchema` — string decimal | number finito
  - `DecimalStringSchema` — string decimal
  - `DecimalSchema` — string decimal | number finito

- Auth

  - `AuthUserSchema`, `AuthUserCreateSchema`, `AuthUserUpdateSchema`
  - `SessionSchema`, `SessionCreateSchema`, `SessionUpdateSchema`
  - `AccountSchema`, `AccountCreateSchema`, `AccountUpdateSchema`
  - `VerificationSchema`, `VerificationCreateSchema`, `VerificationUpdateSchema`
  - Tipos: `AuthUser`, `Session`, `Account`, `Verification`, etc.

- Space

  - `SpaceSchema`
  - `SpaceMemberSchema`
  - Tipos: `Space`, `SpaceMember`

- Cashflow

  - `CategorySchema`, `CategoryCreateSchema`, `CategoryUpdateSchema`
  - `MovementSchema`, `MovementCreateSchema`, `MovementUpdateSchema`
  - Tipos: `Category`, `Movement`, etc.

- Investment

  - `WalletSchema`, `WalletCreateSchema`, `WalletUpdateSchema`
  - `AssetSchema`, `AssetCreateSchema`, `AssetUpdateSchema`
  - `WalletAssetSchema`, `WalletAssetCreateSchema`, `WalletAssetUpdateSchema`
  - `TransactionSchema`, `TransactionCreateSchema`, `TransactionUpdateSchema`
  - Tipos: `Wallet`, `Asset`, `WalletAsset`, `Transaction`, etc.

- Planning

  - `FinancialPlanSchema`, `FinancialPlanCreateSchema`, `FinancialPlanUpdateSchema`
  - `InsuranceSchema`, `InsuranceCreateSchema`, `InsuranceUpdateSchema`
  - `BeneficiarySchema`, `BeneficiaryCreateSchema`, `BeneficiaryUpdateSchema`
  - Tipos: `FinancialPlan`, `Insurance`, `Beneficiary`, etc.

- Simulation

  - `ProjectionsSimulationSchema`, `ProjectionsSimulationCreateSchema`, `ProjectionsSimulationUpdateSchema`
  - `ProjectionResultSchema`, `ProjectionResultCreateSchema`, `ProjectionResultUpdateSchema`
  - Tipos: `ProjectionsSimulation`, `ProjectionResult`

- Todo (exemplo simples)
  - `TodoSchema`, `TodoCreateSchema`, `TodoUpdateSchema`
  - Tipos: `Todo`

## Exemplo: atualização parcial (strict)

    import { CategoryUpdateSchema } from "@prismo/core";

    // Payload vindo do cliente (ex.: PATCH /categories/:id)
    const body = {
      name: "Moradia",
      // type: "EXPENSE", // opcional
      // qualquer chave extra será rejeitada
    };

    const parsed = CategoryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      // Erros de validação e chaves desconhecidas
      console.log(parsed.error.flatten());
    } else {
      // body válido para atualizar parcialmente a entidade
      console.log(parsed.data);
    }

## Exemplo: validando lista

    import { z } from "zod";
    import { TransactionCreateSchema } from "@prismo/core";

    const BulkTransactionsSchema = z.array(TransactionCreateSchema).min(1);

    const bulk = [
      {
        walletAssetId: "e1de8d1c-a96a-4cb4-9b01-9e84b9fd8f82",
        type: "BUY",
        quantity: "10.00000000",
        pricePerUnit: "25.32",
        transactionDate: "2025-03-10T10:00:00Z",
      },
    ];

    const result = BulkTransactionsSchema.safeParse(bulk);

## Boas práticas

- Sempre valide entradas externas com `safeParse` para obter erros detalhados sem lançar exceções.
- Ao lidar com valores monetários/decimais, prefira strings (ex.: `"1234.56"`) até a borda do sistema, convertendo apenas quando necessário.
- Mantenha datas como ISO strings no transporte; converta para `Date` se necessário apenas próximo ao uso.
- Para schemas de atualização, envie somente os campos que deseja alterar.

## FAQ

- Posso usar os enums diretamente?

  - Sim. Os enums do Zod (ex.: `MovementTypeSchema`) expõem `enum`, ex.: `MovementTypeSchema.enum.EXPENSE`.

- Posso ampliar um schema?

  - Sim. Use `SomeSchema.extend({ ... })` ou componha com `z.intersection`.

- Como tipar a saída do `parse`/`safeParse`?
  - Use os tipos exportados (ex.: `Movement`) ou `z.infer<typeof MovementSchema>` localmente.

## Licença

MIT
