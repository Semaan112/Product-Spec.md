# Week 4: Production AI Request Intake

## Delivered capability

The Operations Service Hub now exposes `POST /request-intake/classify`. An employee can submit bounded free text and an optional product category. The intake provider returns a structured candidate containing:

- title and summary
- category and priority
- confidence between 0 and 1
- whether manager or policy approval may be needed
- missing information that would improve routing

The current provider is deterministic and local. It is intentionally replaceable behind the `IntakeProvider` interface, so a paid AI provider is not required for development or evaluation.

## Authority and safety boundary

AI output is advisory. The backend validates provider-owned values against the product enums and rejects malformed provider output. An explicit employee category wins over the suggestion. The result does not create, approve, route, or resolve a ticket; a human or later workflow remains responsible for those actions.

The API validates input length and type with Nest validation. The frontend only offers bounded categories and displays approval signals and missing context for review.

## Representative evaluation cases

Run the repeatable evaluation command from `backend/`:

```bash
npm run eval:intake
```

The suite covers IT equipment, urgent access, Facilities, HR, approval-sensitive hardware, explicit category override, invalid provider output, and provider failure.

## Running the slice

```bash
cd backend
npm install
npm run start:dev

cd ../frontend
npm install
npm run dev
```

Open `http://localhost:5173` after both services are running.