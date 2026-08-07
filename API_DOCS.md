# API Documentation

Base URL: \`/api\`

## Authentication (\`/api/auth\`)

### POST \`/register\`
Register a new student.
- **Body**: \`{ full_name, email, password, college, branch, semester, phone_number }\`
- **Validation**: Full name required, valid email, password > 6 chars.

### POST \`/login\`
Login to the platform.
- **Body**: \`{ email, password }\`
- **Returns**: \`{ token, user: { id, role, ... } }\`

### GET \`/profile\`
Get current user profile. Requires JWT Token.

---

## Companies (\`/api/companies\`)

### GET \`/\`
List all companies.

### GET \`/:id\`
Get details for a specific company.

### POST \`/:id/apply\`
Apply to a company (requires auth).

---

## Resume Analysis (\`/api/resume\`)

### POST \`/analyze\`
Upload and analyze a resume using AI.
- **Form-Data**: \`resume\` (file, max 1)

---

## AI Chat (\`/api/chat\`)

### POST \`/message\`
Send a message to the AI career assistant.
- **Body**: \`{ message }\`
- **Returns**: \`{ response }\`

---

## Admin (\`/api/admin\`) - *Requires Admin Role*

### GET \`/analytics\`
Fetch platform-wide aggregated analytics.

### POST \`/companies\`
Create a new company listing.
- **Validation**: \`company_name\`, \`job_role\` required.

### PATCH \`/students/:id/role\`
Update a student's role (e.g., promote to admin).
- **Body**: \`{ role: 'admin' | 'student' }\`

### POST \`/notifications/broadcast\`
Broadcast a notification to all users.
- **Body**: \`{ title, message, type }\`

*Note: All API routes include standard error handling (`{ success: false, message: string }`) and are rate-limited to prevent abuse.*
