# CogniFlow OpenDental NestJS Backend

This NestJS service orchestrates clinic onboarding, patient eligibility verification, claim automation, and payment reconciliation for dental practices that operate on OpenDental. It exposes a fully documented REST API (Swagger) backed by **PostgreSQL** persistence, TypeORM, and modular business domains (clinics, patients, appointments, claims, payments, sessions, and activity logs). Background pollers continuously synchronize data from OpenDental, while Temporal-compatible job hooks enable resilient automation pipelines.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Domain Model](#domain-model)
3. [Prerequisites](#prerequisites)
4. [Environment Configuration](#environment-configuration)
5. [Local Development](#local-development)
6. [Database Management](#database-management)
7. [Testing](#testing)
8. [OpenDental Integration](#opendental-integration)
9. [Platform Flows](#platform-flows)
10. [Frontend API Call Sequence](#frontend-api-call-sequence)
11. [Background Polling](#background-polling)
12. [Temporal Jobs](#temporal-jobs)
13. [Extensibility Notes](#extensibility-notes)

---

## Architecture Overview
- **NestJS Modular Design** – each business capability (auth, clinics, patients, appointments, claims, payments, sessions, activity logs, polling, integrations) is isolated into its own module with DTO-backed Swagger documentation.
- **PostgreSQL + TypeORM** – every environment (development, test, production) runs on PostgreSQL via `DATABASE_URL`; tests use a dedicated test database with schema drop between runs.
- **Swagger First** – every controller method uses DTOs/enums annotated with `@nestjs/swagger` so consumers have precise schemas and response shapes at `/api/docs`.
- **Robust Integrations** – `OpenDentalService` wraps the official REST API surface (patients, insurance, scheduling, procedures, claims, payments, ledger, utilities) and exposes ergonomic helpers for orchestrations and polling. `TemporalService` acts as an adapter for workflow scheduling.
- **Auditability & Sessions** – mutations are intercepted to create `activity_logs` records and the auth module tracks refresh tokens in a dedicated `sessions` table for revocation.

## Domain Model
| Entity | Key Fields | Relationships |
| --- | --- | --- |
| `Admin` | email, password hash | Owns many clinics |
| `Clinic` | name, OpenDental credentials, timezone | Belongs to admin, has patients/appointments/claims/payments |
| `Patient` | demographics, eligibility, external OpenDental identifiers | Belongs to clinic, has appointments/claims/payments |
| `Appointment` | schedule, status, eligibility metadata | Belongs to clinic & patient, drives claim generation |
| `Claim` | status (draft → submitted → approved/rejected → paid), financials, AI metadata | Linked to appointment & clinic, receives payments |
| `Payment` | amounts, status, clearing info | Belongs to claim & clinic |
| `Session` | refresh token hash, device info | Belongs to admin |
| `ActivityLog` | action, user type, payload snapshot | Belongs to admin/system |

Entity relations are persisted in PostgreSQL with TypeORM repositories. Background pollers read/write through services so business rules remain centralized.

## Prerequisites
- Node.js **18+**
- npm **9+**
- **PostgreSQL 13+** (running locally or remotely)
- Optional: Temporal server if you want to execute workflow jobs beyond the provided adapter stubs

## Environment Configuration
Copy the example environment file and update values for your environment:

```bash
cd backend
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `NODE_ENV` | `development`, `production`, or `test` |
| `PORT` | HTTP port (default `3000`) |
| `DATABASE_URL` | PostgreSQL connection string (`postgres://user:pass@host:5432/db`) |
| `TYPEORM_LOGGING` | `true`/`false` to toggle TypeORM SQL logging |
| `TYPEORM_SYNCHRONIZE` | `true` in dev/test for rapid iteration; defaults to `false` in production |
| `TYPEORM_RUN_MIGRATIONS_ON_START` | `true` in production by default to auto-apply migrations at boot |
| `JWT_SECRET` | Secret used for signing access tokens |
| `JWT_EXPIRES_IN` | Access token lifetime (`900s`, `1h`, etc.) |
| `REFRESH_TOKEN_TTL_DAYS` | Number of days before a refresh session expires |
| `SESSION_SECRET` | Secret for encrypting signed cookies/sessions |
| `SESSION_TTL_HOURS` | Session cookie duration in hours |
| `OPEN_DENTAL_BASE_URL` | Base URL for the OpenDental API (`https://api.opendental.com/api/v1`) |
| `OPEN_DENTAL_API_KEY` | API key provisioned by OpenDental |
| `TEMPORAL_BASE_URL` | Temporal server base URL (optional) |
| `TEMPORAL_NAMESPACE` | Temporal namespace (optional) |

> **PostgreSQL usage:** The application always boots with a PostgreSQL `DATABASE_URL` and never falls back to any other driver. Ensure the specified database exists and the user has privileges to create/update tables. Development defaults to `TYPEORM_SYNCHRONIZE=true`, while production relies on migrations and automatically runs them if `TYPEORM_RUN_MIGRATIONS_ON_START=true`. Tests expect a PostgreSQL database (default `opendental_test`) and drop the schema between runs.

## Local Development
```bash
npm install
npm run start:dev
```
Swagger UI becomes available at `http://localhost:3000/api/docs`, and all REST endpoints are rooted at `http://localhost:3000/api`.

### Production Build
```bash
npm run build
npm run start:prod   # runs migrations first (can be disabled with TYPEORM_RUN_MIGRATIONS_ON_START=false)
```

## Database Management
- Development uses TypeORM synchronize for speed; production defaults to migrations. Set `TYPEORM_SYNCHRONIZE=false` and `TYPEORM_RUN_MIGRATIONS_ON_START=true` for hardened environments.
- Apply migrations manually when needed:
  - `npm run migration:run` (uses `src/data-source.ts` with TS runtime)
  - `npm run migration:run:prod` (uses compiled `dist/data-source.js`, invoked automatically by `npm run start:prod`)
  - `npm run migration:generate -- --name <DescriptiveName>` to scaffold new migrations from entities
- PostgreSQL schema includes UUID primary keys, timestamp auditing columns, and JSONB metadata for eligibility, claims, and activity logging.
- Polling workflows and session state persist directly in PostgreSQL so that restarts or horizontal scaling do not drop in-flight context.

## Testing
```bash
npm run lint       # static analysis via ESLint
npm run test       # unit tests (Jest)
npm run test:e2e   # end-to-end tests using the shared bootstrap helper
npm run test:cov   # coverage report
```
- Tests require PostgreSQL. Set `NODE_ENV=test` and point `DATABASE_URL` to a disposable database (defaults to `postgres://postgres:postgres@localhost:5432/opendental_test`). The test configuration drops the schema automatically between runs, so you can reuse the same database container.

## OpenDental Integration
`OpenDentalService` centralizes calls to the official REST API. Highlighted operations:

1. **Patient Lifecycle**
   - `GET /patients/Simple` – lightweight patient snapshot
   - `GET /patients` – search by name/birthdate
   - `POST /patients` – create a patient
   - `PUT /patients/{PatNum}` – update demographics
2. **Insurance Enrollment**
   - `GET /insplans` / `POST /insplans`
   - `GET /inssubs` / `POST /inssubs`
   - `POST /patplans` – attach plan to patient
   - `POST /benefits` – configure benefits
   - `GET /familymodules/{PatNum}/Insurance`
3. **Scheduling**
   - Slot discovery via `GET /appointments/Slots` & `GET /appointments/SlotsWebSched`
   - Appointment lifecycle: `POST /appointments/Planned`, `POST /appointments/SchedulePlanned`, `POST /appointments`
   - Updates: `PUT /appointments/{AptNum}/Note`, `/Confirm`, `/Break`
   - Retrieval: `GET /appointments` with clinic/status/date filters (used for upcoming, today, and completed pollers)
4. **Procedures & Coding**
   - `POST /procedurecodes`
   - `POST /procedurelogs`
   - `GET /procedurelogs/InsuranceHistory`
5. **Claim Creation & Maintenance**
   - `POST /claims`, `PUT /claims/{ClaimNum}`, `PUT /claimprocs`
   - `GET /claims/{ClaimNum}` for status updates
6. **Insurance Payments (ERA)**
   - `POST /claimpayments`, `/claimpayments/Batch`
   - `PUT /claimpayments/{ClaimPaymentNum}`, `DELETE /claimpayments/{ClaimPaymentNum}`
   - `GET /eobattaches?ClaimPaymentNum=`
7. **Patient Payments & Splits**
   - `POST /payments`
   - `GET /paysplits?PatNum=`, `GET /paysplits?PayNum=`
   - `PUT /paysplits`
8. **Ledger & Statements**
   - `GET /accountmodules/{PatNum}/Aging`
   - `GET /accountmodules/{PatNum}/ServiceDateView?isFamily=true`
   - `GET /statements/{StatementNum}`, `GET /statements?PatNum=`, `POST /statements`
9. **Utilities**
   - `POST /queries`
   - `GET/POST/PUT/DELETE /subscriptions`

All outbound calls share consistent logging, error handling, and fallbacks where appropriate. Credentials are pulled from configuration to support per-clinic or multi-tenant expansion.

## Platform Flows
The following flows encapsulate the business requirements end-to-end:

### 1. Administrator Onboarding & Authentication
1. `POST /api/auth/register` – create the primary admin.
2. `POST /api/auth/login` – exchange credentials for access/refresh tokens (session stored in PostgreSQL).
3. `GET /api/sessions` – review active sessions.
4. `DELETE /api/sessions/:id` – revoke a refresh token when needed.

### 2. Clinic Onboarding
1. `POST /api/clinics` – associate clinic metadata, OpenDental API credentials, and polling cadence preferences with the admin.
2. `GET /api/clinics` & `GET /api/clinics/:id` – review configuration.
3. `PUT /api/clinics/:id` – update stored OpenDental keys or timezone.

### 3. Patient & Appointment Synchronization
1. Polling service executes `OpenDentalService.fetchUpcomingAppointments`/`fetchTodaysAppointments`/`fetchCompletedAppointments` against `GET /appointments` with targeted filters.
2. `AppointmentsService.upsert` maintains PostgreSQL records tied to clinics/patients, creating stub patients if the OpenDental record is new.
3. Admin APIs (`GET /api/appointments`, `GET /api/patients`) expose the unified roster.

### 4. Eligibility Verification
1. Poller checks `appointments` where `eligibilityStatus=PENDING`.
2. Calls `GET /eligibility/{AptNum}`.
3. Updates PostgreSQL appointment with status (`APPROVED`/`REJECTED`) and metadata.
4. `ActivityLog` captures the event for reporting.

### 5. Claim Preparation & Submission
1. Completed appointments trigger AI summarization placeholder (`OpenDentalService.postDummyAiSummary`).
2. `POST /api/claims` constructs claim drafts referencing appointment, procedures, and insurance coverage.
3. When ready, backend calls `POST /claims` to OpenDental and stores the returned `ClaimNum`.
4. Poller tracks status via `GET /claims/{ClaimNum}` and updates local state (`SUBMITTED` → `APPROVED`/`REJECTED`).
5. Rejections write reasons into PostgreSQL for follow-up.

### 6. Claim Resubmission After Rejection
1. `PUT /api/claims/:id` – attach corrected documents, AI recommendations, or manual notes.
2. Backend optionally updates OpenDental claim via `PUT /claims/{ClaimNum}` and `PUT /claimprocs`.
3. Status monitoring continues through the polling loop.

### 7. Payments & Reconciliation
1. Approved claims prompt the poller to fetch payments via `GET /claims/{ClaimNum}` and `GET /claimpayments` family endpoints.
2. `POST /payments` & `GET /paysplits` endpoints mirror remittance data in PostgreSQL.
3. Payment entries update claim status to `PAID`, enabling admin dashboards (aggregations, charts).

### 8. Activity Logging & Auditing
- Every mutation (`POST/PUT/DELETE`) flows through an interceptor that persists an `activity_logs` row with actor info and payload snapshot.
- Daily heartbeat cron job stores a system log entry verifying pollers are operational.

## Frontend API Call Sequence
The following sequence diagram-style list shows how a client would interact with the backend for a typical workday. Each bullet references backend routes that align with the OpenDental workflows above.

1. **Authentication**
   - `POST /api/auth/login`
   - Store refresh token (http-only cookie) and use access token for subsequent calls.
2. **Dashboard Bootstrap**
   - `GET /api/clinics` – populate clinic selector.
   - `GET /api/appointments?clinicId=...&status=SCHEDULED` – show upcoming schedule.
   - `GET /api/claims?clinicId=...&status=PENDING` – outstanding claims.
   - `GET /api/payments?clinicId=...&rangeStart=...&rangeEnd=...` – revenue metrics.
3. **Patient Management**
   - `GET /api/patients?clinicId=...` – roster.
   - `POST /api/patients` or `PUT /api/patients/:id` – manual edits (automatically sync back via polling).
4. **Eligibility Review**
   - `GET /api/appointments/:id` – view eligibility payload.
   - `POST /api/appointments/:id/eligibility/override` – manual overrides if allowed (extend service if needed).
5. **Claim Lifecycle**
   - `POST /api/claims` – draft new claim.
   - `POST /api/claims/:id/submit` – triggers OpenDental submission and Temporal workflow.
   - `GET /api/claims/:id` – monitor status, rejection reasons, AI metadata.
6. **Payment Posting**
   - `GET /api/payments?claimId=...` – confirm ERA posting.
   - `GET /api/claims/summary?clinicId=...` – aggregate statistics for dashboard charts.
7. **Session Maintenance**
   - `POST /api/auth/refresh` – rotate tokens when access token expires.
   - `DELETE /api/auth/logout` – kill active session.

## Background Polling
| Cron | Purpose | OpenDental Endpoint |
| --- | --- | --- |
| `0 */15 * * * *` | Upcoming appointments | `GET /appointments` (Scheduled within next 7 days) |
| `0 */5 * * * *` | Today's appointments | `GET /appointments` (Current day) |
| `0 */10 * * * *` | Completed appointments | `GET /appointments` (Completed last 7 days) |
| `0 */30 * * * *` | Eligibility refresh | `GET /eligibility/{AptNum}` |
| `0 0 * * * *` | Claim status check | `GET /claims/{ClaimNum}` |
| `0 15 * * * *` | Payment posting | `GET /claimpayments`, `GET /claims/{ClaimNum}` |
| `0 0 0 * * *` | System heartbeat | Records entry in `activity_logs` |

Pollers operate entirely through PostgreSQL services (`ClinicsService`, `AppointmentsService`, `ClaimsService`, `PaymentsService`) so the database remains the single source of truth even across multiple application instances.

## Temporal Jobs
`TemporalService.enqueueJob` is a seam for dispatching long-running work (eligibility audits, claim enrichment, denials management). Out of the box it logs payloads, but you can plug in real Temporal clients without changing upstream consumers (polling, controllers).

## Extensibility Notes
- Replace the dummy AI hook in `OpenDentalService.postDummyAiSummary` with your preferred LLM integration when ready.
- Add caching (Redis) to throttle OpenDental requests per clinic.
- Harden security by encrypting stored OpenDental credentials at rest and rotating JWT secrets using a secret manager.
- Introduce CQRS/Event Sourcing if you need granular audit trails for insurance appeals.

---

**Need more?** Explore the Swagger UI for live contract testing and review `src/` for DTOs, guards, interceptors, and services that power the workflows described above.
