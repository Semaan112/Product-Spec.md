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
* **Backend:** Node.js / Express REST API
* **Database:** MySQL
* **Authentication:** OAuth 2.0 / SSO Integration

---

## 🚀 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install

2. **Run development server:**
```bash 
npm run dev


---

## Week 2: NestJS Backend Setup & Verification

### How to Run the Backend

1. **Navigate to backend directory:**
   ```bash
   cd backend
   npm install

   npm run start:dev

verify

# 1. Create a ticket
curl -X POST http://localhost:3000/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"System access issue"}'
# -> {"id": "...", "status": "submitted", ...} copy the id into $ID

# 2. VALID: submitted -> in_progress
curl -X POST http://localhost:3000/tickets/$ID/transition \
  -H "Content-Type: application/json" -d '{"status":"in_progress"}'
# -> 201, status "in_progress"

# 3. VALID: in_progress -> resolved
curl -X POST http://localhost:3000/tickets/$ID/transition \
  -H "Content-Type: application/json" -d '{"status":"resolved"}'
# -> 201, status "resolved"

# 4. INVALID: resolved -> in_progress (terminal state, rejected)
curl -X POST http://localhost:3000/tickets/$ID/transition \
  -H "Content-Type: application/json" -d '{"status":"in_progress"}'
# -> 400 Bad Request

To install and run the project, navigate to the root directory and install dependencies by running ⁠cd backend && npm install⁠ followed by ⁠cd ../frontend && npm install⁠.

 Start the backend server by running ⁠cd backend && npm run start:dev⁠ (runs at ⁠http://localhost:3000⁠), and in a separate terminal tab start the frontend by running ⁠cd frontend && npm run dev⁠ (runs at ⁠http://localhost:5173⁠).

  To exercise the flow, open ⁠http://localhost:5173⁠ in your browser, select a User Role (e.g., ⁠AGENT⁠ to allow or ⁠CUSTOMER⁠ to test authorization failure) and a Target Status, then click Submit Request to send the ⁠PATCH⁠ payload to the API and update the ticket status in the database.

   Run unit and business rule tests with ⁠cd backend && npm run test⁠, and run integration and E2E tests with ⁠cd backend && npm run test:e2e⁠. Key delivery specifications and API contracts can be reviewed in ⁠docs/week3-full-stack-delivery.md⁠.