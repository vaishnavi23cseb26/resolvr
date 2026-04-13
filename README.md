# Resolvr – Issue Ticketing System

Production-ready MERN issue ticketing system with role-based access (Customer/Agent/Admin), real-time updates, file uploads, and email notifications.

## Features
- **Auth**: JWT access token + refresh token (httpOnly cookie), bcrypt password hashing
- **Tickets**: Create, list with filters + pagination, update, status flow, admin delete, admin assign agent
- **Comments**: Public comments + internal notes (agent/admin only)
- **Activity log**: Status changes, assignment, comments
- **Realtime**: Socket.io notifications (in-app bell + sidebar “Latest”)
- **Email**: Nodemailer (Gmail SMTP) on key events
- **Uploads**: Multer -> Cloudinary attachments
- **Admin**: Users management, categories CRUD, stats aggregation + Recharts dashboards

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + shadcn-style UI components + React Router v6 + React Query + Recharts
- **Backend**: Node.js + Express (REST) + Socket.io
- **DB**: MongoDB Atlas + Mongoose
- **Deploy**: Vercel (client) + Render (server) + Atlas (db)

## Project Structure
```
/server   Express API + Socket.io
/client   React app (Vite)
```

## Environment Variables
### Server (`server/.env`)
Copy `server/.env.example` → `server/.env` and fill values.

### Client (`client/.env`)
Copy `client/.env.example` → `client/.env`.

Example:
```
VITE_API_URL=http://localhost:5000
```

## Local Setup (Development)
### 1) Backend
```bash
cd server
npm install
npm run dev
```

### 2) Frontend
```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and calls the API at `VITE_API_URL`.

## Seeder
Seeds:
- 1 admin (`admin@resolvr.com` / `Admin@123`)
- 2 agents (`agent1@resolvr.com`, `agent2@resolvr.com` / `Agent@123`)
- 3 customers (`customer1-3@resolvr.com` / `Customer@123`)
- 5 categories, 20 tickets, sample comments

Run:
```bash
cd server
npm run seed
```

## Deployment
### Backend → Render
- Push `server/` to GitHub
- Create a **Render Web Service** (Node)
- Add env vars from `server/.env.example` in Render dashboard
- Set **Start command**: `npm start`
- Ensure **CLIENT_URL** is your Vercel URL (for CORS + cookies)

### Database → MongoDB Atlas
- Create an Atlas cluster
- Copy connection string into `MONGO_URI` on Render
- Allow Render outbound IPs (or use `0.0.0.0/0` temporarily)

### Frontend → Vercel
- Push `client/` to GitHub
- Import into Vercel
- Set env var:
  - `VITE_API_URL` = Render backend URL (e.g. `https://your-api.onrender.com`)

### Production seeding
- Run `npm run seed` against production DB (Render shell or locally with prod `MONGO_URI`)

## Screenshots
- Add screenshots here:
  - `docs/screenshots/dashboard.png`
  - `docs/screenshots/tickets.png`
  - `docs/screenshots/ticket-detail.png`

