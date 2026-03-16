# Project Guide: `devops-pipeline-practice`

This document explains what this project is, how it works, why it works, and what each component is doing.

## 1) What this project is

This is a small Task API built to practice backend + DevOps fundamentals:

- Backend API with Node.js + Express (CommonJS style).
- Automated tests with Jest + Supertest.
- Code quality check with ESLint.
- Containerization with Docker.
- CI pipeline with GitHub Actions.
- Release pipeline that publishes Docker images to GitHub Container Registry (GHCR).

The API uses **in-memory storage** (JavaScript arrays), so it is simple and fast for interview demos.

## 2) High-level architecture

At runtime, the flow is:

1. `src/server.js` starts the HTTP server.
2. `src/app.js` configures Express middleware and routes.
3. `src/routes.tasks.js` handles `/tasks` endpoints.
4. `src/tasks.store.js` stores and mutates task data in memory.
5. Response is returned as JSON (or status-only for delete).

## 3) Core components and what each one does

### `src/server.js`

- Entry point when running `npm start`.
- Reads `PORT` from environment (defaults to `3000`).
- Calls `app.listen(...)`.

Why separate this from `app.js`:

- Tests can import `app` without opening a real port manually.
- Cleaner separation between app configuration and process startup.

### `src/app.js`

- Creates Express app.
- Enables JSON body parsing (`express.json()`).
- Defines `GET /health`.
- Mounts tasks router at `/tasks`.
- Exports app object (no `listen` here).

### `src/routes.tasks.js`

Contains task endpoint logic:

- `GET /tasks`
  - Returns current tasks array (`200`).
- `POST /tasks`
  - Validates `title` is a non-empty string.
  - Calls store `create(title)` and returns created task (`201`).
- `DELETE /tasks/:id`
  - Parses `id`.
  - Calls store `remove(id)`.
  - Returns `204` if deleted.
  - Returns `404` if not found or invalid ID.

### `src/tasks.store.js`

Simple in-memory data layer:

- `tasks`: array holding all task objects.
- `nextId`: integer auto-increment counter.
- `getAll()`: returns tasks.
- `create(title)`: creates task with:
  - `id` auto-incremented
  - `title` from request
  - `done: false` by default
- `remove(id)`: deletes task by id and returns boolean success.
- `reset()`: clears all data and resets IDs (critical for deterministic tests).

Important note:

- Because data is in memory, restarting app/container resets all tasks.

## 4) API behavior and request examples

### Health endpoint

- `GET /health`
- Purpose: quick availability check
- Response: `200 {"status":"ok"}`

### Task endpoints

- `GET /tasks` returns list of tasks.
- `POST /tasks` with body `{ "title": "something" }` creates task.
- `DELETE /tasks/:id` deletes task.

Example task object:

```json
{
  "id": 1,
  "title": "Practice CI/CD",
  "done": false
}
```

## 5) Why this API works correctly

It works because each layer has a clear responsibility:

- Routing layer handles HTTP concerns (params, status codes, validation).
- Store layer handles data state and mutation.
- App layer wires routes/middleware.
- Server layer only starts the process.

This separation reduces accidental coupling and makes bugs easier to isolate.

## 6) Testing strategy

Files:

- `tests/health.test.js`
- `tests/tasks.test.js`

How tests work:

- Supertest sends HTTP-like requests to Express app.
- Jest asserts status codes and response bodies.
- `store.reset()` runs in `beforeEach` to ensure every test starts from a clean state.

Why deterministic tests matter:

- No leftover state from previous tests.
- Stable IDs and expected outputs.
- Reliable CI results.

## 7) Linting and quality gates

ESLint configuration is minimal and Node/CommonJS-friendly:

- Base rules from `eslint:recommended`.
- Node + Jest environments enabled.
- Keeps code style and basic quality checks consistent.

CI runs lint before tests so obvious code issues fail early.

## 8) Docker setup

### `Dockerfile`

- Uses `node:20-alpine` (small base image).
- Sets `/app` as working directory.
- Copies `package*.json`.
- Runs `npm ci --omit=dev` to install production dependencies only.
- Copies `src/`.
- Exposes port `3000`.
- Starts with `node src/server.js`.

### `.dockerignore`

Excludes unnecessary files (like `node_modules`, tests, git metadata), which:

- Speeds up builds.
- Reduces context size.
- Avoids bloated images.

## 9) CI pipeline (`.github/workflows/ci.yml`)

Triggers:

- Push to `main`
- Pull requests

Jobs:

1. `test`
   - Checkout code
   - Setup Node 20
   - `npm ci`
   - `npm run lint`
   - `npm test`
2. `docker-build` (depends on `test`)
   - Builds Docker image `task-api:${{ github.sha }}`

Why this is useful:

- Prevents broken code from being merged.
- Ensures code is testable and container-buildable.

## 10) Release pipeline (`.github/workflows/release.yml`)

Triggers:

- Push tags matching `v*`
- Manual run (`workflow_dispatch`)

Actions:

- Setup Docker Buildx.
- Login to GHCR using `GITHUB_TOKEN`.
- Build and push image tags:
  - `ghcr.io/<owner>/task-api:<git-tag>`
  - `ghcr.io/<owner>/task-api:latest`

Why this works:

- Tag push provides a release version source (`github.ref_name`).
- Repository permissions include `packages: write`.
- `docker/build-push-action` handles build and publish in one step.

## 11) Project limitations (intentional)

- No database (data resets on restart).
- No auth.
- No update/mark-done endpoint.
- No pagination/filtering.

These are intentionally omitted to keep the project focused on interview-ready DevOps + API fundamentals.

## 12) How to explain this in an interview (short script)

You can say:

1. "I built a simple Task API in Node 20 and CommonJS to keep backend logic clear."
2. "I separated server/app/routes/store to make testing and maintenance straightforward."
3. "I added deterministic integration tests with Jest + Supertest."
4. "CI validates lint, tests, and Docker build on PRs and main."
5. "Release pipeline is tag-driven and publishes versioned images plus latest to GHCR."

## 13) Command cheat sheet

Run locally:

```bash
npm ci
npm run lint
npm test
npm start
```

Run Docker:

```bash
docker build -t task-api:local .
docker run --rm -p 3000:3000 task-api:local
```

Release:

```bash
git tag -a v0.1.4 -m "release v0.1.4"
git push origin v0.1.4
```

