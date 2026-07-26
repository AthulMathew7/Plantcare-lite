# Database Schema

SQLite schema for local-first storage. `disease_info` is seeded at install
time (from `label_map.json` + curated descriptions); `scan_history` and
`sync_queue` grow as the app is used.

## users

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | Auto-increment user id (local device profile) |
| display_name | TEXT | Optional local display name |
| created_at | DATETIME | Profile creation timestamp |

## scan_history

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | Auto-increment scan id |
| user_id | INTEGER FK -> users.id | Owner of the scan |
| image_path | TEXT | Local file path of the captured/selected image |
| disease_class | TEXT | Predicted class label from label_map.json |
| confidence | REAL | Model confidence score, 0.0–1.0 |
| is_uncertain | BOOLEAN | User-flagged low-confidence diagnosis |
| scanned_at | DATETIME | Timestamp of the scan |
| synced | BOOLEAN | Whether this record has been pushed to the backend |

## disease_info

| Column | Type | Notes |
|---|---|---|
| class_name | TEXT PK | Matches label_map.json class name |
| display_name | TEXT | Human-readable disease name |
| description | TEXT | Short description of the disease |
| treatment | TEXT | Recommended treatment / care steps |
| severity | TEXT | Low / Medium / High, for UI badge coloring |

## sync_queue

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | Auto-increment queue entry id |
| scan_id | INTEGER FK -> scan_history.id | Record pending sync |
| attempt_count | INTEGER | Number of failed sync attempts |
| last_attempt_at | DATETIME | Last sync attempt timestamp |

## Relationships

- `users` (1) → (many) `scan_history`
- `scan_history.disease_class` → `disease_info.class_name`
- `scan_history` (1) → (0..1) `sync_queue`, while a sync is pending
