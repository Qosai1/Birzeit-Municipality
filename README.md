# Birzeit Municipality Project

A full-stack application with a React frontend and Node.js/Express backend.

## Project Structure

```
birzeit-municipality/
├── backend/                 # Backend API (Node.js/Express)
│   ├── controllers/         # Route controllers
│   ├── db/                  # Database connection
│   ├── middlewares/         # Express middlewares
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── uploads/             # File uploads directory
│   ├── server.js            # Backend entry point
│   └── package.json         # Backend dependencies
│
├── public/                  # React public assets
│   ├── index.html
│   ├── favicon.ico
│   └── ...
│
├── src/                     # React application source
│   ├── component/           # React components
│   ├── App.js               # Main App component
│   ├── index.js             # React entry point
│   └── ...
│
├── package.json             # Frontend dependencies
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL database

### Installation

1. **Install frontend dependencies:**

   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Running the Application

#### Development Mode

**Option 1: Run both frontend and backend together:**

```bash
npm run start:all
```

**Option 2: Run separately:**

Terminal 1 - Backend:

```bash
cd backend
npm start
```

Terminal 2 - Frontend:

```bash
npm start
```

#### Production Build

Build the React app:

```bash
npm run build
```

The build folder will contain the production-ready React app.

## Environment Variables

### Backend

Create a `.env` file in the `backend/` directory with:

```
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Available Scripts

### Frontend (Root)

- `npm start` - Runs the React app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run start:all` - Runs both backend and frontend concurrently

### Backend

- `npm start` - Runs the backend server
- `npm run dev` - Runs the backend with nodemon (auto-restart)

## Technology Stack

### Frontend

- React 19.2.0
- React Router DOM
- Axios
- FullCalendar
- Recharts
- Socket.io Client

### Backend

- Node.js
- Express 5.1.0
- MySQL2
- Socket.io
- JWT Authentication
- Multer (file uploads)
- Meilisearch

## License

ISC
