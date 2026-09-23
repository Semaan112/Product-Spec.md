# Internal Operations Service Hub

The **Internal Operations Service Hub** is a centralized web portal designed for internal staff to submit service requests, manage operational workflows, and track cross-departmental tasks.

---

## 📚 Project Documentation

All primary product and technical specifications are organized within the `docs/` directory:

* 📄 **[Product Specification](docs/product-spec.md)** — Core features, target audience, and product requirements.
* 🏗️ **[System Architecture](docs/architecture.md)** — Architectural overview, system boundaries, and diagram.
* 🗄️ **[Data Model](docs/data-model.md)** — Entity-relationship details and database schema design.
* 📝 **[Architectural Decision Records (ADRs)](docs/decisions/ADR-001.md)** — Key technical decisions and rationales.

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite SPA)
# Internal Operations Service Hub

The Internal Operations Service Hub is a local operations workflow prototype for submitting, classifying, reviewing, and resolving internal service requests.

## Documentation

* [Product specification](docs/product-spec.md)
* [System architecture](docs/architecture.md)
* [Data model](docs/data-model.md)
* [ADR-001](docs/decisions/ADR-001.md)

## Tech Stack

* Frontend: React 18 with Vite
* Backend: NestJS REST API
* Validation: `class-validator` with a global whitelist pipe
* Current storage: in-memory ticket store for the local prototype
* Current authorization: guarded role headers for local workflow testing

## Current Workflow

1. A requester submits free-text intake through the **Request intake** workspace.
2. The deterministic assistant suggests a category, priority, approval path, reasons, matched signals, and missing information.
3. A reviewer submits the prepared result to the detected team queue.
4. Agents work from the **Ticket queue** using `Start`, `Resolve`, and `Reject` actions.
5. Approval-required tickets expose `Approve` and `Reject`; pending or rejected work cannot be started.

## Getting Started

### Prerequisites

* Node.js 18+
* npm

### Install

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Run locally

Start the API in one terminal:

```bash
cd backend
npm run start:dev
```

Start the web client in another terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:3000`.

### Verify the project

```bash
cd backend
npm test
npm run test:e2e
npm run eval:intake
npm run build

cd ../frontend
npm run build
```

## API Overview

* `POST /request-intake/classify` - classify and explain a free-text request.
* `GET /tickets` - return the prioritized live queue.
* `POST /tickets` - submit a reviewed intake result as a ticket.
* `PATCH /tickets/:id/status` - move an authorized ticket forward.
* `PATCH /tickets/:id/approval` - approve or reject a ticket.

## Production Roadmap

The local slice is focused on workflow behavior. Before production, replace the in-memory store with durable persistence, replace simulated identity headers with SSO authentication, and add audit history, SLA tracking, and frontend component tests.