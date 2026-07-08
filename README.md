# NEXGEN SOLUTIONS

NexGen Solutions is a premium e-commerce platform for high-performance laptops and accessories. It features a modern, responsive user interface built with React and Vite, supported by a secure Node.js backend using Express, Prisma, and SQLite. The application includes advanced authentication flows including Google Login, Facebook Login, and WebAuthn Passkeys.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

## Step-by-Step Installation Procedure

1. Open a terminal and navigate to the root directory of the project.

2. Install the frontend dependencies:
   Run the command: npm install

3. Navigate to the backend directory:
   Run the command: cd backend

4. Install the backend dependencies:
   Run the command: npm install

5. Set up the environment variables:
   - In the frontend root directory, create a file named .env and add:
     VITE_FACEBOOK_APP_ID="your_facebook_app_id"
     VITE_GOOGLE_CLIENT_ID="your_google_client_id"
   - In the backend directory, create a file named .env and add:
     GOOGLE_CLIENT_ID="your_google_client_id"
     JWT_SECRET="your_secure_random_string"

6. Initialize the SQLite database:
   While still in the backend directory, run the command: npx prisma db push

7. Start the backend development server:
   Run the command: npm run dev
   The backend will start running on port 5000 (or your configured port).

8. Open a new terminal, navigate to the frontend root directory.

9. Start the frontend development server:
   Run the command: npm run dev
   The frontend will be accessible at http://localhost:5173

## Language and Technologies Used

- Frontend: TypeScript, React, Vite, Tailwind CSS, Lucide React (icons).
- Backend: TypeScript, Node.js, Express.js.
- Database: SQLite (managed via Prisma ORM).
- Authentication: JSON Web Tokens (JWT), Google OAuth, Facebook Javascript SDK, WebAuthn Passkeys (via SimpleWebAuthn).
