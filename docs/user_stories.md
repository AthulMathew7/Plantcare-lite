# User stories and implementation status

These user stories began as a planning list. The table records whether the
current checked-in application supports the requested outcome; a story is not
proof that the capability exists.

| ID | Priority | User story | Current status |
|---|---|---|---|
| US-1 | High | As a home gardener, I want to photograph a leaf and get a preliminary class result. | Implemented for the supported 22 classes; not an expert diagnosis. |
| US-2 | High | As a small-scale farmer, I want core scanning/history to work without internet. | Local inference, catalog and history are implemented; Firebase auth and a decorative Diagnosis image have online dependencies. |
| US-3 | High | As a user, I want to see the model confidence score. | Implemented; the score is not a guarantee of correctness. |
| US-4 | Medium | As a user, I want management suggestions with a result. | Implemented through locally seeded catalog content; not a treatment prescription. |
| US-5 | Medium | As a returning user, I want to browse prior scans. | Implemented in local profile-scoped SQLite History. |
| US-6 | Medium | As a user, I want history to synchronize across devices. | Not implemented; sync preference/queue scaffolding only. |
| US-7 | Low | As a cautious user, I want to mark a diagnosis uncertain. | Implemented as a user-set flag on the local scan record. |
| US-8 | Low | As a new user, I want onboarding. | A Welcome/Get Started first-run flow is implemented; it is not a multi-step walkthrough. |

## Prioritization context

The original priorities reflect an early proposal and are retained only as
historical context. Current feature state is maintained in
[feature_matrix.md](./feature_matrix.md), and unsupported ideas are listed in
[future_scope.md](./future_scope.md).
