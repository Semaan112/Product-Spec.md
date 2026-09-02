# Data Model Specification — Internal Operations Service Hub

## 1. Overview
This data model supports an internal operations ticketing platform with department-level routing, custom SLA tracking, and internal discussion capabilities.

## 2. Entities & Schema Definitions

### `users`
* `user_id` (INT, Primary Key, Auto Increment)
* `full_name` (VARCHAR(100), NOT NULL)
* `work_email` (VARCHAR(150), Unique, NOT NULL)
* `department_id` (INT, Foreign Key -> `departments.department_id`)
* `role` (ENUM('requester', 'agent', 'admin'), Default: 'requester')
* `created_at` (TIMESTAMP, Default: CURRENT_TIMESTAMP)

### `departments`
* `department_id` (INT, Primary Key, Auto Increment)
* `department_name` (VARCHAR(50), NOT NULL) — e.g., 'IT Support', 'HR Operations', 'Facilities'

### `tickets`
* `ticket_id` (INT, Primary Key, Auto Increment)
* `subject` (VARCHAR(200), NOT NULL)
* `description` (TEXT, NOT NULL)
* `department_id` (INT, Foreign Key -> `departments.department_id`)
* `priority_level` (ENUM('low', 'medium', 'high', 'critical'), Default: 'medium')
* `current_status` (ENUM('submitted', 'in_review', 'in_progress', 'resolved', 'closed'), Default: 'submitted')
* `office_location` (VARCHAR(100), Nullable) — e.g., 'Building A - Floor 3'
* `requester_id` (INT, Foreign Key -> `users.user_id`)
* `assigned_agent_id` (INT, Foreign Key -> `users.user_id`, Nullable)
* `due_date` (DATETIME, Nullable)
* `created_at` (TIMESTAMP, Default: CURRENT_TIMESTAMP)
* `updated_at` (TIMESTAMP, On Update CURRENT_TIMESTAMP)

### `ticket_comments`
* `comment_id` (INT, Primary Key, Auto Increment)
* `ticket_id` (INT, Foreign Key -> `tickets.ticket_id`)
* `author_id` (INT, Foreign Key -> `users.user_id`)
* `comment_text` (TEXT, NOT NULL)
* `is_internal_note` (BOOLEAN, Default: FALSE) — Distinguishes public replies from internal agent notes
* `created_at` (TIMESTAMP, Default: CURRENT_TIMESTAMP)

## 3. Relationships
* `departments` (1) $\rightarrow$ (N) `users`
* `departments` (1) $\rightarrow$ (N) `tickets`
* `users` (1) $\rightarrow$ (N) `tickets` (as `requester_id`)
* `users` (1) $\rightarrow$ (N) `tickets` (as `assigned_agent_id`)
* `tickets` (1) $\rightarrow$ (N) `ticket_comments`