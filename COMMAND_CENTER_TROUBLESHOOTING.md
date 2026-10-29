# Command Center troubleshooting guide

## Confirmed stack

- **Frontend:** React 19 + Vite 8 + React Router + Tailwind CSS + Framer Motion
- **Backend:** Python 3.12 + FastAPI + SQLAlchemy + SQLite
- **Data fetching:** native `fetch` through `src/services/api.js`, triggered from `useEffect` in `src/pages/Dashboard.jsx`
- **Command Center endpoints:**
  - `GET /risk/summary/{identity_id}`
  - `GET /risk/findings/{identity_id}`
  - `GET /alerts/{identity_id}`
- **Identity key:** `veriself_identity_id` in browser `localStorage`

## Root cause

The original Command Center used `Promise.all` for three independent requests. If any one endpoint failed, the entire promise rejected and the page showed no fetched data, even when the other two endpoints succeeded. The previous code also had no retry action and used `Number(localStorage.getItem(...))`, which could produce `NaN` for malformed stored values.

The updated implementation now:

1. Validates the stored identity ID as a positive integer.
2. Uses `Promise.allSettled` so each telemetry stream can render independently.
3. Displays a partial-data warning when one or two endpoints fail.
4. Displays a retryable error only when all three endpoints fail.
5. Normalizes a trailing slash from `VITE_API_BASE` so endpoint URLs cannot become `//risk/...`.
6. Converts network failures into an actionable API message and safely handles non-JSON error responses.

## Local verification steps

### 1. Start the backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start the frontend

```bash
npm install
npm run dev
```

For a non-default backend URL, create a `.env.local` file:

```bash
VITE_API_BASE=http://127.0.0.1:8000
```

Do not add a trailing slash. The API client also removes one defensively.

### 3. Verify the backend directly

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/risk/summary/1
curl http://127.0.0.1:8000/risk/findings/1
curl http://127.0.0.1:8000/alerts/1
```

Expected empty-profile responses are valid:

```json
{"identity_id":1,"total_findings":0,"critical":0,"high":0,"medium":0,"low":0,"highest_risk_score":0.0}
[]
[]
```

### 4. Check browser storage

After enrolling an identity, DevTools → Application → Local Storage should contain:

```text
veriself_identity_id = <positive integer>
```

If the value is missing or invalid, the Command Center intentionally shows the identity setup screen instead of making an invalid request.

### 5. Check the browser Network panel

For a stored identity ID of `1`, confirm these requests are made against the configured API base:

```text
/risk/summary/1
/risk/findings/1
/alerts/1
```

A CORS failure usually means the frontend origin is missing from FastAPI's `ALLOWED_ORIGINS`. The current backend defaults include the local Vite origins and `https://keke2204.github.io`; add any custom deployment origin to `ALLOWED_ORIGINS` as a comma-separated environment variable.

## Visual state behavior

- **Loading:** the existing radar-style `LoadingState` is shown while the three requests are pending.
- **Success:** the charcoal-black dashboard renders metrics, findings, alerts, and quick actions with forest-green accents.
- **Partial success:** an amber telemetry warning appears while successful endpoint data remains visible.
- **Error:** a red error panel appears only when every endpoint fails, with a **Retry connection** button.
- **Empty success:** zero findings and zero alerts render as a healthy, green “clear” state rather than an error.

## Validation commands

```bash
npm run lint
npm run build
git diff --check
```

The patched repository passes all three checks.
