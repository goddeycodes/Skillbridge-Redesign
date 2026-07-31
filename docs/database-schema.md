# SkillBridge — Database Schema

## PostgreSQL (Relational Data)

### users
| Column     | Type      | Notes                        |
|------------|-----------|------------------------------|
| id         | UUID PK   | auto-generated               |
| name       | VARCHAR   | required                     |
| email      | VARCHAR   | unique, required             |
| password   | VARCHAR   | bcrypt hashed, nullable (OAuth)|
| avatar     | VARCHAR   | URL                          |
| bio        | TEXT      |                              |
| timezone   | VARCHAR   | default 'UTC'                |
| credits    | INTEGER   | default 10 (onboarding)      |
| reputation | FLOAT     | avg of received ratings      |
| googleId   | VARCHAR   | for OAuth login              |
| isVerified | BOOLEAN   | default false                |
| isActive   | BOOLEAN   | default true                 |
| createdAt  | TIMESTAMP |                              |
| updatedAt  | TIMESTAMP |                              |

### sessions
| Column      | Type      | Notes                         |
|-------------|-----------|-------------------------------|
| id          | UUID PK   |                               |
| teacherId   | UUID FK   | → users.id                    |
| learnerId   | UUID FK   | → users.id                    |
| skillId     | VARCHAR   | MongoDB ObjectId ref          |
| title       | VARCHAR   | required                      |
| scheduledAt | TIMESTAMP | required                      |
| duration    | INTEGER   | minutes, default 60           |
| status      | ENUM      | pending/confirmed/completed/cancelled |
| meetingLink | VARCHAR   | Zoom/Meet URL                 |
| creditCost  | INTEGER   | default 1                     |
| notes       | TEXT      |                               |

### credit_transactions
| Column    | Type    | Notes                              |
|-----------|---------|------------------------------------|
| id        | UUID PK |                                    |
| userId    | UUID FK | → users.id                         |
| amount    | INTEGER | +ve = earned, -ve = spent          |
| type      | ENUM    | earned/spent/bonus/refund          |
| reason    | VARCHAR | human-readable description         |
| sessionId | UUID FK | → sessions.id (nullable)           |

### ratings
| Column    | Type    | Notes              |
|-----------|---------|--------------------|
| id        | UUID PK |                    |
| sessionId | UUID FK | → sessions.id      |
| raterId   | UUID FK | → users.id         |
| ratedId   | UUID FK | → users.id         |
| score     | INTEGER | 1–5                |
| feedback  | TEXT    | qualitative review |

---

## MongoDB (Document Data)

### skills
```json
{
  "_id": "ObjectId",
  "userId": "UUID string",
  "name": "Python Programming",
  "description": "...",
  "category": "Technology",
  "tags": ["python", "data", "scripting"],
  "type": "teach | learn",
  "proficiency": "beginner | intermediate | advanced | expert",
  "format": "one-on-one | group | both",
  "language": "English",
  "isActive": true,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### forum_posts
```json
{
  "_id": "ObjectId",
  "userId": "UUID string",
  "title": "Tips for teaching online",
  "content": "...",
  "category": "Technology",
  "tags": ["teaching", "online"],
  "upvotes": ["userId1", "userId2"],
  "replies": [
    {
      "_id": "ObjectId",
      "userId": "UUID",
      "content": "Great tips!",
      "upvotes": [],
      "createdAt": "ISODate"
    }
  ],
  "isPinned": false,
  "createdAt": "ISODate"
}
```
