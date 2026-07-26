# PlantCare Lite

Offline-first plant disease detection using on-device deep learning.

## Overview

PlantCare Lite is a mobile application that helps home gardeners and small-scale
farmers detect common plant diseases directly from a leaf photo. A MobileNetV2-based
convolutional neural network, converted to TensorFlow Lite, runs the diagnosis
entirely on-device — so the app works even without an internet connection. Each
scan returns a predicted disease, a confidence score, and simple treatment
guidance, and is stored locally so a user can track a plant's health over time.
When a connection is available, history can optionally sync to a lightweight
backend for backup across devices.

## Team

| Role | Name | Roll No / Reg No |
|---|---|---|
| Team Member 1 | Athul | 25 |
| Team Member 2 | Riya | 44 |
| Team Member 3 | Gowrinanda | 32 |
| Guide | _______________ | — |

**Project:** 20IMCAP501 — Mini Project 2
**Institution:** Saintgits College of Engineering (Autonomous), Department of Computer Applications

## Tech stack

| Layer | Technology |
|---|---|
| Mobile app | React Native |
| On-device inference | TensorFlow Lite (MobileNetV2, quantized) |
| Local storage | SQLite |
| Backend (optional sync) | FastAPI / Flask + Firebase Auth |
| Model training | TensorFlow / Keras (Google Colab) |

## Key features

- Capture or select a leaf photo and get an instant, offline diagnosis
- Confidence score shown alongside every prediction
- Plain-language treatment recommendations
- Local diagnosis history, browsable and filterable
- Optional cloud sync when a connection is available
- Manual "flag as uncertain" for low-confidence results

## Repository structure

```
/
├── README.md                    — this file
├── docs/
│   ├── system_study.md          — feasibility analysis
│   ├── user_stories.md          — prioritized user stories
│   ├── module_ownership.md      — module breakdown & team ownership
│   ├── database_schema.md       — SQLite schema
│   └── uml/                     — use case & class diagrams
├── design/
│   └── ui_wireframes/           — capture / result / history screen designs
├── ml_pipeline/
│   └── train_plantcare_model.py — Colab-ready training + TFLite conversion
├── presentation/
│   └── PlantCare_Lite_Review1.pptx
└── scrum_register/
    └── scrum_register_signed.pdf
```

## Running the ML training pipeline

The training script is written for Google Colab:

```bash
pip install -q tensorflow tensorflow-hub scikit-learn kagglehub
```

Then run `ml_pipeline/train_plantcare_model.py` (or paste its contents into a
Colab notebook cell and call `main()`). It downloads the PlantVillage dataset,
trains a MobileNetV2 transfer-learning model, evaluates it, and exports a
quantized `.tflite` file plus a `label_map.json` for the app.

## Current status

**~15% complete** (as of Review 1)

Completed:
- Abstract & synopsis approved
- System study & feasibility analysis
- Requirement gathering & user stories
- UML diagrams (use case, class)
- Initial database schema
- UI wireframes
- ML training pipeline (script written, ready to run)

Up next:
- Run ML training pipeline and produce trained `.tflite` model
- React Native app scaffolding
- On-device TFLite integration
- Backend sync API
