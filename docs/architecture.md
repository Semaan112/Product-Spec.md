# Architecture Draft: Internal Operations Service Hub

# 1. System Overview & Major Components
![System Aarchitecture Diagram](./assets/archicture1.png)
The Internal Operations Service Hub acts as a centralized portal for internal staff to manage operational workflows, submit internal service requests, and track administrative tasks across departments.

* **Operations Web Client:** React-based single-page web interface used by internal employees and administrators to interact with the hub.
* **Core Service API:** Node.js / Express REST API handling business logic, request routing, task state transitions, and role checks.
* **Operational Database:** MySQL relational database managing durable application state, including user records, audit logs, and service ticket statuses.

# 2. System Boundaries & Dependencies
* *Inside System Boundary:** Operations Web Client, Core Service API, Operational Database, internal authorization rules.
* *External Dependencies:*
  * *Identity Provider (SSO / OAuth 2.0):** External company authentication service used to verify employee identity before issuing local session tokens.
  * *Notification Service (WhatsApp / Email Gateway):** Third-party messaging provider used to broadcast task updates and status alerts to staff.

# 3. Data Flow & Security Checkpoints
1. *Request Initiation:** An internal user submits an operational request or status update through the Web Client.
2. *Authentication Guard:** The Core Service API intercepts the request, verifying the session token issued by the SSO provider.
3. *Authorization & RBAC:** The API verifies if the user's role (e.g., *Manager*, *Operator*, *Admin*) permits updating or reading the requested operation state.
4. **State Persistence:** The API executes authorized business logic and writes state changes directly to the Operational Database.
5. **Notification Dispatch:** The API triggers an asynchronous alert job to the Notification Service to inform relevant actors.

# 4. Failure Handling & Requirement Traceability
* *Notification Service Failure:** If the external messaging gateway is unreachable, the API logs the dispatch error and queues the alert for retry in the database without failing the primary operational transaction.
* *Database Disconnection:** The Core Service API rejects incoming requests with a `503 Service Unavailable` status and initiates automatic connection pool recovery instead of terminating the process.
* *Traceability to Spec:*
  * Requirement: Strict operational access controls. -> Handled via central Express authorization middleware.
  * Requirement: *Auditability of internal actions.* -> Handled via transactional writes to the audit log table in MySQL.

# 5. Operations Health & Recovery Checklist

This checklist is a planning contract for the current work item. It defines what to observe and prove after recovery; it does not require a new monitoring platform, health endpoint, or rollback implementation.

1. **Healthy system:** The Core Service API authenticates and authorizes requests, reads and writes durable ticket state, and records the corresponding audit history. Notification delivery may be temporarily degraded without failing the primary ticket transaction.
2. **User path after recovery:** The user retries or refreshes the ticket action. The API returns the current persisted status, and the user confirms that the requested transition and any follow-up notification completed.
3. **Failure dependency:** MySQL is the critical dependency for operational state. The notification service is a non-blocking secondary dependency; SSO is required for authenticated access.
4. **Revealing signal:** API `503 Service Unavailable` responses and database connection-pool recovery events indicate database failure. Notification dispatch errors and retry-queue growth indicate messaging degradation.
5. **Safe log evidence:** Record ticket status changes and audit history in the database. Log dependency failures and retry activity without tokens, credentials, message contents, or unnecessary personal data.
6. **Repeated observation:** Recheck API availability, database read/write behavior, persisted ticket status, audit records, and notification retry progress across multiple observations instead of relying on one successful request.
7. **Attention condition:** Escalate when `503` responses persist, connection-pool recovery fails, ticket transactions cannot be committed, or the notification retry queue continues growing.
8. **Safe recovery path:** Keep the primary ticket transaction independent of notification delivery and queue failed notifications for retry. On database failure, return `503`, recover the connection pool automatically, and keep the API process running.
9. **Proof of health and user behavior:** Prove recovery with a successful authorized status update, matching durable ticket state, a matching audit record, and eventual notification delivery. After a `503`, the user retries and verifies the ticket status rather than assuming the first request succeeded.

# 6. Release Readiness Inventory

This inventory records what is known before calling a local build a release candidate. It is intentionally limited to the current repository; deployment, CI, and cloud setup are out of scope.

* **Build and run commands:** Run `npm run build`, `npm test -- --runInBand`, and `npm run test:e2e` from `backend`. Run `npm run build` from `📁frontend`. Start the API with `npm run start:dev` from `backend` and the web client with `npm run dev` from `📁frontend`.
* **Environment-specific values:** The frontend calls `http://localhost:3000`, Vite serves on its local development port, and the backend allows the local frontend origin. These values must become environment configuration before deployment.
* **Possible secrets:** No real credentials, tokens, or API keys are required by the current local slice. The `x-user-role` and `x-user-id` headers are test identity inputs, not authentication secrets, and must be replaced by verified identity data before production use.
* **Existing automated checks:** Backend unit tests, backend E2E tests, backend TypeScript build, and frontend Vite production build are available. The E2E flow covers authorized update, denied role, invalid status, and unknown ticket cases. There are no frontend component tests yet.
* **Release-candidate evidence:** A candidate is supported by passing backend tests, passing backend compilation, passing frontend production compilation, and a manual browser smoke check of the status-update flow. A real release would also need environment-specific deployment evidence.
* **Hardcoded local assumptions:** The frontend uses `localhost:3000`, displays `TCK-101`, uses the simulated `agent-001` identity, and the backend stores tickets in an in-memory `Map`. These assumptions are acceptable for the local slice but block a production release until replaced or explicitly configured.

The release question is therefore answered as follows: a passing build and smoke check demonstrate that the slice runs, but they do not by themselves prove that real users remain healthy after five minutes. That requires repeated checks of the running API, persisted state, authorization behavior, and user-visible status updates in the target environment.

# 7. Completion Check

Use this list to verify the current work item:

- [x] Documented what healthy means for the Operations Hub.
- [x] Documented the user path after recovery.
- [x] Identified critical dependencies, failure signals, safe logs, repeated observations, and escalation conditions.
- [x] Documented a safe recovery path and the evidence required afterward.
- [x] Added the frontend `x-user-id` request header.
- [x] Added backend rejection for requests without a user identity.
- [x] Added E2E coverage for authorized updates, denied roles, invalid status values, and unknown tickets.
- [x] Verified backend unit tests, E2E tests, and TypeScript build.
- [x] Verified the frontend production build.
- [x] Recorded local environment values, test identity assumptions, and hardcoded demo limitations.
- [ ] Replace simulated headers with verified authentication before production.
- [ ] Replace in-memory ticket storage with durable persistence before production.
- [ ] Add frontend component tests before relying on automated browser behavior.