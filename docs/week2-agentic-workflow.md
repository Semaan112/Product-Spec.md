# Week 2 Agentic Workflow 

**Project:** Internal Operations Service Hub  

---

## 1. UNDERSTAND

### Sources & Business Context
* **Sources Referenced:** `product-spec.md`, `data-model.md`, and `ADR-001.md`.
* **State Machine Rules:**
  * Supported states: `OPEN`, `IN_PROGRESS`, `RESOLVED`.
  * Sequential transition path: `OPEN` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED`.
* **Core Invariant:** Once a ticket reaches `RESOLVED`, it enters a terminal state and cannot be reopened or edited.
* **Scope Definition:** Backend NestJS module implementation (`tickets`). Excludes database persistence layers, authentication/authorization middleware, and frontend integration.

---

## 2. DIRECT

### Architecture & Control Flow
* **Bounded Context:** Implemented NestJS ticket controller and service under `backend/src/tickets/`.
* **Inspection & Plan:**
  1. Validated data tracking attributes (`requester_id`, `assigned_agent_id`) against `ADR-001.md`.
  2. Created `TicketsService` with in-memory map store and strict state validation logic.
  3. Created `TicketsController` exposing `GET /tickets/:id` and `PATCH /tickets/:id/status`.
* **Decision Framework:**
  * **Approve:** Allow valid sequential status progressions (`OPEN` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED`).
  * **Redirect/Reject:** Throw `400 Bad Request` on non-sequential state jumps or reverse transitions.
  * **Stop:** Block any mutation attempts on terminal `RESOLVED` tickets with an invariant violation exception.

---

## 3. PROVE

### Evidence & Verification Cases

#### Case 1: Valid Sequential Transitions
1. **Transition 1:** `OPEN` $\rightarrow$ `IN_PROGRESS`
   * **Request:** `PATCH /tickets/TCK-101/status` with payload `{"status": "IN_PROGRESS"}`
   * **Result:** HTTP `200 OK`, status updated to `IN_PROGRESS`.
2. **Transition 2:** `IN_PROGRESS` $\rightarrow$ `RESOLVED`
   * **Request:** `PATCH /tickets/TCK-101/status` with payload `{"status": "RESOLVED"}`
   * **Result:** HTTP `200 OK`, status updated to `RESOLVED`.

#### Case 2: Invalid Transitions
1. **Direct Jump (`OPEN` $\rightarrow$ `RESOLVED`):**
   * **Request:** `PATCH /tickets/TCK-101/status` with payload `{"status": "RESOLVED"}` on an `OPEN` ticket.
   * **Result:** HTTP `400 Bad Request` (`Invalid state transition from OPEN to RESOLVED`).
2. **Backward Transition (`IN_PROGRESS` $\rightarrow$ `OPEN`):**
   * **Request:** `PATCH /tickets/TCK-101/status` with payload `{"status": "OPEN"}` on an `IN_PROGRESS` ticket.
   * **Result:** HTTP `400 Bad Request` (`Invalid state transition from IN_PROGRESS to OPEN`).

#### Case 3: Invariant Protection (Terminal Lock)
* **Mutation on `RESOLVED` Ticket:**
  * **Request:** `PATCH /tickets/TCK-101/status` with payload `{"status": "IN_PROGRESS"}` on a `RESOLVED` ticket.
  * **Result:** HTTP `400 Bad Request` (`Invariant Violation: Resolved tickets cannot change status or be reopened.`).