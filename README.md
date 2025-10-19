# Bank Project

A modern full-stack banking application built with Next.js, NestJS, and PostgreSQL. Features JWT authentication, PIX key transactions, real-time updates via SSE, rate limiting with leaky bucket algorithm (inspired by BACEN Dist), and a responsive UI with Tailwind CSS. Perfect for learning modern web development and banking systems.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication with registration, login, and token refresh capabilities.
- **Account Management**: Users can create and manage their bank accounts, view balances, and see account details.
- **PIX Transactions**: Real-time money transfers using various PIX key types (email, CPF, phone number). The system validates keys and processes transactions asynchronously.
- **Transaction History**: A comprehensive history of all sent and received transactions, complete with pagination for easy navigation.
- **Real-time Updates**: Server-Sent Events (SSE) provide live updates on transaction statuses, ensuring the user is always informed.
- **Rate Limiting**: Implements a leaky bucket algorithm to protect the API from abuse, inspired by the Central Bank of Brazil's (BACEN) Dist system.
- **Responsive UI**: A modern and responsive user interface built with Next.js and Tailwind CSS, providing a seamless experience across all devices.
- **API Documentation**: Interactive Swagger/OpenAPI documentation for all API endpoints, making it easy to test and integrate with the backend.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS, Node.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Real-time**: Server-Sent Events (SSE)
- **Message Queue**: RabbitMQ for transaction processing
- **Development**: Bun runtime, Turborepo monorepo, Biome linting/formatting

## Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh/)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/)
- [Git](https://git-scm.com/)

## 📦 Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/bank-project.git
    cd bank-project
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the `apps/api` directory by copying the example file:

    ```bash
    cp apps/api/.env.example apps/api/.env
    ```

    Update the `.env` file with your PostgreSQL database credentials and other environment variables.

4.  **Run the database:**

    This project uses Docker to run a PostgreSQL database.

    ```bash
    bun db:start
    ```

5.  **Apply database migrations:**

    ```bash
    bun db:push
    ```

6.  **Run the development servers:**

    ```bash
    bun dev
    ```

    - The web application will be available at [http://localhost:3001](http://localhost:3001).
    - The API server will be running at [http://localhost:3000](http://localhost:3000).

## 📚 API Documentation

The API is documented using Swagger/OpenAPI. Once the API server is running, you can access the interactive documentation at:

[http://localhost:3000/api](http://localhost:3000/api)

## 📜 Available Scripts

This project uses `bun` as a package manager and script runner. Here are some of the most common scripts:

- `bun dev`: Starts all applications in development mode.
- `bun build`: Builds all applications for production.
- `bun dev:web`: Starts only the web application in development mode.
- `bun dev:server`: Starts only the API server in development mode.
- `bun check-types`: Checks TypeScript types across all applications.
- `bun db:push`: Pushes schema changes to the database.
- `bun db:studio`: Opens the Prisma Studio UI to view and manage your data.
- `bun check`: Runs Biome to format and lint the codebase.

## 📂 Project Structure

This project is a monorepo managed by Turborepo. The structure is organized as follows:

```
bank-project/
├── apps/
│   ├── api/         # Backend API (NestJS)
│   │   ├── prisma/  # Prisma schema, migrations, and seed scripts
│   │   ├── src/     # Source code for the NestJS application
│   │   │   ├── modules/ # Application modules (e.g., auth, user, account)
│   │   │   └── main.ts  # Main entry point for the API
│   │   └── test/    # E2E tests for the API
│   └── web/         # Frontend application (Next.js)
│       ├── public/  # Static assets (images, fonts, etc.)
│       └── src/     # Source code for the Next.js application
│           ├── app/     # Application routes and layouts
│           ├── components/ # Reusable React components
│           ├── lib/     # Utility functions and constants
│           └── hooks/   # Custom React hooks
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m '''Add some feature'''`).
5.  Push to the branch (`git push origin feature/your-feature`).
6.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## Learn More

To learn more about the technologies used in this project, see the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [NestJS Documentation](https://docs.nestjs.com/) - learn about NestJS features and API.
- [Turborepo Documentation](https://turbo.build/repo/docs) - learn about Turborepo.