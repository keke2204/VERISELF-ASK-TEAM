# VeriSelf — Digital Identity Defense

A full-stack prototype for biometric identity enrollment, portrait comparison, media-forensics workflows, and digital-identity monitoring. VeriSelf combines a React dashboard with a FastAPI backend and image-analysis components.

## Live demo

- **Web app:** [Open VeriSelf](https://keke2204.github.io/VERISELF-ASK-TEAM/)

- **Identity profile:** [Open enrollment and verification](https://veriself-ask-team.onrender.com/identity)

- **API health:** [Check backend status](https://veriself-ask-team-api.onrender.com/health)

The API health endpoint should return JSON similar to:

```json
{"status":"ok","service":"VeriSelf API"}
```

## What it includes

- **Identity enrollment and comparison:** accepts an authorized portrait, creates a FaceNet-style 512-dimensional embedding and perceptual reference data, and compares a later image against the stored profile.

- **Media forensics:** image and video analysis workflows for examining visual/manipulation signals.

- **Monitoring and matching workflows:** user-supplied targets, candidate-match verification, risk findings, and alerts.

- **Evidence and response tools:** evidence records and draft legal-response workflows.

- **Media protection:** endpoints and UI for protecting media and checking protected files.

- **Dashboard:** React single-page app with identity, monitoring, forensics, risk, alerts, evidence, and response views.

These are prototype workflows. Their results are not proof of identity, exhaustive monitoring, or legal advice.

## Technology

- **Frontend:** React 19, Vite 8, React Router, Tailwind CSS, Framer Motion, and Lucide icons.

- **Backend:** Python 3.12, FastAPI, Uvicorn, SQLAlchemy, and SQLite.

- **Image/ML stack:** PyTorch, `facenet-pytorch`, OpenCV, Pillow, and ImageHash.

## Repository layout

The application source is available at the repository root for local Vite/Python tooling. `VERI-upload.zip` is kept as a synchronized source bundle for the GitHub Pages workflow and service deployments.

```
VERISELF-ASK-TEAM/
├── app/                   # FastAPI backend
├── src/                   # React frontend
├── public/
├── package.json
├── requirements.txt
└── VERI-upload.zip        # synchronized deployment bundle
```

## Run locally

Use Python 3.12 and a current Node.js release. The archive contains Windows-style separators, so normalize them when extracting on Linux or macOS:

```bash
mkdir -p app-source
python3 - <<'PY'
from pathlib import Path, PurePosixPath
from zipfile import ZipFile

root = Path("app-source")
with ZipFile("VERI-upload.zip") as archive:
    for info in archive.infolist():
        name = info.filename.replace("\\", "/")
        if name.endswith("/") or "__pycache__" in name or name.endswith(".pyc"):
            continue
        relative = PurePosixPath(name)
        if relative.is_absolute() or ".." in relative.parts:
            raise ValueError(f"Unsafe archive path: {name}")
        destination = root.joinpath(*relative.parts)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(archive.read(info))
PY
```

Start the backend in one terminal:

```bash
cd app-source
python3.12 -m venv .venv
source .venv/bin/activate          # Windows: .venv\\Scripts\\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Start the frontend in a second terminal:

```bash
cd app-source
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173` ). The development frontend calls the API at `http://127.0.0.1:8000`. In development, FastAPI API documentation is available at `http://127.0.0.1:8000/docs`.

The backend reads `ALLOWED_ORIGINS` to configure CORS. For local development, its defaults include `http://localhost:5173` and `http://127.0.0.1:5173`. Set `ENVIRONMENT=production` to disable the interactive API documentation endpoints.

### API authentication

Protected API routes require a JWT bearer token. Configure these backend environment variables in Render and local development:

```text
JWT_SECRET=<long-random-secret>
AUTH_USERNAME=<workspace-username>
AUTH_PASSWORD=<workspace-password>
AUTH_USER_ID=1
```

Sign in with `POST /auth/login` using JSON such as `{"username":"<workspace-username>","password":"<workspace-password>"}`. Send the returned token as `Authorization: Bearer <token>` on identity, monitoring, match, risk, alert, evidence, legal-response, protection, and manipulation requests. `/` and `/health` remain public for service monitoring.

## Test identity enrollment and verification

1. Open **Identity Profile** in the dashboard.

1. Enter a profile label and select a clear, front-facing JPG, PNG, or WEBP portrait. The API accepts images up to 10 MB; the UI asks for at least 160×160 pixels.

1. Click **Enroll Digital Identity**. The response includes a `registration_id` and image/embedding metadata. The demo UI stores the ID in that browser’s local storage.

1. Select another portrait of the **same consenting person** and click **Verify Against Baseline**. The response includes `similarity`, `similarity_percentage`, `threshold`, and `matched`.

A same-image comparison is useful as a smoke test. A different photo of the same consenting person is a better test of variation. Do not compare people without their informed consent, and do not treat a similarity score as a calibrated probability.

## API examples

The API expects multipart form data for image uploads. For enrollment:

```bash
curl -X POST https://veriself-ask-team-api.onrender.com/identity/register \
  -F 'user_id=1' \
  -F 'display_name=Test Profile' \
  -F 'file=@reference.jpg'
```

Use the returned `registration_id` to verify a comparison image:

```bash
curl -X POST https://veriself-ask-team-api.onrender.com/identity/verify \
  -F 'identity_id=1' \
  -F 'file=@comparison.jpg'
```

Replace `1` with the enrollment response’s actual `registration_id`. Available core routes include:

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | API health status |
| `POST` | `/identity/register` | Create an identity profile from an authorized portrait |
| `POST` | `/identity/verify` | Compare an uploaded portrait against an enrolled profile |
| `POST` | `/manipulation/analyze-image` | Submit an image for analysis |
| `POST` | `/manipulation/analyze-video` | Submit a video for analysis |

The app also exposes monitoring, match, risk, alert, evidence, legal-response, and media-protection routes. For the full route list in a local development environment, use `/docs`.

## Deployment

The public frontend and API are deployed as separate Render services from this repository. The API allows the frontend origin through CORS; the live health link above can be used to check backend availability. Free Render instances may sleep while idle and take time to wake on the next request.

## Privacy, security, and limitations

> **Do not use the public demo for sensitive or production biometric data.**

- Upload only portraits you own or have explicit, informed permission to process. The API allows JPG/JPEG, PNG, and WEBP files up to 10 MB.

- Uploaded registration/verification files are written to a temporary path and deleted after request handling. The app still stores identity data such as profile metadata and biometric-derived values in its database.

- The demo UI uses a fixed development user ID (`1`) and keeps the current identity ID in browser local storage. It does not provide production-grade authentication, access control, or multi-tenant isolation.

- The backend uses a local SQLite file (`veriself.db`). The Render free filesystem is not durable across all restarts or redeploys; use persistent storage and a production database before relying on stored profiles.

- Similarity, manipulation, risk, and match outputs are experimental signals. They can be wrong and must not be used as the sole basis for consequential identity, safety, employment, legal, or takedown decisions.

- Monitoring depends on configured targets and available data; it is not a guarantee of continuous or exhaustive web surveillance.

## Build the frontend

From the extracted source directory:

```bash
npm run build
npm run preview
```

The production deployment uses the Render-configured API base URL. Local development uses `http://127.0.0.1:8000`.
