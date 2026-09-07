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

