# Pneumonia Second Reader

AI-powered pneumonia detection from pediatric chest X-rays: a clinical second reader with Grad-CAM explanations, private per-user history, and a clinician review workflow that produces trustworthy labels for retraining.

> [!WARNING]
> **Research prototype. Not a certified medical device. Not for unreviewed clinical use.**

## Features

- **Analyze**: upload a chest X-ray, get a label, probability, and Grad-CAM heatmap, with a scan animation and a heatmap toggle.
- **Accounts**: sign up, sign in, password reset, profile, and automatic sign-out after inactivity.
- **Private history**: every analysis you choose to save, with zoom, a heatmap opacity slider, and a printable report.
- **Clinician review**: a blinded queue where clinicians label cases without seeing the model's prediction.
- **Reports**: confusion matrix, sensitivity, specificity, PPV, NPV, and agreement with 95% confidence intervals.
- **Privacy controls**: download your data, withdraw sharing, delete your analyses, or delete your account.
- **Admin tools**: role management and an audit log.
- **Transparency**: a model card with performance, intended use, and limitations, plus a live system health page.

## Architecture

```text
React (Vite)  ──►  Express API  ──►  FastAPI ML service (ResNet50 + Grad-CAM)
                      │  :4001              :8000
                      ▼
        Supabase (Auth + PostgreSQL + private Storage)
```

| Part | Folder | Role |
| --- | --- | --- |
| Frontend | `frontend/` | React app, one file per page in `src/pages/` |
| API | `backend/` | Authentication, roles, storage, review, reports, export |
| ML service | `ml-service/` | Loads the model, returns label, probability, and Grad-CAM |
| Research | `research/` | Notebooks and report (the dataset is not tracked) |

In production mode the API also serves the built frontend, so the whole app runs from one address.

## Model Performance

Evaluated on a held-out test set of 624 images. Decision thresholds were tuned on a validation set only.

| Configuration | Sensitivity | Specificity |
| --- | ---: | ---: |
| Baseline CNN | 56.2% | 68.8% |
| ResNet50 (frozen) | 96.9% | 70.9% |
| **ResNet50 (fine-tuned, threshold 0.50), selected** | **96.2%** | **82.9%** |
| Ensemble | 98.2% | 66.2% |

## Roles

| Role | Can do |
| --- | --- |
| **user** (default) | Analyze, keep a private history, print reports, manage their own data |
| **clinician** | Everything a user can, plus the review queue and the reports page |
| **admin** | Everything a clinician can, plus user management and the audit log |

Roles are stored in the account's `app_metadata`, which users cannot edit. Admins change roles in the app, and the first admin is set in the Supabase SQL Editor:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
where email = 'you@example.com';
```

Only give the clinician role to real clinicians: their labels become training data.

## Run locally

Prerequisites: Python 3.10+, Node.js 18+, and a Supabase project (see below).

The model weights (`resnet50_finetuned.h5`, about 162 MB) are not in Git. Place the file at `ml-service/model/resnet50_finetuned.h5`.

**One-time setup**

```bash
# ML service
cd ml-service
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cd ..

# API
cd backend
npm install
cp .env.example .env     # then fill in the values below
cd ..

# Frontend
cd frontend
npm install
cp .env.example .env     # then fill in the values below
npm run build
cd ..
```

**Start everything with one command**

```bash
./start-demo.sh
```

This starts the ML service, waits until the model has loaded, then starts the API, which also serves the web app. Open http://localhost:4001. Press Ctrl+C to stop everything. ML service logs go to `logs/ml-service.log`.

The frontend reads its settings at build time, so run `npm run build` in `frontend/` again after changing `frontend/.env` or any frontend code.

**Development mode (hot reload)**

Run `npm run dev` in `backend/` and in `frontend/` (the frontend proxies `/api` to the API), and start the ML service with `uvicorn app:app --port 8000` from `ml-service/`. The frontend is then at http://localhost:5173.

### Environment variables

`backend/.env`

| Variable | Example |
| --- | --- |
| `PORT` | `4001` |
| `ML_SERVICE_URL` | `http://localhost:8000` |
| `CORS_ORIGIN` | `http://localhost:5173` |
| `SUPABASE_URL` | `https://your-project-id.supabase.co` |
| `SUPABASE_SERVICE_KEY` | secret key. Never commit it and never put it in the frontend |
| `MODEL_VERSION` | `resnet50-finetuned-v1` |

`frontend/.env`

| Variable | Example |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://your-project-id.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | the public publishable key (`sb_publishable_...`) |

## Supabase setup

1. Create a project. Under **Authentication > Providers > Email**, decide whether to require email confirmation (turn it off for local demos, since the built-in email sender is rate limited). Add `http://localhost:4001/reset-password` to the redirect URLs.
2. Run this in the SQL Editor:

```sql
create table public.predictions (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  user_id          uuid references auth.users(id) on delete cascade,
  image_path       text not null,
  gradcam_path     text,
  image_sha256     text not null,
  original_name    text,                -- never filled: file names are not stored
  predicted_label  text not null check (predicted_label in ('NORMAL', 'PNEUMONIA')),
  probability      real not null check (probability between 0 and 1),
  threshold        real not null,
  model_version    text not null,
  confirmed_label  text check (confirmed_label in ('NORMAL', 'PNEUMONIA')),
  reviewed_by      text,
  reviewed_at      timestamptz,
  review_notes     text,
  consent          boolean not null default false   -- allowed for model improvement
);

create unique index predictions_user_sha_idx on public.predictions (user_id, image_sha256);
create index predictions_user_created_idx on public.predictions (user_id, created_at desc);
create index predictions_confirmed_idx on public.predictions (confirmed_label);

create table public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  actor_id    uuid,
  actor_email text,
  action      text not null,
  target      text,
  detail      jsonb
);

alter table public.predictions enable row level security;
alter table public.audit_log enable row level security;
grant all on table public.predictions to service_role;
grant all on table public.audit_log to service_role;

insert into storage.buckets (id, name, public)
values ('xrays', 'xrays', false)
on conflict (id) do nothing;
```

Row Level Security is on with no policies, so only the API (using the secret key) can read or write this data. The browser never touches the database directly.

## Data and privacy design

Saving and sharing are **two separate choices**, both made by the user for each analysis:

1. **Save to my history** (on by default, changeable in Settings). The image and its heatmap are stored privately under the user's own folder and are visible only to that user.
2. **Also allow model improvement** (off by default). Only then can clinicians see the image and can it enter the training export.

When an image is saved, the API:

1. re-encodes it to PNG, which removes all embedded metadata;
2. computes a SHA-256 hash, so the same image is never stored twice for one user;
3. stores the image and heatmap in the private `xrays` bucket;
4. inserts a row with the predicted label, probability, threshold, and model version.

Original file names and patient identity are never stored.

**Labels come from clinicians, not from the model.** The model's own prediction is not a training label. Reviews are **blinded**: the queue shows images oldest first, without predictions, and the prediction is revealed only after the clinician submits a label. This avoids anchoring on the model and avoids retraining on its own mistakes.

**Users stay in control.** They can download their data, withdraw consent on everything they shared, delete all analyses, or delete their account, which removes the files from storage as well as the database rows. Deleting cannot recall copies already exported for training, so every retraining run should start from a fresh export.

**Auditability.** Reviews, role changes, consent withdrawals, and deletions are recorded in the audit log without review notes or image content. When an account is deleted, its earlier log entries lose the email address.

Storing pediatric images and any real retraining may require institutional ethics approval.

## Export training data

```bash
cd backend
npm run export                      # or: node scripts/export-dataset.js ./my-folder
```

The export includes only records that are **clinician-confirmed and shared for model improvement**:

```text
dataset-export/
├── NORMAL/<sha256>.png
├── PNEUMONIA/<sha256>.png
└── manifest.csv
```

The layout matches the Kaggle pediatric chest X-ray dataset, so image-folder loaders work directly. `manifest.csv` lists each file with its confirmed label, the original prediction, model version, reviewer, and review date. `dataset-export/` is git-ignored and must never be committed.

## API

All routes need `Authorization: Bearer <access token>` unless marked public.

| Method and path | Access | Purpose |
| --- | --- | --- |
| `GET /api/health` | public | API and ML service status |
| `GET /api/me` | signed in | Current user and role |
| `POST /api/predict` | signed in | Analyze an image (form fields `file`, `save`, `consent`) |
| `GET /api/history` | signed in | Your saved analyses |
| `GET /api/history/stats` | signed in | Your counts and 7-day activity |
| `GET /api/history/:id` | signed in | One of your analyses |
| `DELETE /api/history/:id` | signed in | Delete one of your analyses |
| `GET /api/account/export` | signed in | Download your data as JSON |
| `POST /api/account/withdraw-consent` | signed in | Stop sharing all your images |
| `DELETE /api/account/data` | signed in | Delete all your analyses |
| `DELETE /api/account` | signed in | Delete your account |
| `GET /api/review/queue` | clinician, admin | Blinded queue of shared, unreviewed cases |
| `GET /api/review/:id` | clinician, admin | One case without the prediction |
| `POST /api/review/:id` | clinician, admin | Submit a label and optional notes |
| `GET /api/reports` | clinician, admin | Confusion matrix and metrics |
| `GET /api/admin/users` | admin | List accounts |
| `PATCH /api/admin/users/:id/role` | admin | Change a role |
| `GET /api/admin/audit` | admin | Audit log |

## Pages

| Group | Pages |
| --- | --- |
| Account | Splash, Welcome, Login, Sign up, Forgot password, Reset password, Session expired |
| App | Dashboard, Analyze, History, Case detail, Printable case report |
| Clinician | Review queue, Review case, Reports |
| Admin | Users, Audit log |
| Information | Profile, Settings, Model card, Privacy and data, System health, Access denied, Not found |

Each page is one file in `frontend/src/pages/`, and the route list lives in `frontend/src/App.jsx`.

## Limitations

- Trained and evaluated on one public pediatric dataset. Performance on other hospitals, scanners, or populations is unknown, and no external validation has been done.
- The Grad-CAM heatmap shows what influenced the model. It does not localize disease.
- The reports page describes only reviewed cases. Users choose which cases to share and labels come from few reviewers, so it is not a validation of the model. The held-out test set above remains the performance estimate.
- The decision threshold (0.50) was chosen on validation data. Changing it changes the sensitivity and specificity trade-off and needs fresh validation, which is why it is not adjustable in the app.
- The frontend runs on Vercel, the API runs on Railway, and the ML inference service currently runs on the presenter's machine via a Cloudflare tunnel. Fully hosting the ML service in the cloud is future work.

## Status

Working prototype. TechAscend Track A capstone.

## Sample images and attribution

The Analyze page includes a gallery of sample X-rays (`frontend/public/samples/`) so anyone can try the app without their own images. Samples are never shared for model improvement, and the dataset label is revealed only after the analysis.

The images come from the public pediatric chest X-ray dataset:

> Kermany, D. S., et al. (2018). *Identifying medical diagnoses and treatable diseases by image-based deep learning.* Cell, 172(5), 1122-1131. Data: Mendeley Data, doi:10.17632/rscbjbr9sj.2. Licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
