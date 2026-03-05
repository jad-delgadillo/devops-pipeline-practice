# devops-pipeline-practice

A small interview-ready Task API built with Node.js 20, Express, CommonJS, Jest/Supertest, Docker, and GitHub Actions CI/CD.

## Tech Stack

- Node.js 20 (CommonJS)
- Express
- Jest + Supertest
- ESLint
- Docker
- GitHub Actions (CI + GHCR release)

## Local Setup and Run

```bash
npm ci
npm run lint
npm test
npm start
```

Server starts on `http://localhost:3000` by default.

## Docker

Build and run:

```bash
docker build -t task-api:local .
docker run --rm -p 3000:3000 task-api:local
```

## API Endpoints

### Health check

```bash
curl -s http://localhost:3000/health
```

Response:

```json
{"status":"ok"}
```

### List tasks

```bash
curl -s http://localhost:3000/tasks
```

### Create task

```bash
curl -s -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Practice pipelines"}'
```

### Delete task

```bash
curl -i -X DELETE http://localhost:3000/tasks/1
```

- Returns `204 No Content` when deleted
- Returns `404 Not Found` when task id does not exist

## CI Workflow

File: `.github/workflows/ci.yml`

Triggers:

- Push to `main`
- Any `pull_request`

Jobs:

1. `test` job:
   - `npm ci`
   - `npm run lint`
   - `npm test`
2. `docker-build` job (runs after tests):
   - `docker build -t task-api:${{ github.sha }} .`

## Release Workflow (GHCR)

File: `.github/workflows/release.yml`

Trigger:

- Push tag matching `v*.*.*` (example: `v0.1.0`)

What it does:

- Authenticates to `ghcr.io` with `GITHUB_TOKEN`
- Builds Docker image with Buildx
- Pushes two tags:
  - `ghcr.io/<owner>/task-api:<version>`
  - `ghcr.io/<owner>/task-api:latest`

## Release Steps

```bash
git tag v0.1.0
git push origin v0.1.0
```

## Interview Explanation

- CI (Continuous Integration) validates quality on each PR and on `main` by running install, lint, tests, and a Docker build.
- CD (Continuous Delivery for container publishing) is implemented with tag-based releases that publish versioned and `latest` images to GHCR.
- This pipeline ensures code correctness before merge and automates packaging for deployment after a release tag.
# devops-pipeline-practice
