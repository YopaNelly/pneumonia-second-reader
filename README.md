# Pneumonia Second Reader

AI-powered pneumonia detection from pediatric chest X-rays: a clinical second reader with Grad-CAM explanations.

> [!WARNING]
> **Research prototype. Not a certified medical device. Not for unreviewed clinical use.**

## Architecture

```text
React (Vite)  ──►  Express API  ──►  FastAPI ML service (ResNet50 + Grad-CAM)
 :5173               :4001  │             :8000
                            ▼
                  Supabase (PostgreSQL + private Storage)
```

| Part | Folder | Role |
| --- | --- | --- |
| Frontend | `frontend/` | Upload screen, prediction card, Grad-CAM viewer, consent checkbox |
| API | `backend/` | Validates uploads, calls the ML service, stores consented images, exports training data |
| ML service | `ml-service/` | Loads the model, returns label, probability, and Grad-CAM overlay |
| Research | `research/` | Notebooks and report (the dataset is not tracked) |

## Model Performance

Evaluated on a held-out test set of 624 images.

| Configuration | Sensitivity | Specificity |
| --- | ---: | ---: |
| Baseline CNN | 56.2% | 68.8% |
| ResNet50 (frozen) | 96.9% | 70.9% |
| **ResNet50 (fine-tuned, threshold 0.50), selected** | **96.2%** | **82.9%** |
| Ensemble | 98.2% | 66.2% |

## Run locally

Prerequisites: Python 3.10+, Node.js 18+, a Supabase project (see below).

The model weights (`resnet50_finetuned.h5`, about 162 MB) are not in Git. Place the file at `ml-service/model/resnet50_finetuned.h5`.

Start each service in its own terminal.

**1. ML service**

```bash
cd ml-service
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

**2. API**

```bash
cd backend
npm install
cp .env.example .env   # then fill in the Supabase values
npm run dev
```

**3. Frontend**

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

### Environment variables (`backend/.env`)

| Variable | Example |
| --- | --- |
| `PORT` | `4001` |
| `ML_SERVICE_URL` | `http://localhost:8000` |
| `CORS_ORIGIN` | `http://localhost:5173` |
| `SUPABASE_URL` | `https://your-project-id.supabase.co` |
| `SUPABASE_SERVICE_KEY` | secret key, never commit it |
| `MODEL_VERSION` | `resnet50-finetuned-v1` |

## Data pipeline for retraining

Images are stored **only with explicit consent**. The upload screen has an opt-in checkbox that is off by default. Without it, the image is analyzed and never saved.

When consent is given, the API:

1. re-encodes the image to PNG, which removes all embedded metadata;
2. computes a SHA-256 hash, so the same image is never stored twice;
3. saves the image in a private Supabase Storage bucket (`xrays`);
4. inserts a row in the `predictions` table with the predicted label, probability, threshold, and model version.

File names are never stored.

The model's own prediction is **not** a training label. Training data comes only from records where a clinician has filled in `confirmed_label`, `reviewed_by`, and `reviewed_at`. This avoids retraining the model on its own mistakes.

### Supabase setup

Create a project, then run this in the SQL Editor:

```sql
create table public.predictions (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  image_path       text not null,
  image_sha256     text not null unique,
  original_name    text,
  predicted_label  text not null check (predicted_label in ('NORMAL', 'PNEUMONIA')),
  probability      real not null check (probability between 0 and 1),
  threshold        real not null,
  model_version    text not null,
  confirmed_label  text check (confirmed_label in ('NORMAL', 'PNEUMONIA')),
  reviewed_by      text,
  reviewed_at      timestamptz,
  consent          boolean not null default true
);

create index predictions_confirmed_idx on public.predictions (confirmed_label);

alter table public.predictions enable row level security;
grant all on table public.predictions to service_role;

insert into storage.buckets (id, name, public)
values ('xrays', 'xrays', false)
on conflict (id) do nothing;
```

Row Level Security is on with no policies, so only the backend (using the secret key) can access the data.

### Export confirmed data

```bash
cd backend
npm run export            # or: node scripts/export-dataset.js ./my-folder
```

This downloads every confirmed record into:

```text
dataset-export/
├── NORMAL/<sha256>.png
├── PNEUMONIA/<sha256>.png
└── manifest.csv
```

The folder layout matches the Kaggle pediatric chest X-ray dataset, so image-folder loaders work directly. `manifest.csv` lists each file with its confirmed label, original prediction, model version, reviewer, and review date. `dataset-export/` is git-ignored and must never be committed.

## Limitations

- Trained and evaluated on one public pediatric dataset; performance on other hospitals, devices, or populations is unknown.
- The Grad-CAM heatmap shows what influenced the model. It does not localize disease.
- Stored images and any real retraining may need institutional ethics approval.

## Status

Under construction. TechAscend Track A capstone.
