# Kalakruti Artistry — Artisan Embroidery & Crochet Web App

A mobile-first web application for an artisan embroidery and crochet business, featuring direct
WhatsApp customer inquiries, Cloudinary image hosting, and an admin management dashboard.

Built with **React (Vite) + Tailwind CSS** on the frontend and **Node.js + Express + MongoDB (Mongoose)** on the backend.

---

## ✨ Features

- **Direct WhatsApp interaction**
  - Every service card, gallery item, and gallery modal has an **Inquire on WhatsApp** button.
  - Pre-filled message: `Hi Kalakruti Artistry! I'm interested in [Product/Service Name]. Is this available?`
  - Business number: **+91 70130 58527** (`917013058527`).
  - Sticky floating WhatsApp button on every public page; "Continue on WhatsApp" after a custom order.
- **Free to use** — no customer sign-up or login anywhere. Browse, view the gallery, send custom orders.
- **Cloudinary image storage** — uploads go straight to Cloudinary; deleting or replacing an item in the
  Admin Panel also removes the old image from Cloudinary (via its stored `public_id`).
- **Mobile-first UI** — slide-out drawer navigation, sticky WhatsApp button, safe-area aware layout.
- **Admin Panel (`/admin`)** — username + password login. The credentials are stored in your
  **MongoDB Atlas** database (`admins` collection, salted scrypt hash — never plain text), not in `.env`:
  - Services CRUD
  - Gallery manager (Cloudinary upload, tags, featured items)
  - Custom orders dashboard (status, remarks, "Reply on WhatsApp")
  - Testimonials manager
  - Site settings, brand name, & hero banner CMS
  - Change-password from the sidebar
  - Manage the home slider, categories, and full product catalogue
- **Brand styling** — cream/beige base, deep plum + terracotta accents, hand-stitched dashed CSS effects,
  Playfair Display / Cormorant / Poppins.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB database (local, or free [MongoDB Atlas](https://www.mongodb.com/atlas))
- A free [Cloudinary](https://cloudinary.com) account

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env     # then fill in the values below
npm run create-admin     # create your admin username + password (stored hashed in MongoDB)
npm run seed             # optional: demo services, testimonials, site config
npm run dev
```

**`backend/.env`**

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key   # signs session tokens; admin login itself lives in MongoDB

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Business contact
BUSINESS_WHATSAPP_NUMBER=917013058527
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

**`frontend/.env`**

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WHATSAPP_NUMBER=917013058527
```

Open http://localhost:5173. The admin panel is at http://localhost:5173/admin — sign in with the
username/password you created via `npm run create-admin`. Forgot it? Run `npm run create-admin` again with the
same username to set a new password.

---

## 🔌 API Overview

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/admin/login` | Public (rate-limited) | Admin login (username + password from MongoDB) → JWT |
| GET | `/api/admin/verify` | Admin | Validate a stored token |
| PUT | `/api/admin/password` | Admin | Change password (invalidates old sessions) |
| GET | `/api/slides`, `/api/slides/all` | Public / Admin | Home slider banners |
| POST/PUT/PATCH/DELETE | `/api/slides[...]` | Admin | Slide CRUD, reorder, show/hide |
| GET | `/api/categories`, `/api/categories/all` | Public / Admin | Shop categories |
| POST/PUT/PATCH/DELETE | `/api/categories[...]` | Admin | Category CRUD, reorder, show/hide |
| GET | `/api/products`, `/api/products/filters`, `/api/products/:idOrSlug` | Public | Shop listing, filter options, product page |
| POST/PUT/PATCH/DELETE | `/api/products[...]` | Admin | Product CRUD (images → Cloudinary) |
| GET | `/api/services` | Public | List active services |
| POST/PUT/PATCH/DELETE | `/api/services[...]` | Admin | Service CRUD (image → Cloudinary) |
| GET | `/api/gallery`, `/api/gallery/tags` | Public | List gallery items / tags |
| POST | `/api/gallery` | Admin | Upload image to Cloudinary & save |
| PUT | `/api/gallery/:id` | Admin | Update item (replaces old Cloudinary image) |
| DELETE | `/api/gallery/:id` | Admin | Delete from database **and** Cloudinary |
| POST | `/api/orders` | Public | Submit custom order (up to 4 reference images) |
| GET/PATCH/DELETE | `/api/orders[...]` | Admin | View, update status, delete orders |
| GET | `/api/testimonials` | Public | Visible testimonials |
| GET/PUT | `/api/site-config` | Public / Admin | Store info, hero banner, contacts |

---

## 🎨 Brand Tokens

| Token | Hex | Usage |
| --- | --- | --- |
| Cream | `#FDFBF7` | Page background |
| Beige | `#F7F2EA` | Card & section background |
| Plum | `#6A1B38` | Primary brand color & headings |
| Terracotta | `#C86D51` | Accent buttons & links |
| WhatsApp Green | `#25D366` | WhatsApp interaction buttons |

---

## 🔒 Security hardening (new)

- **Only the admin portal has a login.** Customers never sign in anywhere — browsing, the shop,
  wishlist, gallery, and custom orders all work with no account.
- **NoSQL injection blocked** — `express-mongo-sanitize` strips any `$`/`.` operator keys from
  request bodies, query strings, and params before they ever reach a MongoDB query.
- **Mass-assignment blocked** — every admin PUT route (services, gallery, testimonials, site
  settings, products, categories, slides) writes an explicit allow-list of fields, never a raw
  spread of the request body, so a request can't sneak in fields it shouldn't touch.
- **Rate limiting** — a general limiter across the whole API, a stricter one on admin login
  (10 attempts / 15 min), and a dedicated one on the public custom-order form (8 / hour) since it
  accepts image uploads and has no login to gate it.
- **Uploads** are checked by both file extension and real MIME type (not just the filename), capped
  at 5 MB and 6 files per request, and always go straight to Cloudinary — nothing is ever saved to
  the server's disk.
- **JWTs** are signed and verified with an explicit `HS256`-only allow-list (blocks algorithm-
  confusion attacks), and are invalidated the moment a password is changed.
- **Passwords** are never stored in plain text — only a salted `scrypt` hash — and login responses
  never reveal whether a username exists.
- **Security headers** via `helmet`, HTTP parameter-pollution protection via `hpp`, a 1 MB JSON body
  cap, and a generic error handler that never leaks stack traces or internals to the client.
- **CORS** is locked to your `CLIENT_URL` — no other website can call your API from a browser.

No system is 100% "unhackable," but this covers the standard risks (NoSQL injection, mass
assignment, brute force, malicious uploads, and stolen-token replay after a password change) for a
site of this size. If you deploy this publicly, also: serve it over HTTPS, keep `JWT_SECRET` long
and secret, and keep `npm audit` clean by running `npm install` regularly.

## 🛍️ Shopping experience (new)

- **Mobile-app style layout** — sticky header with hamburger + search, a slide-out drawer, and a
  fixed bottom tab bar (Home · Categories · Shop · Offers · Custom) on phones/tablets. Desktop gets
  a full horizontal nav instead of the bottom bar.
- **Auto-playing hero slider** — swipeable banners with Ken Burns image zoom, staggered text, and
  progress dashes. Fully managed from **Admin → Slides**: add banners, pick a gradient or upload a
  photo, choose where the button links, drag-reorder with the arrows, and preview exactly how it
  looks on a phone before saving.
- **Categories** — round icon/photo shortcuts on the home page and a dedicated `/categories` page,
  both managed from **Admin → Categories** (name, tagline, icon or photo, colour, order, show/hide).
- **Shop (`/shop`)** — search, category / price / discount / colour / stock filters (collapsible
  sections, chip-based active filters, a bottom-sheet on phones), sort, and infinite "Load more".
- **Product pages (`/product/:slug`)** — swipeable photo gallery, price/discount, colours,
  description, related products, and the WhatsApp inquiry button.
- **Wishlist (`/wishlist`)** — tap the heart on any product; saved locally on the visitor's device,
  no account needed.
- **Products** are fully managed from **Admin → Products**: name, description, price/MRP (discount
  is calculated automatically), category, colours, tags, up to 6 photos, and feature/stock/visibility
  toggles.
- **Animations throughout** — scroll-reveal sections, hover/press micro-interactions, a heart "pop"
  on wishlist, a shine sweep on primary buttons, and a scrolling announcement ticker — all skipped
  automatically for visitors with "reduce motion" turned on.
- **Brand name** is no longer hard-coded — set it once in **Admin → Site Settings → Brand** and it
  updates the header, footer, WhatsApp messages and page title everywhere.

## 🗂️ Key files

- `backend/config/cloudinary.js` — Cloudinary setup + `destroyImage` helper
- `backend/middleware/upload.js` — `multer-storage-cloudinary` upload middleware
- `backend/models/Admin.js`, `backend/routes/auth.js` — MongoDB-backed admin login → JWT
- `backend/utils/createAdmin.js` — `npm run create-admin` (create / reset admin)
- `backend/models/{Slide,Category,Product}.js`, `backend/routes/{slides,categories,products}.js` — shop data
- `frontend/src/components/HeroSlider.jsx`, `CategoryCircles.jsx`, `ProductCard.jsx`, `FilterPanel.jsx` — shop UI
- `frontend/src/components/Header.jsx`, `BottomNav.jsx` — mobile-app style navigation
- `frontend/src/utils/whatsapp.js`, `hooks/useWhatsApp.js` — WhatsApp link builder (brand-aware)
- `frontend/src/pages/admin/{ProductsManager,SlidesManager,CategoriesManager}.jsx` — new admin screens

Made with 🧵 for **Kalakruti Artistry**.
