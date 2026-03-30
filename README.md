# Birzeit Municipality Project

A complete municipality management platform for HR, document tracking, scheduling, and communication. The project includes:

- React-based responsive frontend for users and administrators
- Node.js + Express backend with REST API, authentication, and file management
- MySQL database for persistent record storage
- Elasticsearch for fast document search and embeddings
- Real-time messaging and calendar support via Socket.io

## 🚀 Full Description

`Birzeit Municipality Project` is designed to digitalize internal municipal workflows. It includes:

- Employee CRUD and role management (HR, admin, employee)
- Document upload, OCR/enrichment
- Interview scheduling with calendar view and timeslot handling
- Real-time notifications and messaging
- Dashboard analytics and charts (employee stats, interview status)
- Secure access control with JWT

## 📁 Project Structure

```
birzeit-municipality/
├── backend/                 # Backend API (Node.js/Express)
│   ├── controllers/         # API controllers (auth, employees, docs, scheduling)
│   ├── db/                  # Database + search connection utilities
│   ├── middlewares/         # Auth, authorization, error handling
│   ├── models/              # Sequelize/Mongo schema models (Employee, Document, Interview)
│   ├── routes/              # Express routes
│   ├── services/            # Business logic and external integration (Elasticsearch, embeddings)
│   ├── uploads/             # Uploaded documents storage
│   ├── server.js            # Backend entrypoint and socket setup
│   └── package.json         # Backend dependencies and scripts
│
├── public/                  # React public static folder
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
│
├── src/                     # React app source
│   ├── component/           # Reusable UI components
│   ├── App.js               # Main router and global state
│   ├── index.js             # React DOM renderer
│   ├── style.css
│   └── ...
│
├── package.json             # Frontend dependencies and scripts
└── README.md                # This file
```

## 🛠️ Features

- Authentication: Sign In / Sign Out, role-based permissions
- Employee Management: Add/Edit/Delete, profile and status handling
- Documents: Upload CSV/PDF/DOCX, search, download, OCR metadata
- Document Search: Elasticsearch integration for content search
- Interviews: Create, view, update scheduling with calendar overview
- Real-time: WebSocket messaging (admin/employee communication)
- Dashboard: Charts, KPIs, quick actions, counts

## 🔧 Setup

### Prerequisites

- Node.js v14+
- npm or yarn
- MySQL server (or configured database)
- Elasticsearch instance (for document search)

### Install dependencies

1. Root frontend:

```bash
npm install
```

2. Backend:

```bash
cd backend
npm install
cd ..
```

### Configure environment

Create `backend/.env`:

```ini
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=secret
DB_NAME=birzeit_municipality
JWT_SECRET=your_jwt_secret
PORT=5000

# Optional
SEARCH_HOST=http://localhost:9200
SEARCH_INDEX=documents
```

## ▶️ Run

### Development

- Start backend first:

```bash
cd backend
npm run dev
```

- Start frontend:

```bash
npm start
```

- Optional combined (if `start:all` script exists):

```bash
npm run start:all
```

### Production

```bash
npm run build
```

Then serve `build/` through static server and run backend as production node app.

## 📌 API Endpoints (Backend)

### Auth

- `POST /api/auth/login` - login
- `POST /api/auth/register` - register

### Employees

- `GET /api/employees` - list employees
- `POST /api/employees` - create employee
- `PUT /api/employees/:id` - update employee
- `DELETE /api/employees/:id` - delete employee

### Documents

- `GET /api/documents` - list
- `POST /api/documents` - upload
- `GET /api/documents/search?q=` - search

### Interviews

- `GET /api/interviews`
- `POST /api/interviews`
- `PUT /api/interviews/:id`

### Messages

- `GET /api/messages`
- `POST /api/messages`

## 🧪 Testing

- Frontend:
  - `npm test`

- Backend:
  - `cd backend` then `npm test` (if tests exist)

## 📦 Project Scripts

Root:

- `npm start` - React dev
- `npm run build` - React production build
- `npm run start:all` - run backend and frontend concurrently

Backend:

- `npm start` - run server
- `npm run dev` - nodemon dev

## 🌐 Deployment Notes

- Set environment variables in target hosting platform
- Build React app and point express to serve from `build/` (optional)
- Ensure DB migrations/seeders are run before startup

## 👥 Contributing

1. Fork repo
2. Create feature branch
3. Add tests
4. Submit pull request with description

## 📜 License

ISC
