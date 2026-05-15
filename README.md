# Expense Tracker

Full-stack expense tracker: **Node.js + Express + MongoDB** API and a **React + Vite + Tailwind** dashboard. One deploy on **Render** can serve both the API and the built UI from `client/dist`.

## Local development

1. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.

2. Install and run the API:

   ```bash
   npm install
   npm start
   ```

3. In another terminal, run the React app (hot reload + proxy to the API):

   ```bash
   cd client
   npm install
   npm run dev
   ```

4. Open **http://localhost:5173**. (Vite proxies `/api` to port 3000.)

To run everything on port 3000 only: `npm run build` then `npm start`, then open **http://localhost:3000**.

---

## Deploy from GitHub to Render (step by step)

### A. Put the code on GitHub

1. Create a new repository on GitHub (empty is fine).
2. On your machine, in this project folder:

   ```bash
   git init
   git add .
   git commit -m "Expense Tracker"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

Do **not** commit a real `.env` file (it is listed in `.gitignore`).

---

### B. MongoDB Atlas (database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free cluster.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`) so Render can connect. (For stricter security later, restrict to Render’s outbound IPs.)
4. **Database** → **Connect** → **Drivers** → copy the connection string.
5. Replace `<password>` with your user’s password and set a database name in the path, e.g. `...mongodb.net/expense-track?retryWrites=true&w=majority`.

Keep this string for **MONGO_URI** in Render.

---

### C. Create the Render Web Service

1. Sign in at [render.com](https://render.com) and link your GitHub account if asked.
2. **Dashboard** → **New +** → **Web Service**.
3. **Connect** your GitHub repository and select this repo.
4. Configure:

   | Field | Value |
   |--------|--------|
   | **Name** | e.g. `expense-tracker` (becomes part of your URL) |
   | **Region** | Choose closest to you |
   | **Branch** | `main` (or your default branch) |
   | **Root Directory** | *(leave empty)* |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install && cd client && npm install && npm run build` |
   | **Start Command** | `npm start` |
   | **Instance type** | Free (spins down after idle; first request may be slow) |

5. Open **Advanced** → **Add Environment Variable**:

   | Key | Value |
   |-----|--------|
   | `MONGO_URI` | Your Atlas connection string (from step B) |
   | `JWT_SECRET` | A long random string (e.g. 32+ characters). Required for login/signup tokens. |

   Optional: `NODE_VERSION` = `20` (Render also respects `engines` in `package.json`.)

6. Click **Create Web Service**. Wait for the build and deploy to finish.

7. Open the service URL Render shows (e.g. `https://expense-tracker-xxxx.onrender.com`). You should see the login page. Sign up, then use the app.

---

### D. Optional: deploy with `render.yaml` (Blueprint)

If you use **New** → **Blueprint** and connect this repo, Render reads `render.yaml`. You must still set **`MONGO_URI`** in the dashboard for the web service (Blueprint marks it `sync: false`). **`JWT_SECRET`** can be auto-generated on first deploy when using the Blueprint.

---

## How Render build works

- **`npm install`** installs server dependencies.
- The **build command** installs client dependencies and runs Vite (`cd client && npm install && npm run build`), producing **`client/dist`**.  
  On Render, use that full command so the deploy works even if an older `package.json` on GitHub has no root `"build"` script. Locally you can still use `npm run build` (defined in root `package.json`).
- **`npm start`** runs Express, which serves **`client/dist`** when present (same origin → no `VITE_API_URL` needed).

---

## API reference

- `POST /api/auth/signup` — `{ "email", "password" }`
- `POST /api/auth/login` — `{ "email", "password" }`
- `GET /api/budget` — `Authorization: Bearer <token>`
- `POST /api/budget` — `{ "budget" }` — Bearer token
- `GET /api/expenses` — Bearer token
- `POST /api/expenses` — `{ title, amount, category, date? }` — Bearer token
- `DELETE /api/expenses/:id` — Bearer token

---

## Troubleshooting (Render)

- **`npm error Missing script: "build"`** — On the Render service, open **Settings** → **Build & Deploy** → set **Build Command** to:  
  `npm install && cd client && npm install && npm run build`  
  (Do not use only `npm run build` unless your **root** `package.json` on GitHub includes a `"build"` script.) Then **Manual Deploy** → **Clear build cache & deploy**.
- **Build fails on `client`**: Check logs; ensure Node 18+.
- **Deploy works but “Server error” / login fails**: Confirm **`MONGO_URI`** and **`JWT_SECRET`** are set on the service (no typos; password in URI must be URL-encoded if it has special characters).
- **MongoDB connection error**: Atlas **Network Access** must allow Render (often `0.0.0.0/0` for testing).
- **Cold start**: Free tier sleeps; wait ~30–60 seconds after idle, then refresh.

---

## Legacy `public/` UI

If `client/dist` is missing, the server falls back to static files under `public/`. The Render build always creates `client/dist`, so production uses the React app.
