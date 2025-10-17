### AWS Implementation Guide for AI-Powered Educational Content

This document outlines a pragmatic starting point to host the backend on AWS and power AI-generated educational content (lesson plans, projects, quizzes) from teacher inputs.

### Current Architecture Snapshot
- **Frontend**: Next.js 14 app in `client/`
- **Backend**: Express server in `server/server.js`
- **Local AI (dev)**: Ollama client with `llama3`

### Recommended AWS Architecture
- **AI/ML**: Amazon Bedrock (preferred) for managed foundation models (Claude, Llama, etc.). No infra to manage, strong safety/compliance, pay-per-use.
- **Database**:
  - Amazon RDS (PostgreSQL/MySQL) for structured data (users, classes, assignments)
  - DynamoDB for flexible/generated content storage
  - S3 for documents, images, and large generated artifacts
- **Backend**:
  - Lambda for serverless compute and auto-scaling
  - API Gateway to front Lambda with auth, quotas, and rate limits
  - Optional: AppSync (GraphQL) for real-time/collab features
- **Auth & Security**: Cognito for auth, IAM for permissions, KMS for encryption

### Phased Implementation Plan
1) Replace local Ollama calls with Bedrock API in the backend
2) Add persistence (RDS/DynamoDB + S3) for generated content and related metadata
3) Introduce user management, sharing, and collaboration flows
4) Add curriculum alignment, templates, and analytics

### Minimal Backend Integration with Bedrock
Add the AWS SDK v3 Bedrock runtime client and expose a generation endpoint.

```bash
npm install @aws-sdk/client-bedrock-runtime
```

```javascript
// Example integration (adapt for TypeScript if desired)
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function generateLessonPlan(subject, grade, topic, durationMinutes) {
  const prompt = `Generate a comprehensive lesson plan for:\n
  Subject: ${subject}\n
  Grade Level: ${grade}\n
  Topic: ${topic}\n
  Duration: ${durationMinutes} minutes\n
  Include: objectives, materials, activities, assessment, and homework.`;

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-sonnet-20240229-v1:0", // pick a supported Bedrock model
    body: JSON.stringify({
      prompt,
      max_tokens: 4000,
      temperature: 0.7,
    }),
    contentType: "application/json",
    accept: "application/json",
  });

  const response = await bedrockClient.send(command);
  const text = Buffer.from(response.body).toString("utf-8");
  return JSON.parse(text);
}

// Example Express route (inside server setup)
// expressApp.post("/api/generate-lesson-plan", async (req, res) => {
//   try {
//     const { subject, grade, topic, duration } = req.body || {};
//     const result = await generateLessonPlan(subject, grade, topic, duration);
//     res.json({ success: true, data: result });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err?.message || "Unknown error" });
//   }
// });
```

Environment variables required:
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Recommended additional variables:
- `BEDROCK_MODEL_ID` (e.g., `anthropic.claude-3-sonnet-20240229-v1:0`)

### Data Model Considerations
Persist generated artifacts and metadata so teachers can review, edit, and reuse:

```javascript
// Illustrative schema (adapt to your ORM/database)
const lessonPlan = {
  id: "uuid",
  title: "string",
  subject: "string",
  gradeLevel: "string",
  durationMinutes: 45,
  objectives: ["string"],
  materials: ["string"],
  activities: [/* structured objects */],
  assessment: {/* rubric, criteria, etc. */},
  generatedBy: "AI|teacher",
  createdByUserId: "string",
  createdAt: "Date",
  updatedAt: "Date",
};
```

Suggested storage split:
- RDS: users, classes, assignments, permissions
- DynamoDB: generated content drafts, versions, prompts
- S3: exported PDFs, images, attachments

### Security and Compliance
- Use Cognito for user auth (teacher accounts, passwordless/SAML optional)
- Apply IAM least-privilege for services and CI/CD roles
- Encrypt at rest with KMS for RDS, DynamoDB, S3; enforce TLS in transit
- Consider FERPA/education data privacy; restrict PII exposure in prompts

### Cost Notes (approximate, pay-per-use)
- Bedrock: per-1K-token pricing by model; choose cost-effective defaults
- Lambda: billed per ms/request; scales to zero
- DynamoDB On-Demand: variable workloads without capacity planning
- S3: ~$0.023/GB-month for standard storage

### Migration Path
1) Immediate: call Bedrock from the current Express backend instead of Ollama for prod
2) Short-term: add persistence (RDS/DynamoDB/S3) and simple content CRUD endpoints
3) Medium-term: sharing/collaboration, templates, curriculum alignment
4) Long-term: analytics on usage and outcomes, fine-tuning specializations (SageMaker if needed)

### Next Steps Checklist
- Configure AWS account, IAM roles, and credentials in CI/secrets manager
- Add Bedrock SDK and swap generation calls server-side
- Stand up initial DB tables/collections and content CRUD flows
- Implement rate limiting and request validation on API routes
- Add environment-driven model selection and safety guardrails for prompts

### Notes
- Keep local Ollama for offline/dev; use Bedrock for staging/prod.
- Prefer streaming responses for better UX on long generations.

