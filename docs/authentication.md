# Authentication and user modes

## Identity versus application data

Firebase Authentication provides optional email/password identity. SQLite
remains the source for local profiles, disease metadata, scans, and history.
The Firebase UID and email may be associated with a local `users` row;
passwords, scan records, and scan photos are not stored in Firebase by this
application. The repository does not implement cloud scan synchronization.

## Guest mode

On startup `AuthProvider` initializes the database and activates a local Guest
profile before resolving Firebase state. If Firebase client configuration is
missing, the app continues in Guest mode. Guest scans are stored in SQLite
under the active local profile and remain on the device. The profile ID is
remembered through `app_settings.guest_user_id`. If the legacy Farmer row
belongs to a Firebase identity, a separate unlinked Guest profile is created
instead.

## Sign-up and login

The Auth screen supports create-account and login forms. Create-account
validates email format, non-empty name/password, minimum eight-character
password length, and matching confirmation. Authentication operations call
Firebase email/password APIs and require valid Firebase public client
configuration plus network access. Firebase Authentication owns credential
verification and session state. No backend application API is called.

## Mapping Firebase identity to local profile

After Firebase reports a signed-in user, `AuthContext` calls
`getLocalAccountStatus` and `linkLocalUserToAuthAccount`:

1. Existing `users.auth_provider_id` matching the Firebase UID reuses that
   local profile and refreshes its display name/email.
2. If no linked row exists and legacy Farmer (`id = 1`) has scans, the user is
   offered the choice to link/import that local profile or keep it separate.
3. Import associates the legacy profile with the Firebase UID; scan rows
   remain on the same local ID.
4. Keeping history separate creates a new SQLite `users` row; the legacy
   profile's scan rows are not copied.
5. If there is no legacy history requiring the choice, a new local profile is
   created and assigned to the Firebase identity.

History reads and mutations use `activeLocalUserId`; profile separation is
local SQLite query scoping, not a cloud-permission mechanism.

## Persistence, startup, and logout

Firebase's `getReactNativePersistence(AsyncStorage)` persists Firebase Auth
state across application restarts. Startup awaits Firebase auth readiness and
subscribes to auth-state changes when Firebase is configured. Local Guest and
account profiles and their scan data persist in SQLite independently.

Logout signs out from Firebase, clears the in-memory active profile, then
activates the Guest profile. It does not delete either profile's records or
photos. App usage in Guest mode remains available afterward.

## Offline behavior and failures

Local Guest mode, model inference, catalog, and history are designed to work
without Firebase. Firebase sign-up/login credential operations require a
network connection. A previously persisted Firebase session is restored
through the Firebase SDK; do not treat that as offline credential
verification. Firebase/configuration/auth errors are mapped to user-facing
messages, and initialization failures fall back to Guest where implemented.

## Auth screens and flows

`AuthScreen` is a modal route. It includes login and create-account forms,
loading and validation/error states, a continue-as-Guest action, and an
existing-local-scan linking choice when applicable. The application does not
provide password reset, social providers, user-profile editing, or cloud scan
storage.
