Assignment 1

product specification:
 Internal operations service hub
I) Problem/context
 Handling daily internal tasks through unorganized emails and chats threads lead to lost requests, slow response times, and zero visibility for management.
This approach result in high request drop-offs, untracked operational bottlenecks, zero visibility unto resolution, and security risks stemming.
The internal operation service hub established a centralized, policy-driven intake portal to request fulfillment, enforce role-based access and log operational metrics.

II) Known / Facts
Target:
 Employees \bm{\rightarrow} Requesters.
 Operational teams \bm{\rightarrow} Fulfillers.
Requirement: Audit logs must track every status changed, approval step and privilege for internal security review's.

III) Actors / Stakeholders
 Employee (Requester): monitors requests progress on real time, and provides follow-up info.
 Fulfiller (Agent): HR, IT, work on and resolve tickets within their operational scope.
 Manager (Approver): Evaluate high-impact request before fulfillment begins.
 Admin: Configures department routing rules, manages system access roles, and review platform analytics.

IV) Functional requirements:
 Easy request submission: Employees describe a request in free text and may provide a category hint.
 Explainable classification: The assistant suggests category, priority, approval path, reasons, matched signals, and missing information.
 Reviewed queue submission: A reviewer explicitly submits the prepared result to the detected team's task list.
 Approval controls: Authorized staff can approve or reject approval-sensitive work before fulfillment begins.
 Queue operations: Agents can filter, start, resolve, reject, and inspect tickets from a live queue.
 Status timers: The queue prioritizes urgent work first.

V) Non-Functional Requirements:
 Security: Strict Role-Based Access control employees can only view ticket they initiated.
 Usability: UI design system requiring zero training for general employees to submit and track requests.

VI) Assumptions / constraints / Unknowns
 Assumption: All active employees authenticate via existing company Single Sign-on (SSO) Session credentials.
 Constraints: Attachments are restricted to standard document and image format (pdf, png, jpeg...) with a maximum file size of 15mb per submission or more.
 Unknowns: List of custom third-party software license requiring special approval gates is pending final HR/IT review.

VII) Non-Goals
 No External customer support
 No Direct Live chat & peer to peer real time messaging, audio, video calling feature will not be built in.
 No payroll or financial accounting process; HR salary questions may be classified and routed, but are not processed as payroll.

VIII) Acceptance Criteria:
 User attempting to access tickets outside their authorized role or department are blocked with a clear permission error.
 An employee can submit a hardware request that is classified with an approval requirement and appears in the team queue as awaiting approval.
 An authorized reviewer can approve or reject the request; rejected or pending requests cannot be started or resolved.
 A salary request is classified as HR and can be explicitly submitted to the HR queue.