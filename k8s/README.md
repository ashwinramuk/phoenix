# Kubernetes deployment

Manifests to run Phoenix (web + api + PostgreSQL) on any Kubernetes cluster —
local (kind / minikube / Docker Desktop) or managed (EKS / GKE / AKS).

## What's here

| File | Purpose |
| --- | --- |
| `namespace.yaml` | `phoenix` namespace |
| `postgres.yaml`  | PostgreSQL **StatefulSet** + headless Service + Secret (per-pod PVC via `volumeClaimTemplates`) |
| `api.yaml`       | API **Deployment** (2 replicas) + `initContainer` for migrations + `/health` probes + Service + **HPA** (CPU 70%, 2→6) + ConfigMap/Secret |
| `web.yaml`       | Next.js (standalone) Deployment + Service |
| `ingress.yaml`   | `/api` → api, `/` → web (nginx ingress) |
| `kustomization.yaml` | Applies everything together |

## Design notes (the "why")

- **StatefulSet for Postgres, Deployment for the stateless tiers** — the DB needs a
  stable identity and durable per-replica storage; web/api are fungible and scale flat.
- **Config vs secrets split** — non-sensitive env in a ConfigMap, credentials in a
  Secret. In a real cluster the Secret is sourced from Vault / External Secrets, never
  committed.
- **initContainer runs migrations to completion** before the app container starts, so
  a pod never serves against an un-migrated schema.
- **Probes** — liveness/readiness on the API's `/health` endpoint gate traffic and
  restarts; Postgres uses `pg_isready`.
- **HPA** scales the API on CPU; requests/limits are set so the scheduler and
  autoscaler have signal.

## Deploy

```bash
# 1. Build + load images (kind example)
docker build -t phoenix-api:latest ./api
docker build -t phoenix-web:latest ./web
kind load docker-image phoenix-api:latest phoenix-web:latest

# 2. Apply
kubectl apply -k k8s/

# 3. Reach it (add phoenix.local -> ingress IP in /etc/hosts)
kubectl -n phoenix get pods,svc,ingress
```

> Images are built by CI (see `.github/workflows`) and pushed to a registry in a
> real deployment; the manifests reference `phoenix-api:latest` / `phoenix-web:latest`.
