# S.Serene-Projected
# S.Serene-Projected

A refactored, minimal Health Threat Intelligence dashboard focused on operational decisions.

## What was stabilized

- Unified scoring logic for both surveillance tier and operational priority.
- Every alert card includes:
  - Surveillance tier
  - Priority
  - Reason for classification
  - Recommended action
  - Next review time
- Duplicate/conflicting classification fields are removed by deriving all classification from one composite score.
- Decision flow is consistently organized as:
  - Global view
  - Thailand view
  - Lamphun action view (actionable alerts only)
- Alarm + Priority 1 alerts are visually emphasized.
- A dedicated **Top Action Today** section is shown first.

## Run

Open `index.html` in any browser.
