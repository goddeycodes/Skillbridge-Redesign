# SkillBridge — Learning Experience Redesign

## Product direction

The redesign changes the interface from a feature/statistics dashboard into a learning journey:

**Learn → Teach → Match → Connect → Session → Community → Grow**

## New frontend information architecture

```text
Home
├── Learn
│   ├── Discover Skills
│   └── My Learning (sessions)
├── Teach
│   ├── My Skills
│   ├── Skill Matches
│   └── Teaching Sessions
├── Connect
│   ├── Learning Community
│   └── Messages
└── Grow
    ├── My Profile
    └── Achievements & XP
```

## New routes

- `/learn` — skill discovery marketplace-style experience.
- `/teach` — teaching skills and mentor identity.
- `/messages` — session-linked conversations.
- Existing `/dashboard`, `/matching`, `/sessions`, `/community`, `/profile`, and `/credits` were visually reframed.

## Backend strategy

The redesign intentionally preserves the existing API layer rather than replacing working backend behaviour. The frontend consumes the existing skill, matching, session, community, credit and authentication APIs.

## Important data limitation

The current backend does not contain dedicated models/endpoints for:
- learning paths
- explicit learning-goal progress
- XP/achievement events
- course content
- mentor availability
- community accepted-answer state

The redesign therefore presents these as UI concepts or lightweight progress states where the current API can support them. They should become proper persisted features in a subsequent backend phase.
