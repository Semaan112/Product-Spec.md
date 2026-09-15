# Week 3: v0.3 Integrated Product Slice Delivery

## 1. Flow Overview
This integrated product slice implements the **Ticket Status Update Flow** (`PATCH /tickets/:id/status`), connecting a React frontend UI to a NestJS backend with real database persistence.

[ Requester / Agent ]
         |
         |  PATCH /tickets/:id/status
         |  Headers: x-user-role, x-user-id
         v
[ Status Transition Guard ]
         |  (Validates role & allowed state)
         v
[ Tickets Controller / Service ]
         |
         v
[ Database Persistence ]
   - Updates status in tickets table
   - Inserts record into ticket_history

---

### 2. Identity Headers (Simulated for this Milestone)

There is no full authentication system yet—this is explicitly out of scope until a later milestone. Every action that modifies ticket status reads two headers:

| Header | Values | Required When |
| :--- | :--- | :--- |
| `x-user-role` | `AGENT` | `REQUESTER` | Always, for all `/tickets` status changes |
| `x-user-id` | string (UUID or numeric ID) | Always, to track who performed the update |

## 3. API Contract Specification
* **Endpoint**: `PATCH /tickets/:id/status`
* **Headers**: `x-user-role`: `AGENT` | `REQUESTER`
* **Request Body**:
  ```json
  {
    "status": "IN_PROGRESS"
  }


### Success Response
{
  "id": "t-102",
  "title": "Cannot access printer",
  "status": "IN_PROGRESS",
  "updatedAt": "2026-09-15T20:00:00.000Z"
}
 
 ### Denied(authorization rule failure):
 {
  "statusCode": 403,
  "message": "Only AGENT users can set ticket status to IN_PROGRESS"
}

### rejected - 400 bad request

{
  "statusCode": 400,
  "message": "Invalid status transition: Cannot jump directly from OPEN to RESOLVED"
}

### Expected failure- 404 Not Found:
{
  "statusCode": 404,
  "message": "Ticket with ID t-999 not found"
}


## 4. The Required Guarantees

### 1. Authorization & Transition Invariants
 Allowed: An ⁠AGENT⁠ sending ⁠PATCH /tickets/t-102/status⁠ with ⁠status: "IN_PROGRESS"⁠ when the current state is ⁠OPEN⁠ \bm{\rightarrow} returns ⁠200 OK⁠.
 Denied (Case A): A ⁠REQUESTER⁠ attempting to move status to ⁠IN_PROGRESS⁠ \bm{\rightarrow} returns ⁠403 Forbidden⁠.
 Rejected (Case B): Attempting to update a ticket that is already ⁠CLOSED⁠ \bm{\rightarrow} returns ⁠400 Bad Request⁠.


### 2. Expected Failure Handled on Purpose
 ⁠PATCH /tickets/:id/status⁠ called with an ID that does not exist returns a clean ⁠404 (NotFoundException)⁠ from ⁠TicketsService.updateStatus⁠, preventing unhandled database driver crashes.


## 5. Automated Test Suite
 ### 1. Unit Test (⁠backend/src/tickets/tickets.service.spec.ts⁠):
Tests state transition invariants and role restrictions directly against ⁠TicketsService⁠ with mocked repositories. Covers allowed transitions, denied roles, invalid status skips, and 404 cases.
 
 ### 2. Integration Test (⁠backend/src/tickets/tickets.integration.spec.ts⁠):
Runs ⁠TicketsService⁠ against an in-memory database to verify that updated status and audit timestamps correctly persist to disk and round-trip cleanly.