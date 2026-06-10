# Entity Relationship Diagram (ERD)

This project uses MongoDB (via Mongoose), so the ERD below describes *logical* relationships between collections based on `ref` fields.

## Mermaid ER diagram

Paste this into any Mermaid renderer (GitHub Markdown preview supports Mermaid in many contexts, and VS Code works well with a Mermaid extension).

```mermaid
erDiagram
  %% Base identity (single collection in MongoDB)
  USER {
    ObjectId _id
    string name
    string email
    string password
    string role
    boolean isSuspended
    boolean isActive
    date createdAt
    date updatedAt
  }

  %% Role subtypes (logical entities for college ERD)
  CANDIDATE {
    ObjectId userId
    string phone
    string city
    string headline
    string experience
    string bio
    string[] preferredJobTypes
    string[] preferredWorkModes
    string preferredLocations
  }

  EMPLOYER {
    ObjectId userId
    string companyName
    string companyWebsite
    string industry
    string companySize
    string companyCity
    string companyDescription
    string[] hiringFor
    boolean isVerified
  }

  ADMIN {
    ObjectId userId
  }

  JOB {
    ObjectId _id
    string title
    string company
    string location
    string description
    string[] requirements
    ObjectId employerId
    string category
    string experience
    string workMode
    number salaryMin
    number salaryMax
    string salaryPeriod
    number vacancies
    date closingDate
    string status
    string type
    boolean isActive
    string approvalStatus
    boolean isFeatured
    boolean isUrgent
    boolean isFlagged
    string rejectionReason
    date createdAt
    date updatedAt
  }

  RESUME {
    ObjectId _id
    ObjectId userId
    string title
    object data
    date createdAt
  }

  APPLICATION {
    ObjectId _id
    ObjectId jobId
    ObjectId applicantId
    ObjectId resumeId
    string candidateEmail
    string candidateName
    boolean candidateIsActive
    string status
    boolean isViewed
    date viewedAt
    string employerNotes
    date reviewedAt
    date acceptedAt
    date rejectedAt
    date createdAt
    date updatedAt
  }

  JOBREPORT {
    ObjectId _id
    ObjectId jobId
    ObjectId reporterId
    string reporterName
    string reporterEmail
    string reason
    string status
    string adminNote
    date resolvedAt
    ObjectId resolvedBy
    date createdAt
    date updatedAt
  }

  %% Relationships
  USER ||--o| CANDIDATE : "is"
  USER ||--o| EMPLOYER  : "is"
  USER ||--o| ADMIN     : "is"

  EMPLOYER  ||--o{ JOB : "posts"
  CANDIDATE ||--o{ RESUME : "owns"

  CANDIDATE ||--o{ APPLICATION : "applies"
  JOB  ||--o{ APPLICATION : "receives"
  RESUME ||--o{ APPLICATION : "used_in"

  USER ||--o{ JOBREPORT : "reports"
  JOB  ||--o{ JOBREPORT : "gets_reported"
  ADMIN ||--o{ JOBREPORT : "resolves"
```

## Use in a Word (DOCX) synopsis

### Option A (recommended): export as image via Mermaid Live

1. Open https://mermaid.live
2. Paste the Mermaid block above (everything inside the code fence).
3. Click **Export** → choose **PNG** (best for Word) or **SVG** (crisper, but Word handling varies).
4. In Word: **Insert → Pictures** → pick the exported file.

### Option B: screenshot (quick)

1. Render the diagram (Mermaid Live or VS Code preview).
2. Take a screenshot and insert it into Word.

Tip: In Word, set **Wrap Text → Square** to position it nicely.

## How to generate/update

- Source of truth is in the Mongoose models:
  - `backend/models/User.js`
  - `backend/models/Job.js`
  - `backend/models/Application.js`
  - `backend/models/resume.js`
  - `backend/models/JobReport.js`

If you add a new `ref` field or a new collection, update the Mermaid block accordingly.
