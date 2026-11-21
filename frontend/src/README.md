# Pneumonia Second Reader

AI-powered pneumonia detection from pediatric chest X-rays: a clinical second reader with Grad-CAM explanations.

> [!WARNING]
> **Research prototype. Not a certified medical device. Not for unreviewed clinical use.**

## Architecture

```text
React (Vercel) ──► Express API (Render) ──► FastAPI ML Service (HF Spaces)
                          │
                          ▼
                 PostgreSQL (Supabase)
```

## Model Performance

Evaluated on a held-out test set of 624 images.

| Configuration                                           | Sensitivity | Specificity |
| ------------------------------------------------------- | ----------: | ----------: |
| Baseline CNN                                            |       56.2% |       68.8% |
| ResNet50 (frozen)                                       |       96.9% |       70.9% |
| **ResNet50 (fine-tuned, threshold 0.50), selected**     |   **96.2%** |   **82.9%** |
| Ensemble                                                |       98.2% |       66.2% |

## Status

Under construction. TechAscend Track A capstone.
