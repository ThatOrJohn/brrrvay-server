# Brrrvay Technical Overview

## 📦 System Components

### 1. Admin/Customer Dashboard (this repo)

The web app used by internal support, bar owners, franchise operators, and staff to:

- Configure store and device settings
- View alerts and analytics from CV agents
- Manage users, roles, permissions
- Trial/demo limited usage periods
- Extend subscriptions or request support

**Hosted on:** Vercel, or any platform that supports Next.js.

**Backed by:** Neon Postgres via Drizzle ORM.

---

### 2. Brrrvay-Agent (future)

A Node.js or Python-based **local agent** that:

- Interfaces with USB cameras or IP cams
- Runs a local CV model for **empty mug detection**
- Redacts or anonymizes faces in real-time (emoji overlay)
- Sends alerts to bar staff (webhooks, app UI, buzzer triggers)
- Buffers/stores structured events locally and syncs to the server

**Goals:**

- Run 100% locally (no constant streaming to cloud)
- Efficient on low-spec edge devices
- Optional Roboflow or custom ONNX model integration

---

## 🏢 Object Hierarchy

The platform supports a flexible hierarchy:

- `Organizations`: Top-level org container
- `Concept`: Brand/vertical grouping under a company
- `Store`: Physical location that has brrrvay-agents
- `User`: Tied to specific roles and permissions

> Support is baked in for store reassignments (e.g., franchise buyouts), making historical data transferrable between orgs.

---

## 👥 User Roles

- **Global Admin**: Internal support user with superpowers
- **Company Admin**: Full access to company’s data and config
- **Concept Manager**: Scoped to one or more concepts
- **Store Employee**: Scoped to one or more stores
- **Demo User**: Time-limited, feature-limited trial users

---

## 🔐 Auth Strategy

- Username + password via NextAuth
- Drizzle adapter for session persistence
- SSO planned (Google Workspace, OAuth2 for chains)

---

## 🔧 Configuration Data

Stored in Neon/Postgres and will include:

- Agent settings (thresholds, operating hours)
- Alerting configurations
- Device metadata
- Permissions

---

## 🔗 Integration Possibilities

- Webhooks (e.g., Twilio SMS for urgent alerts)
- POS system hooks (e.g., tap tracking)
- BI tools (e.g., Metabase or Lightdash)

---

## 🔮 Future Expansion

- Heatmaps of service gaps
- Activity detection (e.g., bartender at station)
- Integration with ordering systems
- Automated guest satisfaction KPIs
