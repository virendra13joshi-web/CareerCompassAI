# CareerCompass AI

CareerCompass AI is a comprehensive platform designed to streamline campus placements, providing an interactive dashboard for students and administrators. Features include ATS Resume Analysis, AI Career Chat, Placement Roadmaps, Interview Experiences, and complete Administrative controls.

## Features

* **Student Portal**: Browse companies, check eligibility, parse resumes via AI, generate preparation roadmaps, and discuss career strategies with the AI assistant.
* **Admin Dashboard**: Manage students, companies, interview experiences, broadcast notifications, and view real-time platform analytics.
* **Security & Performance**: Powered by JWT authentication, role-based access control, Rate Limiting, Helmet security headers, and compressed responses.

## Tech Stack

* **Frontend**: React (Vite), Tailwind CSS v4, Framer Motion, Chart.js.
* **Backend**: Node.js, Express.js, MySQL.
* **AI Integration**: OpenAI API (for resume parsing and chat).
* **Security/Optimization**: Helmet, express-rate-limit, express-validator, compression.

## Local Setup

### Prerequisites
* Node.js v18+
* MySQL Server
* OpenAI API Key

### Backend Setup
1. Navigate to the backend directory: \`cd backend\`
2. Install dependencies: \`npm install\`
3. Set up your environment variables by copying the template: \`cp .env.example .env\`
4. Configure your `.env` file with your MySQL credentials, JWT secret, and OpenAI key.
5. Start the server (this will auto-initialize the database schema): \`npm start\` (runs on port 5000).

### Frontend Setup
1. Navigate to the frontend directory: \`cd frontend\`
2. Install dependencies: \`npm install\`
3. Start the Vite development server: \`npm run dev\`

## Deployment

* **Frontend (Vercel)**:
  Connect the repository to Vercel. Ensure the framework preset is set to Vite. The \`vercel.json\` handles SPA routing rewrites.
* **Backend (Render)**:
  Use the provided \`render.yaml\` to automatically configure the web service on Render. Ensure all environment variables are populated in the Render dashboard.
* **Database**:
  Use a managed MySQL provider like Railway, PlanetScale, or Aiven. Copy the provided connection string into the \`DATABASE_URL\` environment variable on your Render backend.

## Authors
Created for Campus Placement Tracking.
