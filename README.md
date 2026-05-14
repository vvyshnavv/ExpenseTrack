# Expense Tracker

Full-stack Expense Tracker with Budget Management using Node.js, Express, MongoDB, and vanilla frontend.

Features:
- Signup/login with JWT
- Set monthly budget
- Add/delete expenses
- View totals and remaining balance
- Category-wise analytics using Chart.js

Quick start

1. Copy `.env` and set `MONGO_URI` and `JWT_SECRET`:

```
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
```

2. Install dependencies:

```bash
npm install
```

3. Run locally:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

API Endpoints

- `POST /api/auth/signup` - { email, password }
- `POST /api/auth/login` - { email, password }
- `GET /api/budget` - Authorization: Bearer <token>
- `POST /api/budget` - { budget } (Authorization required)
- `GET /api/expenses` - Authorization required
- `POST /api/expenses` - { title, amount, category, date? } (Authorization required)
- `DELETE /api/expenses/:id` - Authorization required

Deployment

This project serves static files from `/public`, and has a ready-to-deploy structure for platforms like Render. Set environment variables on the platform and point the start command to `npm start`.

Notes

- Keep the JWT secret safe.
- This is a beginner-friendly codebase with simple error handling and comments. Enhance validation and UI as needed.

Client (React + Tailwind) - optional

We've scaffolded a React + Tailwind client in the `client/` folder. To run the client locally:

```bash
cd client
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to the backend at `http://localhost:3000` so the React app will call the existing Express API.

The React client includes a modern dashboard layout, sidebar, header, expense list with search/sort/filter, edit modal, and charts.
