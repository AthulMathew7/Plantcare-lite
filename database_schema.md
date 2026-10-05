# Database Schema

PlantCare Lite uses **SQLite** (`expo-sqlite`) for all local data.
The database file is `plantcare.db`, created automatically on first launch.
Scan photos are copied into the app documents `scans/` folder before a row is inserted.

---

## Tables

### `users`

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | — | Unique user ID |
| `display_name` | TEXT | — | — | User's display name |
| `created_at` | DATETIME | — | `datetime('now')` | Account creation timestamp |

---

### `scan_history`

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | — | Unique scan ID |
| `user_id` | INTEGER | FK → users(id) | `1` | Owner of this scan |
| `image_path` | TEXT | NOT NULL | — | Local file URI of the captured/selected image |
| `disease_class` | TEXT | NOT NULL, FK → disease_info(class_name) | — | Predicted class |
| `confidence` | REAL | NOT NULL | — | Model confidence score (0.0–1.0) |
| `is_uncertain` | BOOLEAN | NOT NULL | `0` | `1` if user flagged this scan as uncertain |
| `scanned_at` | DATETIME | NOT NULL | `datetime('now')` | When the scan was performed |
| `synced` | BOOLEAN | NOT NULL | `0` | `1` if uploaded to backend |

**Queries:**
- `loadHistory()` — `SELECT s.*, d.display_name FROM scan_history s LEFT JOIN disease_info d … ORDER BY scanned_at DESC`
- `saveScanToHistory(uri, diseaseClass, confidence, isUncertain)` — copy image, then INSERT
- `deleteHistoryItem(id)` — `DELETE WHERE id = ?` and delete persisted image
- `clearAllHistory()` — `DELETE FROM scan_history` and remove `scans/` files

---

### `disease_info`

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `class_name` | TEXT | PRIMARY KEY | — | Internal class key (e.g. `"Rice___Blast"`, matching ML pipeline `Crop___Disease_Name` format) |
| `display_name` | TEXT | NOT NULL | — | Human-readable name (e.g. `"Rice Blast"`) |
| `description` | TEXT | NOT NULL | — | Short disease description (2–3 sentences) |
| `treatment` | TEXT | NOT NULL | — | Treatment steps (period-separated sentences) |
| `severity` | TEXT | NOT NULL | `'medium'` | `"none"` / `"medium"` / `"high"` |

**Seed data** (exactly 9 classes across Rice & Cassava, inserted on first launch):

| class_name | display_name | severity |
|---|---|---|
| `Rice___Bacterial_Blight` | Bacterial Leaf Blight | high |
| `Rice___Blast` | Rice Blast | high |
| `Rice___Brown_Spot` | Brown Spot | medium |
| `Rice___Tungro` | Rice Tungro | high |
| `Cassava___Bacterial_Blight` | Cassava Bacterial Blight | high |
| `Cassava___Brown_Streak_Disease` | Cassava Brown Streak | high |
| `Cassava___Green_Mottle` | Cassava Green Mottle | medium |
| `Cassava___Mosaic_Disease` | Cassava Mosaic Disease | high |
| `Cassava___Healthy` | Healthy Cassava | none |

> **Note:** `Rice___Healthy` is omitted from seed data as the Kaggle rice dataset contains no healthy rice class.

---

### `sync_queue`

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | — | Queue entry ID |
| `scan_id` | INTEGER | FK → scan_history(id) | — | Which scan needs syncing |
| `attempt_count` | INTEGER | NOT NULL | `0` | Number of upload attempts |
| `last_attempt_at` | DATETIME | — | NULL | Timestamp of last attempt |

---

### `app_settings`

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `key` | TEXT | PRIMARY KEY | — | Setting name (e.g. `sync_enabled`) |
| `value` | TEXT | NOT NULL | — | Stored value (`'1'` / `'0'` for booleans) |

> **Note:** The sync queue is table-only for now. Backend upload is not implemented.
> `getSyncPreference` / `toggleSyncPreference` persist the Settings toggle in `app_settings`.

---

## Entity relationships

```
users 1───∞ scan_history ∞───1 disease_info
                    │
                    └───∞ sync_queue
```

- Each `scan_history` row belongs to one `user`.
- Each `scan_history` row references a `disease_info.class_name`.
- Each `sync_queue` entry references one `scan_history.id` (for future sync).
- `app_settings` stores key-value preferences such as `sync_enabled`.
