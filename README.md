# Brrrvay Admin App

Brrrvay is a vision-driven platform to help bar operators keep drinks flowing. It uses edge-based computer vision (CV) to detect empty mugs/glasses and provide real-time alerts to staff, while also collecting valuable operational insights.

This repo contains the **admin and customer dashboard** portion of Brrrvay, built with modern web technologies like Next.js and Drizzle ORM.

## ✨ Features

- Password-based authentication (SSO planned)
- Role-based access control
- Neon-hosted Postgres with Drizzle ORM
- Built-in foundation for Company > Concept > Store hierarchy
- Placeholder dashboard to expand on alerting and analytics
- Future integration with `brrrvay-agent` running on edge devices

## 🧪 Getting Started

```bash
npm install
npm run dev
```

Create a .env file:

```
# DATABASE_URL=postgres://<user>:<pass>@<host>/<db>
PGHOST='<host>'
PGDATABASE='<db>'
PGUSER='<user>'
PGPASSWORD='<pass>'
```

## 🧱 Tech Stack

- Next.js
- Drizzle ORM
- PostgreSQL (Neon)
- React Hook Form
- Radix UI
- tRPC (optional)
- Tailwind CSS

## 🔮 Vision

This is just the start — soon, this app will connect with on-prem brrrvay-agent nodes to power an end-to-end monitoring system for beverage service environments.
