# Cafe Express - Restaurant Management (React + Node.js + MongoDB)

Laravel project ka full conversion:

| Folder   | Kya hai                                                        |
|----------|----------------------------------------------------------------|
| `kishan/` | Frontend - React 18 + Vite + Tailwind CSS 4                   |
| `server/` | Backend - Node.js + Express + MongoDB (Mongoose) + JWT auth   |

## Setup

### 1. Backend (`server/`)
```bash
cd server
npm install
cp .env.example .env      # phir .env me apni values bharo (neeche dekho)
npm run seed              # (optional) admin user + sample menu + customers
npm run dev               # http://localhost:5000/api
```

`.env` me jo tum bharoge:

| Key | Kya daalna hai |
|-----|----------------|
| `MONGO_URI` | MongoDB connection string (local ya Atlas) |
| `JWT_SECRET` | Koi bhi lambi random string |
| `CLIENT_URL` | Frontend ka URL (dev: `http://localhost:5173`) |
| `SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / MAIL_FROM` | Sirf forgot-password email ke liye (optional - khali ho to reset link server console me print hota hai) |

Seed ke baad login: `admin@cafe.com` / `Admin@123` (`.env` me `SEED_ADMIN_*` se badal sakte ho).

### 2. Frontend (`kishan/`)
```bash
cd kishan
npm install
npm run dev               # http://localhost:5173
```
Dev me `/api` calls apne aap `localhost:5000` pe jaati hain. Production me `kishan/.env` me
`VITE_API_URL=https://your-backend.com/api` set karke `npm run build` chalao.

## Laravel se kya kya convert hua

| Laravel | Ab |
|---------|----|
| Blade views + Bootstrap | React pages + Tailwind |
| Session auth (Breeze) | JWT (Login, Register, Forgot/Reset password, Profile, Delete account) |
| Customers CRUD + detail page (order history, total spent) | `/customers`, `/customers/:id` |
| Menu categories + items (availability, category rename sync) | `/menu-categories`, `/items` |
| Orders (multi-item lines, live total, bill number) | `/orders`, `/orders/new`, `/orders/:id/edit` |
| Cart (unpaid orders + cash/online payment) | `/cart` + navbar badge |
| Dashboard, Reports | `/dashboard`, `/reports` |
| Staff members, Shifts, Order assignment | `/staff-members`, `/staff-shifts`, `/staff/assign` |

## API (sab `/api` ke neeche, `Authorization: Bearer <token>`)

`POST /auth/register|login|forgot-password|reset-password` (public), `GET /auth/me`,
`PATCH /profile`, `PUT /profile/password`, `DELETE /profile`,
`/customers`, `/menu-categories`, `/items`, `/orders` (+ `/orders/cart`, `/orders/:id/payment`),
`/staff-members`, `/staff-shifts`, `/staff-assignments`, `/dashboard`, `/reports`.
Lists me `?page=1&limit=10`, dropdowns ke liye `?all=true`.

## Dhyan rakho
- Purana MySQL/SQLite data apne aap migrate nahi hota. Naya MongoDB khali start hota hai.
- Order ka price hamesha server DB se calculate hota hai (client ke bheje price par bharosa nahi).
- Laravel ki `.env` (APP_KEY, DB password) is project me copy nahi ki gayi.
