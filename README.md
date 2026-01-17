# MetricOps

MetricOps is a lightweight metrics + data quality + "why changed" demo:
- React (Vite) frontend
- FastAPI backend
- Postgres warehouse
- Optional pgAdmin UI

## Repo structure
- api/     FastAPI backend
- web/     Vite React frontend
- docker-compose.yml at repo root

## Prereqs
- Docker Desktop (recommended)
- If running locally without Docker:
  - Python 3.11+
  - Node 18+ (Node 20 recommended)

---

## Quick start (Docker)
From repo root:

```bash
docker compose up --build
