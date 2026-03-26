## Backend

Currently, IRIS uses **Supabase** as the backend (database + authentication + realtime).

There is no custom backend service yet. If you want to add one later, this is where to put:

- API servers (Node/Express, NestJS, etc.)
- Cron jobs and workers
- Integration services

Suggested structure:

```text
backend/
  api/           # REST/GraphQL endpoints
  workers/      # Background jobs
  scripts/      # One-off scripts and tooling
```






