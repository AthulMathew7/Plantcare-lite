# Initial User Stories

Written in standard "As a / I want / so that" form, prioritized for a first
working build.

| ID | Priority | Story |
|---|---|---|
| US-1 | High | As a home gardener, I want to photograph a leaf and instantly know if it's diseased, so that I can act before it spreads. |
| US-2 | High | As a small-scale farmer, I want the app to work without internet in the field, so that connectivity isn't a blocker at harvest time. |
| US-3 | High | As a user, I want to see a confidence score with the diagnosis, so that I know how much to trust the result. |
| US-4 | Medium | As a user, I want treatment suggestions with the diagnosis, so that I know what to do next, not just what's wrong. |
| US-5 | Medium | As a returning user, I want to browse my past scans, so that I can track how a plant's health changes over time. |
| US-6 | Medium | As a user with intermittent internet, I want my history to sync automatically when I'm back online, so that I don't lose data if I switch phones. |
| US-7 | Low | As a cautious user, I want to flag an uncertain diagnosis, so that I can seek a second opinion or retake the photo. |
| US-8 | Low | As a new user, I want a short onboarding walkthrough, so that I understand how to take a good diagnostic photo. |

## Prioritization rationale

- **High priority** stories (US-1 to US-3) form the minimum viable diagnostic
  loop: capture → offline inference → confidence-scored result. These are
  targeted for the earliest working build.
- **Medium priority** stories (US-4 to US-6) round out the experience with
  actionable guidance, history tracking, and sync — planned for the coding
  phase following Review 1.
- **Low priority** stories (US-7, US-8) are polish/trust features, planned for
  later iterations once the core loop is stable.
