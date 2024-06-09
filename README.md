# Rinha Node

> Created to compete in: [rinha de back end 2024](https://github.com/zanfranceschi/rinha-de-backend-2024-q1)

Summary:

- `nginx` as load balancer.
- `postgres` as database.
- `nodeJS` as API.
- [repo link](https://github.com/zetos/rinha-node)
- contact: rasecm@gmail.com

## Services

`api01` and `api02`
These API services are identical and built using TypeScript with uWebSockets.js. They provide endpoints for transaction processing and balance management. Each service exposes port 8080.

`nginx`
This service acts as a load balancer using the latest NGINX image. It distributes traffic between the two API services (`api01` and `api02`) on port 9999.

`db`
This service is based on the latest PostgreSQL image. It initializes with predefined environment variables for password, username, and database name. The service exposes port 5432 for database connections.

## API Overview

Transaction Processing
Endpoint: `POST /clientes/:id/transacoes`
Accepts JSON payloads with transaction details (valor, tipo, descricao)
Validates the payload structure and processes the transaction
Returns updated balance information

Balance Retrieval
Endpoint: `GET /clientes/:id/extrato`
Retrieves balance information for a given client ID
Returns balance details including total balance, transaction history, and transaction timestamp

## Usage

Clone the repository.
Make sure Docker and Docker Compose are installed on your system.
Navigate to the project directory.
Run `docker-compose up` to start the services.
Access the APIs via `http://localhost:9999`.

