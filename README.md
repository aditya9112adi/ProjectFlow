# PROJECTFLOW - Academic Field Project Management System

ProjectFlow is a comprehensive, production-grade web application designed for colleges and universities to manage the complete lifecycle of students' field projects, from initial proposals to final prototype approvals.

## 🚀 Features

### For Students
- **Team Management**: Create teams, generate unique team codes, and invite members.
- **Project Workflow**: Step-by-step submission process (Proposal ➔ PPT ➔ Report ➔ Prototype).
- **Real-time Status**: Track the approval status of each project phase.
- **Secure File Uploads**: Upload documents and presentations securely.
- **Dashboard Analytics**: View team progress, upcoming deadlines, and phase statuses.

### For Instructors
- **Centralized Dashboard**: Monitor all student teams and project progress at a glance.
- **Review System**: Approve or reject submissions with detailed feedback.
- **Student Management**: Browse students by department and academic year.
- **Analytics**: Generate insights on overall project completion rates.

## 💻 Tech Stack

**Frontend**
- React 19, Vite, React Router DOM
- Tailwind CSS (Custom dark theme, responsive design)
- React Hook Form + Zod (Validation)
- Axios (Interceptors for token refresh)
- Context API (State management)

**Backend**
- Node.js, Express.js
- MongoDB, Mongoose (Complex schemas with aggregation pipelines)
- JWT Authentication (Access + Refresh token rotation)
- bcryptjs (Password hashing)
- Multer & Cloudinary (File processing and cloud storage)
- Helmet, express-rate-limit (Security)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Database
- Cloudinary Account

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd projectflow
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory based on `.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:5173
```

Run the seeder to create an initial instructor account:
```bash
npm run seed
```
*(Instructor credentials: instructor@projectflow.edu / Instructor@123)*

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=ProjectFlow
```

Start the frontend development server:
```bash
npm run dev
```

## 🌐 Deployment Guidelines

### Frontend (Vercel)
The frontend includes a `vercel.json` configuration to handle React Router's client-side routing.
1. Connect your repository to Vercel.
2. Set the root directory to `frontend`.
3. Add the `VITE_API_BASE_URL` environment variable pointing to your deployed backend URL.
4. Deploy!

### Backend (Render)
1. Create a new Web Service on Render and connect your repository.
2. Set the Root Directory to `backend`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add all the environment variables from your `.env` file.
6. Deploy!

## 🔐 Security Implemented
- **JWT Rotation**: Secure access and refresh tokens.
- **HTTP-Only Cookies**: Tokens are stored in secure cookies, mitigating XSS.
- **Rate Limiting**: Protection against brute-force attacks.
- **Helmet**: Sets secure HTTP headers.
- **Input Validation**: Strict request body validation via express-validator.
- **CORS Configuration**: Restricts access to allowed origins only.

## 📄 License
This project is proprietary and built for academic management purposes.
