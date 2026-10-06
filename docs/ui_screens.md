# Screens and navigation

## Navigation map

`AppNavigator` registers root routes Welcome, Main, and modal Auth. Main
contains a fixed custom floating tab bar with four tabs:

```text
Capture tab: CaptureHome → Result
Diagnosis tab: Diagnosis
History tab: HistoryList → HistoryDetail (Result in historyMode)
Settings tab: Settings
Root modal: Auth
```

History opens its nested `HistoryDetail` route using the stored scan URI and
record; history mode skips inference and hides scan actions. Capture navigates
to Result with the persisted current image URI. A small History button on
Diagnosis navigates to History; Diagnose now navigates to Capture.

## Startup / Welcome

- **Purpose:** first-run introduction and onboarding completion.
- **Content/actions:** product intro and Get Started.
- **States:** splash while fonts/database/auth/theme initialize; Welcome if
  onboarding has not completed.
- **Navigation:** Get Started stores onboarding completion and replaces the
  route with Main.
- **Theme:** uses the app theme palette.

## Capture (home)

- **Purpose:** collect a leaf image for inference.
- **Components/actions:** Camera, Gallery, selected-image preview, quality tip.
- **States:** no image selected, camera/gallery permission, picker loading,
  image selected, permission/picker/persistence alert.
- **Navigation:** a selected/taken image is persisted if possible, then opens
  Result.
- **Theme:** themed backgrounds, cards, text, buttons, and icons; selected
  photo remains unmodified.

## Diagnosis

- **Purpose:** browse reference information for all supported classes.
- **Components/actions:** plant banner, crop filters (All/Rice/Cassava/
  Coconut/Jackfruit/Mango), disease cards, History action.
- **States:** asynchronously loaded list, selected filter, one expanded card;
  image placeholder exists only if no image mapping is available.
- **Navigation:** card expands/collapses in place; Diagnose now opens Capture;
  history icon opens History.
- **Theme:** cards, text, filters, and placeholders use the theme. Reference
  photos remain ordinary photographs. The banner currently uses a remote
  decorative image.

## Result

- **Purpose:** validate a new scan as a leaf before showing a disease
  prediction, or display a previously stored scan.
- **Content/actions:** actual scan image hero, class/crop, confidence,
  catalog severity and explanatory metadata, Share, flag uncertain, Save.
- **States:** validating, non-leaf rejection, uncertain/clearer-image prompt,
  disease analysis, diagnosis failure with retry/back, prediction,
  saving/saved/retry-save, uncertainty flag.
- **Navigation/data:** entered from Capture or History. History mode skips
  inference and hides save/flag bar; uses stored class/confidence and original
  scan URI.
- **Theme:** themed cards, text, controls and background. User scan image is
  not color-filtered and is never replaced by its catalog reference photo.

## History

- **Purpose:** review the active local profile's saved scans.
- **Components/actions:** date-grouped list, image thumbnail, relative date,
  sync-status label, pull-to-refresh, swipe delete, Undo snackbar.
- **States:** loading, populated, empty (“No scans yet”), refresh, error alert,
  deletion/undo.
- **Navigation/data:** a list item opens history-mode Result using its
  original `image_path`; thumbnail uses saved thumbnail then original fallback.
- **Theme:** list, background, controls, empty state, and snackbar are themed.
  Scan images stay as captured.

## Settings

- **Purpose:** account status, appearance, sync preference, app details, and
  history action.
- **Components/actions:** guest login action or account/log out, Dark Mode
  switch, Sync history when online switch, model/version details, Clear all
  history, About text.
- **States:** sync preference is read from SQLite; theme preference restores
  from AsyncStorage; destructive clear asks for confirmation.
- **Navigation:** login opens modal Auth; account logout returns to Guest.
- **Theme:** Dark Mode switches Light/Dark immediately and persists.
- **Sync limitation:** toggle/queue are preparatory only; no cloud transfer is
  implemented.

## Auth (login/sign-up)

- **Purpose:** optional Firebase email/password identity.
- **Components/actions:** login, account creation, switch form, continue as
  Guest, and if needed choose whether to associate existing Farmer scans.
- **States:** loading/resolving local profile, linking prompt, form validation,
  busy, configuration notice, auth errors.
- **Navigation:** modal; successful authenticated state returns to previous
  screen. Guest continuation also returns.
- **Theme:** auth form surfaces and text use the selected palette.

## Fixed bottom navigation

Main displays a custom floating tab bar for Scan, Diagnose, History, and
Settings. It remains fixed while tab content scrolls. Auth is a root modal;
Result is displayed inside Capture or History stacks.
