# JIRA Task Stories

The following user stories are organized in the recommended development sequence for the OpenDental-integrated NestJS platform. Each item includes a concise description and acceptance scope suitable for JIRA.

1. **Project Bootstrap & Tooling**  
   Set up NestJS monorepo structure with linting (ESLint/Prettier), testing (Jest + e2e harness), environment validation, and shared configuration for PostgreSQL, JWT, Temporal, and OpenDental credentials. Acceptance: repo installs cleanly, `npm run test` and `npm run test:e2e` pass, Swagger is reachable.

2. **Database Provisioning (PostgreSQL)**  
   Provision PostgreSQL infrastructure, apply initial migrations, and verify connectivity from the NestJS app. Acceptance: `.env` populated with database credentials, migration command succeeds, health check confirms DB availability.

3. **Authentication & Session Management**  
   Implement JWT-based auth with password hashing, refresh tokens, and persistent session tracking. Acceptance: register/login/logout/refresh endpoints work, session revocation supported, Swagger documents security schemes.

4. **Admin Onboarding & Access Control**  
   Create admin entities, role-aware guards, and CRUD for admin profiles. Acceptance: admin creation, profile retrieval, and permissions enforced on protected routes.

5. **Clinic Onboarding & Management**  
   Build clinic entity CRUD with admin ownership/assignment. Acceptance: create/update/list clinics, link admins to clinics, validation rules enforced.

6. **Patient Management**  
   Implement patient entity CRUD tied to clinics, including demographics and contact details. Acceptance: create/update/list patients scoped to clinic access, Swagger schemas published.

7. **Appointment Scheduling & Status Tracking**  
   Add appointment entity with scheduling, notes, and status transitions (booked, confirmed, completed, cancelled). Acceptance: create/update/list appointments per clinic/patient with validation and pagination.

8. **Claim Lifecycle Management**  
   Implement claim entity CRUD with linkage to appointments and patients, including status transitions, rejection reasons, and approval details. Acceptance: create/update/list claims, status updates captured in API responses.

9. **Payment Recording & Reconciliation**  
   Add payment entity linked to claims, capturing billed/approved amounts, statuses, and metadata. Acceptance: create/update/list payments and reconcile with claim state.

10. **Activity Logging & Audit Trails**  
    Capture user actions (auth, CRUD, polling) to an activity log with timestamps and context. Acceptance: interceptor writes audit records; list endpoint provides pagination and filtering.

11. **OpenDental API Client & DTO Coverage**  
    Implement OpenDental service with typed DTOs covering patients, insurance plans/subscribers/benefits, appointments, procedures, claims, and payments. Acceptance: service methods wrap documented endpoints with proper auth headers and error handling.

12. **Polling & Sync Jobs (Cron/Temporal Integration)**  
    Configure scheduled jobs (or Temporal workflows) to poll OpenDental for appointments, eligibility results, claim statuses, and payments; persist updates in PostgreSQL. Acceptance: cron jobs run on schedule, update local entities, and record last polled timestamps.

13. **Eligibility Verification Flow**  
    For upcoming/today’s appointments, call eligibility endpoints, update appointment eligibility status, and store payer responses. Acceptance: successful/failed eligibility reflected in appointment records and exposed via API.

14. **Automated Claim Submission Stub**  
    Implement placeholder third-party submission endpoint to forward claim data and record responses, ready to be replaced by AI/clearinghouse integration. Acceptance: endpoint sends outbound request, logs payload/response, and updates claim status accordingly.

15. **Dashboard & Reporting Endpoints**  
    Provide aggregated metrics for patients, appointments, claims, and payments (counts, amounts, trends). Acceptance: dashboard API returns graphs/summary data matching DB state, with Swagger examples.

16. **Frontend API Sequencing Guide**  
    Document the exact call sequence for frontend flows: admin onboarding/login, clinic onboarding, patient creation, appointment booking, eligibility checks, claim submission, payment polling, and reporting fetches. Acceptance: README section or docs page outlines ordered REST calls with expected responses and auth requirements.

17. **Security, Validation, and Error Handling Hardening**  
    Add global validation pipes, standardized error responses, rate limiting, and comprehensive Swagger examples for error cases. Acceptance: invalid inputs return structured errors; security headers and CORS configured.

18. **End-to-End Testing & QA**  
    Write e2e tests covering auth, clinic/patient flows, appointments, claims, payments, and polling behaviors. Acceptance: CI pipeline runs tests green; fixtures cover core scenarios.

19. **Deployment & Observability**  
    Prepare deployment manifests (Docker, environment variables), health/readiness probes, and logging/metrics hooks. Acceptance: container builds succeed, service starts with env injection, and health endpoints verified in staging.
