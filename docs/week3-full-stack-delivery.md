# Week 3: v0.3 Integrated Product Slice Delivery

## 1. Flow Overview
This integrated product slice implements the **Ticket Status Update Flow** (`PATCH /tickets/:id/status`), connecting a React frontend UI to a NestJS backend with real database persistence.

## 2. API Contract Specification
* **Endpoint**: `PATCH /tickets/:id/status`
* **Headers**: `x-user-role`: `AGENT` | `REQUESTER`
* **Request Body**:
  ```json
  {
    "status": "IN_PROGRESS"
  }