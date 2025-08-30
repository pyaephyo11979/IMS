# IMS (Inventory Management System)

A lightweight Inventory & Sales Management platform built with **Laravel**, **Inertia.js**, **React (TypeScript)**, and **Tailwind CSS** (monochrome theme). It provides unified handling of products, stock notifications, sales, invoices (sales-only), customers, suppliers, branches, and an interactive auto‑refreshing dashboard.

---

## ✨ Core Features

- Dashboard with live (polling) auto-refresh, branch sales analytics (sorting / searching / grid ↔ table view)
- Monochrome UI theme for distraction-free operation
- Product catalog with supplier, category, branch, stock & low stock notification support
- Sales pipeline (create, list, filter, update status, delete)
- Invoices (sales aggregation only) with: multi-sale attachment, status updates, deletion, print-friendly detail view, signatures, branch tagging
- Customers & Suppliers management
- Branch management (scoped visibility for cashier role)
- Role-based access (role `1` cashier: branch-scoped; role `2` admin: global)
- Stock notifications (low stock Artisan command queued)
- Consistent currency formatting (MMK) on financial cards and invoice views
- Pivot table `invoice_sale` to associate multiple sales with a single invoice

---

## 🧱 Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Backend | Laravel (PHP) |
| Frontend Transport | Inertia.js |
| Frontend UI | React + TypeScript + Tailwind CSS (custom design tokens) |
| Build Tooling | Vite + Bun (bun.lock present) |
| Testing | Pest / PHPUnit |
| Task Queue | Laravel Queue (jobs, failed_jobs tables) |
| DB | SQLite (default) or MySQL/PostgreSQL (recommended prod) |

---

## 🔐 Roles & Authorization
- **Cashier (role = 1):** Restricted to their branch invoices & sales; can create/update invoice statuses, create sales.
- **Admin (role = 2):** Global visibility across branches.

Branch scoping is enforced at query level (e.g., invoice and sales index controllers) using user branch association.

---

## 🗄️ Database Schema & SQL Reference
Raw SQL DDL and principal DML translations are documented in [`sqlqueries.md`](./sqlqueries.md). This includes:
- Table creation statements (users, products, sales, invoices, pivot, stock notifications, etc.)
- Typical runtime queries (filters, listing, attachments)
- Suggested performance indexes
- Integrity check samples

> The `invoices.type` enum still contains `'purchase'` though current logic uses only `'sale'` (future cleanup candidate).

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url> ims
cd ims
cp .env.example .env  # if present
composer install
bun install             # or: npm install / pnpm install
php artisan key:generate
```

### 2. Configure Environment

Edit `.env` as needed:

```env
APP_NAME="IMS"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=sqlite
# For sqlite ensure: touch database/database.sqlite
# Or configure mysql / pgsql accordingly.

QUEUE_CONNECTION=database
CACHE_STORE=database
SESSION_DRIVER=database
```

If using SQLite:

```bash
touch database/database.sqlite
php artisan migrate
```

For MySQL/PostgreSQL update credentials then migrate:

```bash
php artisan migrate --seed
```
(Seeders optional—add sample data if created.)

### 3. Run Dev Servers (two processes)

```bash
php artisan serve
bun run dev    # Vite frontend + HMR
```
Visit: http://127.0.0.1:8000 (or APP_URL).

### 4. Queue Worker (for low stock command & future async tasks)

```bash
php artisan queue:work
```
The dashboard dispatches `stock:check-low` (queued) opportunistically; ensure worker active to populate notifications.

### 5. Tests

```bash
php artisan test
# or
./vendor/bin/pest
```

---

## 🧩 Development Notes
- **Auto-Refresh:** Dashboard uses polling (Inertia `visit`) with configurable interval + tab visibility pause.
- **Print View:** Invoice details clone on-screen DOM for WYSIWYG printing (with hidden action controls).
- **Design Tokens:** Tailwind theme tokens defined in `resources/css/app.css` via custom CSS variables (OKLCH grayscale palette).
- **Pivot Sync:** Invoice sales attachment uses `sync()` with generated key map (see `InvoiceController@store`).
- **Performance:** Consider adding indexes listed in `sqlqueries.md` when moving beyond SQLite.

---

## 📦 Build (Production)

```bash
bun run build   # or: npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Serve behind a production web server (Nginx/Apache) pointing to `public/`.

---

## 🛡️ Security Checklist
- Ensure `.env` never committed.
- Use HTTPS in production.
- Set appropriate DB user permissions (least privilege).
- Rotate APP_KEY only before going live (rotation invalidates encrypted data like sessions if mis-handled).

---

## 🔄 Future Improvements (Backlog Ideas)
- Replace polling with WebSockets (Laravel Echo / Pusher) for real-time dashboard updates
- Remove `purchase` enum value from invoices or reintroduce proper purchase flow
- Add richer analytics & charts (time-series sales, top products)
- Centralized currency & number formatting helper
- Toast notifications for CRUD feedback across pages

---

## 📚 License
Add a license (e.g. MIT) here if open-sourcing.

---

## 🤝 Contributing
1. Fork & create feature branch
2. Run tests locally
3. Submit concise PR with description referencing affected modules

---

## 🧪 Smoke Test Script (Manual)

```bash
php artisan migrate:fresh --seed
php artisan serve &
bun run dev &
# Create a sale (UI) -> Attach to invoice -> Print invoice -> Observe dashboard auto-refresh
```

---

## 📝 Changelog Highlights
- Added sales-only invoices (multi-sale attach, status mgmt, delete)
- Added invoice print parity + signatures & branch meta
- Implemented dashboard interactivity + auto-refresh
- Applied global monochrome theme
- Added SQL reference file (`sqlqueries.md`)

---

## 🙋 Support
Open an issue or contact the maintainer.

---

Generated initial README — tailor further to deployment infra (Docker, CI, etc.) as needed.
