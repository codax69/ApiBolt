# APIBolt

Enable developers to bootstrap a production-ready Node.js/Express backend in under 30 seconds using a single command.

## Key Features

- **CLI Framework:** Built using `commander.js` and `@inquirer/prompts`.
- **Languages:** Fully supports **JavaScript (ES Modules)** and **TypeScript** configurations.
- **Database Adapters:** Supports **MongoDB (Mongoose)**, **PostgreSQL (Prisma ORM)**, or no database.
- **Authentication:** Standard **JWT Authentication** flow complete with Signup, Signin, Signout, and Token Rotation (Access + Refresh tokens).
- **Logging Configuration:** Structured console and file logging via **Winston** with HTTP route streams using **Morgan**.
- **Request Validation:** Integrated schema checks using **Zod** or **Joi**.
- **Dockerization:** Complete with multi-stage `Dockerfile` and custom `docker-compose.yml`.
- **CI/CD:** Configurable GitHub Actions workflows.
- **Testing:** Integrated unit and integration test frameworks using **Jest** and **Supertest**.

## How to Run Locally

You can run the CLI directly using node (after running `npm run build`):

```bash
node dist/bin/index.js <project-name>
```

Alternatively, you can link the binary globally to run:

```bash
npm link
apibolt <project-name>
```

Or execute it via NPX once published:

```bash
npx apibolt <project-name>
```

## Interactive Prompts Flow

Running the command starts an interactive session:

```text
🚀 Welcome to APIBolt!

? Project Name: my-backend-api
? Language: JavaScript / TypeScript
? Database: MongoDB / PostgreSQL / None
? Enable JWT Authentication?: Yes/No
? Validation Library: Zod / Joi / None
? Enable Logging?: Yes/No
? Enable Docker Support?: Yes/No
? Enable GitHub Actions CI/CD Template?: Yes/No
? Enable Testing?: Yes/No
```

Once choices are entered, the engine:
1. Dynamically compiles Handlebars files matching your parameters.
2. Formats all directories and writes configuration variables.
3. Automatically detects package manager (`npm`/`yarn`/`pnpm`) and installs dependencies.
4. Generates Prisma clients (if using PostgreSQL).

## Project Structure (Generated)

```text
├── src/
│   ├── app.js           # Server application configuration
│   ├── index.js         # Port listener & DB startup
│   ├── config/          # DB config and setup
│   ├── controllers/     # Controller logic
│   ├── middlewares/     # JWT, RBAC, Zod/Joi validation, Error handlers
│   ├── models/          # User schemas (Mongoose) / cryptographic helper functions (Prisma)
│   ├── routes/          # Auth routes
│   └── utils/           # ApiError, ApiResponse, asyncHandler, logger utils
├── tests/               # Healthcheck & Auth integration tests
├── Dockerfile           # Multi-stage release container build
├── docker-compose.yml   # App and Database container link
└── package.json
```
