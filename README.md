# Projeto Banco

Uma aplicação bancária full-stack moderna construída com Next.js, NestJS e PostgreSQL. Inclui autenticação JWT, transações PIX, atualizações em tempo real via SSE, controle de taxa com algoritmo Leaky Bucket (inspirado no BACEN Dist) e uma interface responsiva com Tailwind CSS. Perfeito para aprender desenvolvimento web moderno e sistemas bancários.

## 🚀 Funcionalidades

- **Autenticação de Usuário**: Autenticação segura baseada em JWT com registro, login e renovação de tokens.
- **Gerenciamento de Contas**: Usuários podem criar e gerenciar suas contas bancárias, visualizar saldos e detalhes da conta.
- **Transações PIX**: Transferências de dinheiro em tempo real usando vários tipos de chave PIX (email, CPF, telefone). O sistema valida chaves e processa transações de forma assíncrona.
- **Histórico de Transações**: Um histórico abrangente de todas as transações enviadas e recebidas, com paginação para navegação fácil.
- **Atualizações em Tempo Real**: Eventos Server-Sent Events (SSE) fornecem atualizações ao vivo sobre status de transações, garantindo que o usuário esteja sempre informado.
- **Controle de Taxa**: Implementa o algoritmo Leaky Bucket para proteger a API contra abuso, inspirado no sistema Dist do Banco Central do Brasil (BACEN).
- **Interface Responsiva**: Uma interface moderna e responsiva construída com Next.js e Tailwind CSS, proporcionando uma experiência perfeita em todos os dispositivos.
- **Documentação da API**: Documentação interativa Swagger/OpenAPI para todos os endpoints da API, facilitando testes e integração com o backend.

## 🛠️ Arquitetura e Tecnologias

### Backend (NestJS)
- **Linguagem**: TypeScript
- **Framework**: NestJS
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: JWT com tokens de refresh
- **Tempo Real**: Server-Sent Events (SSE)
- **Fila de Mensagens**: RabbitMQ para processamento de transações
- **Controle de Taxa**: Algoritmo Leaky Bucket personalizado
- **Validação**: Class-validator para DTOs
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest para testes unitários e e2e

### Frontend (Next.js)
- **Linguagem**: TypeScript
- **Framework**: Next.js 15, React
- **Estilização**: Tailwind CSS, shadcn/ui
- **Estado**: Zustand para gerenciamento de estado
- **Requisições**: Axios para chamadas de API
- **Formulários**: React Hook Form com validação
- **Notificações**: Toast para feedback ao usuário

### Infraestrutura
- **Gerenciador de Pacotes**: Bun runtime
- **Monorepo**: Turborepo para gerenciamento
- **Linting/Formatação**: Biome
- **Containerização**: Docker para PostgreSQL
- **Mensageria**: RabbitMQ

## 🪣 Implementação do Algoritmo Leaky Bucket

Este projeto implementa uma versão completa do algoritmo Leaky Bucket para controle de taxa de requisições, similar ao sistema Dist do BACEN (Banco Central do Brasil).

### Regras do Sistema:
- **Capacidade Máxima**: Cada usuário começa com 10 tokens (tamanho do balde).
- **Consumo**: Cada requisição para simular consulta de chave PIX consome 1 token.
- **Reposição**: O sistema repõe 1 token a cada hora para cada usuário (taxa de vazamento).
- **Limite**: Um usuário nunca pode acumular mais que os 10 tokens iniciais.
- **Bloqueio**: Se um usuário tentar fazer uma requisição sem tokens, recebe erro 429 Too Many Requests.

### Arquitetura do Controle de Taxa:
- **Guard Global**: Intercepta todas as requisições na API
- **Armazenamento**: Tokens armazenados no banco de dados por usuário
- **Verificação**: Middleware verifica disponibilidade de tokens antes de processar
- **Atualização**: Tokens são consumidos e repostos automaticamente
- **Resposta**: Erro padronizado para requisições bloqueadas

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Bun](https://bun.sh/)
- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Docker](https://www.docker.com/)
- [Git](https://git-scm.com/)

## 📦 Como Começar

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/your-username/bank-project.git
   cd bank-project
   ```

2. **Instale as dependências:**

   ```bash
   bun install
   ```

3. **Configure as variáveis de ambiente:**

   Crie um arquivo `.env` no diretório `apps/api` copiando o arquivo de exemplo:

   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

   Atualize o arquivo `.env` com suas credenciais do PostgreSQL e outras variáveis de ambiente.

4. **Execute o banco de dados:**

   Este projeto usa Docker para executar um banco PostgreSQL.

   ```bash
   bun db:start
   ```

5. **Aplique as migrações do banco:**

   ```bash
   bun db:push
   ```

6. **Execute os servidores de desenvolvimento:**

   ```bash
   bun dev
   ```

   - A aplicação web estará disponível em [http://localhost:3001](http://localhost:3001).
   - O servidor da API estará rodando em [http://localhost:3000](http://localhost:3000).

## 📚 Documentação da API

A API é documentada usando Swagger/OpenAPI. Com o servidor da API rodando, você pode acessar a documentação interativa em:

[http://localhost:3000/api](http://localhost:3000/api)

## 📜 Scripts Disponíveis

Este projeto usa `bun` como gerenciador de pacotes e executor de scripts. Aqui estão alguns dos scripts mais comuns:

- `bun dev`: Inicia todas as aplicações em modo de desenvolvimento.
- `bun build`: Compila todas as aplicações para produção.
- `bun dev:web`: Inicia apenas a aplicação web em modo de desenvolvimento.
- `bun dev:server`: Inicia apenas o servidor da API em modo de desenvolvimento.
- `bun check-types`: Verifica tipos TypeScript em todas as aplicações.
- `bun db:push`: Envia mudanças do schema para o banco de dados.
- `bun db:studio`: Abre a interface Prisma Studio para visualizar e gerenciar seus dados.
- `bun check`: Executa Biome para formatar e fazer lint do código.

## 📂 Estrutura do Projeto

Este projeto é um monorepo gerenciado pelo Turborepo. A estrutura é organizada da seguinte forma:

```
bank-project/
├── apps/
│   ├── api/         # API Backend (NestJS)
│   │   ├── prisma/  # Schema Prisma, migrações e scripts de seed
│   │   ├── src/     # Código fonte da aplicação NestJS
│   │   │   ├── modules/ # Módulos da aplicação (ex: auth, user, account)
│   │   │   └── main.ts  # Ponto de entrada principal da API
│   │   └── test/    # Testes e2e para a API
│   └── web/         # Aplicação Frontend (Next.js)
│       ├── public/  # Assets estáticos (imagens, fontes, etc.)
│       └── src/     # Código fonte da aplicação Next.js
│           ├── app/     # Rotas e layouts da aplicação
│           ├── components/ # Componentes React reutilizáveis
│           ├── lib/     # Funções utilitárias e constantes
│           └── hooks/   # Hooks React customizados
```

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para enviar um Pull Request.

1. Fork o repositório.
2. Crie uma nova branch (`git checkout -b feature/sua-feature`).
3. Faça suas mudanças.
4. Commit suas mudanças (`git commit -m 'Adiciona alguma feature'`).
5. Push para a branch (`git push origin feature/sua-feature`).
6. Abra um Pull Request.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT.

## Saiba Mais

Para aprender mais sobre as tecnologias usadas neste projeto, veja os seguintes recursos:

- [Documentação Next.js](https://nextjs.org/docs) - aprenda sobre recursos e API do Next.js.
- [Documentação NestJS](https://docs.nestjs.com/) - aprenda sobre recursos e API do NestJS.
- [Documentação Turborepo](https://turbo.build/repo/docs) - aprenda sobre Turborepo.