# credlayer-backend
Backend for the **Credlayer** application.

## Description

This repository contains the backend service for the Credlayer project. It exposes the API, handles business logic, and manages data persistence.

## Features

- Backend API for the Credlayer application
- Business logic handling
- Database connection
- Entry point for the front-end or other clients

## Prerequisites

- Node.js / npm or the environment used by the project
- A configured database if needed
- The project environment variables

## Installation

```bash
git clone <url-du-repo>
cd credlayer-backend
npm install
```

## Configuration

Create an environment file at the root of the project if needed, for example:

```env
PORT=3001
DATABASE_URL=
```

## Run

```bash
npm run dev
```

Other useful commands:

- `npm run build`
- `npm start`

## API Documentation (Swagger)

Swagger is enabled for this backend.

- Interactive UI: `GET /api/docs`
- OpenAPI JSON spec: `GET /api/openapi.json`

Local URLs:

- `http://localhost:3001/api/docs`
- `http://localhost:3001/api/openapi.json`

Main documented endpoints:

- `GET /health`
- `GET /api/reputation/:wallet`
- `GET /api/analytics/:wallet`
- `GET /api/reputation/history/:wallet`
- `GET /api/leaderboard`

Swagger/OpenAPI dependencies used:

- `swagger-ui-express`
- `swagger-jsdoc`
- `@types/swagger-ui-express`
- `@types/swagger-jsdoc`

## Tests

```bash
npm test
```

## Structure

```text
credlayer-backend/
├── src/
│   ├── routes/
│   │   └── reputation.ts      ← endpoints API
│   ├── services/
│   │   └── scoringService.ts  ← scoring logic 
│   ├── blockchain/
│   │   └── solanaFetcher.ts   ← Read Solana data
│   ├── ai/
│   │   └── groqExplainer.ts ← call groq API
│   └── index.ts               ← server entry point
├── .env                       ← secrect key 
├── .env.example               ← public version
├── .gitignore
├── tsconfig.json
└── package.json
```

## Contribution

1. Create a dedicated branch
2. Make the changes
3. Verify the tests
4. Open a pull request

## License

To be defined according to the project.
