# Module Identification & Ownership

Modules are split so each of the 3 team members owns a clear, mostly
independent vertical, with testing and documentation shared across the team.

| Module | Scope | Owner | Timeline |
|---|---|---|---|
| M1 — ML Pipeline | Dataset prep, MobileNetV2 training, evaluation, TFLite conversion & quantization | Athul | Stage 1 (current) |
| M2 — Mobile App (UI + Inference) | React Native camera flow, on-device TFLite inference, results & history screens | Riya | Stage 2 |
| M3 — Local Storage & Sync | SQLite schema, CRUD for diagnosis history, offline queue, backend sync API | Gowrinanda | Stage 3 |
| M4 — Backend (optional cloud sync) | FastAPI/Flask REST endpoints, Firebase Auth, sync conflict handling | Gowrinanda | Stage 3 |
| M5 — Testing & QA | Unit tests per module, integration testing of capture → inference → save flow | Shared (all 3) | Ongoing |
| M6 — Documentation & Reporting | SRS, user stories, architecture diagrams, final report, presentation | Athul | Ongoing |

## Notes

- Athul leads ML + documentation, Riya owns the app experience,
  Gowrinanda owns data/storage and backend sync.
- M5 (Testing & QA) and M6 (Documentation) are shared responsibilities so
  no single module becomes a bottleneck for the whole team's review readiness.
