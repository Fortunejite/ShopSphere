# 🛍️ ShopSphere

<div align="center">

![Next.js 15](https://img.shields.io/badge/Next.js-15.3.8-black?style=for-the-badge&logo=next.js)
![React 19](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.5.0-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.17-06B6D4?style=for-the-badge&logo=tailwindcss)
![Stripe](https://img.shields.io/badge/Stripe-20.1.0-635BFF?style=for-the-badge&logo=stripe)
![Paystack](https://img.shields.io/badge/Paystack-3.6.1-0BA4DB?style=for-the-badge&logo=paystack)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-S3_Compatible-F38020?style=for-the-badge&logo=cloudflare)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<p align="center">
  <strong>A high-performance, multi-tenant e-commerce platform empowering vendors to build branded storefronts with custom subdomains, visual theme customization, dual global/regional payment rails (Stripe & Paystack), Cloudflare R2 object storage, and real-time vendor analytics.</strong>
</p>

[Features](#-key-features) • [Architecture](#-architecture--system-design) • [Tech Stack](#-technology-stack) • [Project Structure](#-project-structure) • [Getting Started](#-getting-started) • [Environment Variables](#-environment-configuration) • [API Documentation](#-complete-api-documentation) • [Database Schema](#-database-schema--prisma-models) • [Deployment](#-deployment--production-setup)

</div>

---

## 📖 Overview

**ShopSphere** is a modern, enterprise-grade multi-vendor e-commerce platform built on Next.js 15, React 19, TypeScript, Prisma ORM, and PostgreSQL. It allows independent merchants to launch their own branded online stores in minutes with isolated custom subdomains (e.g., `mystore.shopsphere.ng` or `mystore.sphere.localhost:3000`).

Unlike traditional single-gateway platforms, ShopSphere provides a **Dual Payment Infrastructure**:
1. **Stripe Connect** for international customers and global payouts.
2. **Paystack Subaccounts** with automated bank verification, split payments, and settlement tracking tailored for African and emerging markets.

In addition, ShopSphere features an integrated **No-Code Theme Customizer ("Meridian Commerce")** with dynamic OKLCH color token injection, **Cloudflare R2 Direct S3 Uploads** with presigned URLs, a **Smart Guest-to-User Cart Synchronization Engine**, and an interactive **Vendor Business Intelligence Dashboard** powered by Recharts.

---

## ✨ Key Features

### 🏪 Multi-Tenant Subdomain Architecture
- **Automatic Subdomain Rewriting**: Dynamic Next.js Edge Middleware inspects incoming host headers and rewrites requests directly to isolated vendor storefronts (`[subdomain].[rootDomain]`).
- **Instant Store Provisioning**: Guided onboarding flow creates an active store with instant slug availability checking (`/api/shops/check-domain`).
- **Independent Storefront Experience**: Each shop operates with its own catalog, categories, cart, order workflows, and branding.

### 🎨 No-Code Visual Theme Customizer
- **"Meridian Commerce" Design System**: Tailored aesthetic (Deep Emerald, Warm Amber/Gold, Warm Ivory, Ink Navy, and Forest Dark).
- **Vendor-Controlled Theming**: Merchants can customize primary, secondary, accent, background, text, borders, card styles, and semantic feedback colors.
- **Dynamic OKLCH Color Engine**: Live preview and real-time injection of light and dark CSS variables directly into the storefront DOM.
- **Persistent Theme Configuration**: Themes are persisted as JSON objects directly in PostgreSQL via Prisma.

### 💳 Dual Payment Gateway Engine
- **Stripe & Stripe Connect**:
  - Connect onboarding links for merchant payouts.
  - Hosted Stripe Checkout sessions with multi-currency conversion.
  - Webhook listener verifying and updating order statuses to `processing`.
- **Paystack & Regional Split Payments**:
  - Direct integration with Nigerian/African banking rails via `paystack-sdk`.
  - Live bank verification against Paystack's bank list API.
  - Automatic merchant subaccount provisioning (`paystack_account_id`).
  - Checkout supporting cards, bank transfer, USSD, Apple Pay, and mobile money.
  - Paystack Settlements Hub: In-dashboard visibility into payout schedules, processed totals, and net settlements.

### 📦 Product & Inventory Engine
- **5-Step Product Wizard**: Guided creation form covering:
  1. *Basic Details* (name, slug, categories, description)
  2. *High-Resolution Media* (drag-and-drop Cloudflare R2 uploads)
  3. *Pricing & Discounts* (base price, discount percentage, calculated selling price)
  4. *Variant Generator* (attributes such as Size, Color, Material with JSON storage)
  5. *Dimensions & Shipping* (weight, length, width, height)
- **Inventory & Stock Management**: Stock quantity counters, automated out-of-stock badges, and real-time sales count increments upon order completion.

### 🛒 Redux Shopping Cart & Seamless Guest Checkout
- **Persistent State**: Redux Toolkit store backed by local storage persistence for uninterrupted guest browsing.
- **Seamless Cart Merging (`useAuthWithCartMerge`)**: When a guest user logs in or creates an account, local cart items automatically synchronize with their database cart via `/api/shops/[domain]/cart/merge`.
- **Variant-Aware Cart**: Tracks unique combinations of product IDs and variant indices.

### 📊 Real-Time Vendor Analytics Dashboard
- **Key Metrics (KPIs)**: Total revenue, monthly revenue, total orders, active products, confirmed customer count, and low-stock alerts.
- **Interactive Recharts**:
  - **Revenue Over Time**: Interactive Area Chart tracking sales velocity.
  - **Order Status Distribution**: Breakdown across `pending`, `processing`, `shipped`, `delivered`, and `cancelled`.
- **Product & Order Feeds**: Top 5 best-selling products by units sold and real-time recent order lists.

### ☁️ Cloudflare R2 Object Storage
- **S3-Compatible High-Speed Media Pipeline**: Uses `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` against Cloudflare R2 buckets.
- **Direct Client Uploads**: Secure presigned PUT URLs with short expiration periods (60s), eliminating backend bandwidth bottlenecks.
- **Client & Server Validation**: Enforces MIME type checks (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) and a 10MB size limit.

### 🔐 Authentication & Role-Based Access Control
- **NextAuth.js v5 (Auth.js)**: JWT session strategy with credential-based authentication and secure Bcrypt password hashing.
- **Role System**: Dedicated roles (`user`, `admin`, `guest`) protecting admin endpoints, merchant settings, and private customer orders.

---

## 🏛️ Architecture & System Design

```mermaid
flowchart TD
    subgraph Client ["Client Devices & Browsers"]
        Browser["Customer / Merchant Browser"]
    end

    subgraph Edge ["Edge & Routing Layer"]
        MW["Next.js Middleware (Subdomain Rewriter)"]
        SubdomainRoute["[domain].sphere.localhost / custom domain"]
        MainRoute["Main Landing Platform (sphere.localhost)"]
    end

    subgraph AppLayer ["Next.js 15 App Router"]
        StorefrontPages["/shops/[domain]/* (Storefront, Cart, Checkout)"]
        AdminPages["/shops/[domain]/admin/* (Dashboard, Products, Settings)"]
        APIRoutes["/api/shops/*, /api/auth/*, /api/upload-url, /api/webhook/*"]
        Services["Domain Services (Order, Product, Cart, Payment, Stats)"]
        Repos["Repository Layer (Prisma Data Access)"]
    end

    subgraph State ["Client State"]
        ReduxStore["Redux Toolkit (Cart, Shop, Categories)"]
        LocalStorage["Local Cart Storage (Guest fallback)"]
    end

    subgraph External ["External Services"]
        NeonDB[("PostgreSQL / Neon Database")]
        R2["Cloudflare R2 Object Storage"]
        Stripe["Stripe Connect API & Webhooks"]
        Paystack["Paystack API & Webhooks"]
    end

    Browser --> MW
    MW -->|Subdomain detected| SubdomainRoute --> StorefrontPages & AdminPages
    MW -->|Apex domain| MainRoute

    StorefrontPages & AdminPages --> ReduxStore
    ReduxStore <--> LocalStorage
    StorefrontPages & AdminPages --> APIRoutes

    APIRoutes --> Services
    Services --> Repos
    Repos --> NeonDB

    Services -->|Presigned URLs| R2
    Services -->|Connect & Checkout| Stripe
    Services -->|Subaccounts & Settlements| Paystack
    Stripe & Paystack -.->|Webhooks| APIRoutes
```

---

## 💻 Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 15.3.8](https://nextjs.org/) | App Router, Server Components, Route Handlers, React 19 |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict static type safety across client and server |
| **Database** | [PostgreSQL](https://www.postgresql.org/) / [Neon](https://neon.tech/) | Relational database with serverless connection pooling |
| **ORM** | [Prisma 7.5.0](https://www.prisma.io/) | Type-safe query engine with `@prisma/adapter-pg` driver |
| **Styling** | [Tailwind CSS 4.1.17](https://tailwindcss.com/) | Next-gen CSS engine with `tw-animate-css` |
| **Component Kit** | [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/) | Accessible component primitives (dialogs, tabs, selects, forms) |
| **Icons & Notifications** | [Lucide React](https://lucide.dev/) / [Sonner](https://sonner.emilkowal.ski/) | Clean icon library and lightweight toast notifications |
| **Analytics Charts** | [Recharts 3.1.2](https://recharts.org/) | Composable, responsive SVG charts for merchant analytics |
| **Authentication** | [NextAuth.js v5 Beta](https://authjs.dev/) | Auth.js credential provider with bcrypt password hashing |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/) | Global client state management for cart and shop contexts |
| **Object Storage** | [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) | S3-compatible cloud storage using `@aws-sdk/client-s3` |
| **Payment Gateways** | [Stripe](https://stripe.com/) & [Paystack](https://paystack.com/) | Global credit card processing & African banking/split payouts |
| **Validation** | [Zod 3.25](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/) | Schema validation with `@hookform/resolvers` |

---

## 🏗️ Project Structure

```
shop_sphere/
├── prisma/
│   ├── migrations/               # Prisma database migration history
│   └── schema.prisma             # Prisma schema models, enums & relations
├── public/                       # Static public assets & illustrations
├── src/
│   ├── app/                      # Next.js 15 App Router
│   │   ├── layout.tsx            # Root HTML layout with providers & fonts
│   │   ├── page.tsx              # Platform landing page & features
│   │   ├── global.css            # Tailwind CSS v4 tokens & Meridian Commerce theme
│   │   ├── login/                # Platform global sign-in
│   │   ├── signup/               # Platform global registration
│   │   ├── shops/
│   │   │   ├── page.tsx          # Explore public vendor shops
│   │   │   ├── new/              # Shop creation wizard
│   │   │   └── [domain]/         # Subdomain-routed vendor storefront
│   │   │       ├── layout.tsx    # Storefront layout (Navbar, Footer, ShopTheme)
│   │   │       ├── page.tsx      # Storefront home (Hero, Categories, Products)
│   │   │       ├── cart/         # Shopping cart view
│   │   │       ├── checkout/     # Checkout & payment redirection
│   │   │       ├── orders/       # Order tracking & customer history
│   │   │       │   └── [trackingId]/ # Detailed order status & tracking
│   │   │       ├── products/     # Shop catalog, search & product details
│   │   │       │   └── [slug]/   # Single product page with variant selector
│   │   │       ├── profile/      # User profile within shop context
│   │   │       ├── login/        # Shop-specific login
│   │   │       ├── signup/       # Shop-specific registration
│   │   │       └── admin/        # Merchant Administration Portal
│   │   │           ├── layout.tsx# Admin dashboard sidebar & header
│   │   │           ├── page.tsx  # Analytics dashboard (KPIs, Recharts, Top products)
│   │   │           ├── categories/# Category management (CRUD)
│   │   │           ├── orders/   # Order processing & status management
│   │   │           ├── products/ # Product catalog management
│   │   │           │   ├── new/  # 5-step product creation wizard
│   │   │           │   └── [slug]/# Edit existing product
│   │   │           └── settings/ # Shop settings, Paystack/Stripe rails, ThemeCustomizer
│   │   └── api/                  # 29 RESTful API Route Handlers
│   │       ├── auth/             # NextAuth handler & registration endpoint
│   │       ├── profile/          # User profile API
│   │       ├── upload-url/       # Cloudflare R2 presigned URL generator & delete
│   │       ├── webhook/          # Webhook handlers (Stripe & Paystack)
│   │       └── shops/            # Shop operations, domain check, and domain sub-routes
│   ├── components/               # Shared React Components
│   │   ├── ui/                   # Shadcn/UI primitives (button, card, dialog, table, etc.)
│   │   ├── productForm/          # Multi-step product creation steps
│   │   ├── AdminDashboardSkeleton.tsx # Loading skeletons for analytics
│   │   ├── Loading.tsx           # Spinners and page loaders
│   │   ├── OrderCard.tsx         # Customer order cards
│   │   ├── ProductCard.tsx       # Storefront product cards with hover interactions
│   │   ├── ShopNavbar.tsx        # Dynamic storefront navigation bar
│   │   ├── ShopFooter.tsx        # Storefront footer
│   │   ├── ShopTheme.tsx         # Dynamic OKLCH CSS variable injector
│   │   ├── ThemeCustomizer.tsx   # Interactive color theme customizer
│   │   └── providers.tsx         # Redux & Session providers wrapper
│   ├── hooks/                    # Custom React Hooks
│   │   ├── redux.hook.ts         # Typed `useAppDispatch` & `useAppSelector`
│   │   └── useAuthWithCartMerge.ts# Auth integration with guest cart merging
│   ├── lib/                      # Core Utilities & Configurations
│   │   ├── prisma.ts             # Prisma Client singleton with PG adapter
│   │   ├── customTheme.ts        # Color theme interface definitions
│   │   ├── currency.ts           # Multi-currency formatting & smallest-unit conversion
│   │   ├── domain.ts             # Subdomain URL generator
│   │   ├── errorHandler.ts       # Centralized API error handling wrapper
│   │   ├── localCart.ts          # LocalStorage cart helper for guests
│   │   ├── uploadPhoto.ts        # Direct Cloudflare R2 media uploader
│   │   ├── utils.ts              # ClassName merger (`clsx` + `tailwind-merge`)
│   │   └── schema/               # Zod validation schemas (auth, cart, order, product, shop, paystack)
│   ├── redux/                    # Redux Toolkit State Management
│   │   ├── store.ts              # Redux store configuration
│   │   ├── cartSlice.ts          # Cart state, item counters, subtotal calculation
│   │   ├── shopSlice.ts          # Shop context state
│   │   └── categorySlice.ts      # Active category filters
│   ├── repositories/             # Data Access Layer (Prisma Queries)
│   │   ├── cart.repository.ts
│   │   ├── category.repository.ts
│   │   ├── order.repository.ts
│   │   ├── product.repository.ts
│   │   ├── shop.repository.ts
│   │   └── user.repository.ts
│   ├── services/                 # Business Logic Layer
│   │   ├── cart.service.ts
│   │   ├── category.service.ts
│   │   ├── order.service.ts
│   │   ├── payment.service.ts    # Dual gateway routing coordinator
│   │   ├── product.service.ts
│   │   ├── shop.service.ts
│   │   ├── stats.service.ts      # Analytics aggregation & timeseries calculations
│   │   ├── user.service.ts
│   │   ├── cloudflare/           # Cloudflare R2 client & presigned URL services
│   │   ├── paystack/             # Paystack SDK, accounts, banks, checkout, settlements
│   │   └── stripe/               # Stripe client, Connect accounts, checkout, webhooks
│   ├── types/                    # TypeScript interfaces & domain types
│   ├── auth.ts                   # NextAuth v5 configuration & callbacks
│   └── middleware.ts             # Edge subdomain rewriter
├── prisma.config.ts              # Prisma CLI configuration
├── next.config.ts                # Next.js image domains & configuration
├── components.json               # Shadcn/UI configuration
├── package.json                  # Scripts & dependencies
└── tsconfig.json                 # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.18.0 or higher (v20+ recommended)
- **npm** or **pnpm** / **yarn**
- **PostgreSQL**: PostgreSQL 14+ instance (local PostgreSQL or [Neon Serverless Postgres](https://neon.tech/))
- **Cloudflare Account**: With an active Cloudflare R2 bucket
- **Stripe Account**: For payment processing and Stripe Connect
- **Paystack Account**: (Optional but recommended for regional payments and settlements)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Fortunejite/ShopSphere.git
cd ShopSphere
```

---

### Step 2: Install Dependencies

```bash
npm install
```

---

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Populate the environment variables as explained in the [Environment Configuration](#-environment-configuration) section.

---

### Step 4: Setup Database & Prisma

Run Prisma migrations to set up your PostgreSQL database schema:

```bash
# Push schema or run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

*(Optional)* Launch **Prisma Studio** to inspect and manage your database visually:
```bash
npx prisma studio
```

---

### Step 5: Subdomain Configuration for Local Development

ShopSphere uses subdomain routing (e.g., `mystore.sphere.localhost:3000`).

#### Option A: Native Modern Browsers (Easiest)
Modern Chromium-based browsers (Chrome, Edge, Brave) automatically resolve `*.localhost` to `127.0.0.1`.
Set your `.env`:
```env
NEXT_PUBLIC_ROOT_DOMAIN="sphere.localhost:3000"
```
When accessing your app, navigate to:
- Platform landing: `http://sphere.localhost:3000`
- Vendor store: `http://mystore.sphere.localhost:3000`

#### Option B: Hosts File (Cross-Browser Compatibility)
If your browser or environment doesn't automatically resolve subdomains of `localhost`, add the following entries to your OS `hosts` file:

- **Windows**: `C:\Windows\System32\drivers\etc\hosts`
- **macOS / Linux**: `/etc/hosts`

```text
127.0.0.1 sphere.localhost
127.0.0.1 demo.sphere.localhost
127.0.0.1 yourstore.sphere.localhost
```

---

### Step 6: Start the Development Server

```bash
npm run dev
```

Open [http://sphere.localhost:3000](http://sphere.localhost:3000) (or [http://localhost:3000](http://localhost:3000)) in your browser.

---

## ⚙️ Environment Configuration

Here is the complete reference for variables required in `.env`:

```env
# ==============================================================================
# AUTHENTICATION (NextAuth.js v5 / Auth.js)
# ==============================================================================
# Generate a secret using: openssl rand -base64 32
AUTH_SECRET="your_nextauth_secret_key"
AUTH_TRUST_HOST=true

# Cron job verification secret
CRON_SECRET="your_cron_secret_key"

# ==============================================================================
# DOMAIN & MULTI-TENANCY
# ==============================================================================
# Local development: sphere.localhost:3000
# Production: shopsphere.ng
NEXT_PUBLIC_ROOT_DOMAIN="sphere.localhost:3000"

# ==============================================================================
# DATABASE (PostgreSQL / Neon)
# ==============================================================================
# Connection string with pooled or direct connection
DATABASE_CONNECTION_STRING="postgresql://username:password@localhost:5432/shopsphere?sslmode=prefer"

# ==============================================================================
# CLOUDFLARE R2 OBJECT STORAGE (S3-Compatible)
# ==============================================================================
CLOUDFLARE_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESSKEY_ID="your_r2_access_key_id"
R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
R2_BUCKET_NAME="shopsphere"
# Public R2 or custom CDN domain for images
NEXT_PUBLIC_R2_PUBLIC_URL="https://pub-yourbucketid.r2.dev"

# ==============================================================================
# STRIPE PAYMENTS (Global Gateway)
# ==============================================================================
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ==============================================================================
# PAYSTACK PAYMENTS (Regional Gateway)
# ==============================================================================
PAYSTACK_SECRET_KEY="sk_test_..."
```

---

## 📚 Complete API Documentation

All API endpoints are implemented as Next.js 15 Route Handlers under `/api`.

### 1. Authentication & Profile

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `GET` / `POST` | `/api/auth/[...nextauth]` | Public | NextAuth authentication handlers (Credentials, Session, CSRF) |
| `GET` | `/api/profile` | Authenticated | Retrieve current user profile details |
| `PUT` | `/api/profile` | Authenticated | Update user username, phone number, and shipping address |

#### Register Request Body:
```json
{
  "username": "janedoe",
  "email": "jane@example.com",
  "password": "StrongPassword123!",
  "phone_number": "+2348012345678",
  "address": "12 Marina Street, Lagos"
}
```

---

### 2. Platform & Shops

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shops` | Public | Retrieve a list of shops (filtered by owner when logged in) |
| `POST` | `/api/shops` | Authenticated | Create a new shop with initial settings |
| `GET` | `/api/shops/check-domain?domain={subdomain}` | Public | Verify if a shop subdomain is available |
| `GET` | `/api/shops/[domain]` | Public | Get public shop information, branding, and color themes |
| `PUT` | `/api/shops/[domain]` | Shop Owner | Update shop metadata, contact details, and theme configurations |

#### Create Shop Request Body:
```json
{
  "domain": "coffeecove",
  "name": "Coffee Cove Roasters",
  "description": "Artisanal specialty coffee roasted in small batches.",
  "tagline": "Fuel Your Passion",
  "email": "hello@coffeecove.com",
  "phone": "+2348000000000",
  "address": "Victoria Island, Lagos",
  "currency": "NGN"
}
```

---

### 3. Products & Categories

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shops/[domain]/products` | Public | List shop products with pagination, search, category, and sorting |
| `POST` | `/api/shops/[domain]/products` | Shop Owner | Create a new product with variants and dimensions |
| `GET` | `/api/shops/[domain]/products/[slug]` | Public | Get single product details by slug |
| `PUT` | `/api/shops/[domain]/products/[slug]` | Shop Owner | Update product details, inventory, and status |
| `DELETE` | `/api/shops/[domain]/products/[slug]` | Shop Owner | Delete a product |
| `GET` | `/api/shops/[domain]/categories` | Public | List all categories for the shop |
| `POST` | `/api/shops/[domain]/categories` | Shop Owner | Create a new category |
| `GET` | `/api/shops/[domain]/categories/[id]` | Public | Get single category |
| `PUT` | `/api/shops/[domain]/categories/[id]` | Shop Owner | Update category name and slug |
| `DELETE` | `/api/shops/[domain]/categories/[id]` | Shop Owner | Delete a category |

#### Product Query Parameters (`GET /api/shops/[domain]/products`):
- `page`: Page number (default: `1`)
- `limit`: Products per page (default: `10`)
- `search`: Search query matching name or description
- `category`: Filter by category ID
- `minPrice` / `maxPrice`: Price range filters
- `status`: Filter by `active`, `inactive`, or `out_of_stock`
- `sortBy`: Field to sort by (`name`, `price`, `created_at`, `sales_count`)
- `sortOrder`: Direction (`asc` or `desc`)

---

### 4. Cart & Guest Cart Synchronization

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shops/[domain]/cart` | Authenticated | Retrieve authenticated user's cart with enriched product data |
| `POST` | `/api/shops/[domain]/cart` | Authenticated | Add an item or update quantity in cart |
| `PUT` | `/api/shops/[domain]/cart` | Authenticated | Update item quantity or variant index |
| `DELETE` | `/api/shops/[domain]/cart` | Authenticated | Remove an item or empty cart |
| `POST` | `/api/shops/[domain]/cart/merge` | Authenticated | Merge guest local storage items into user database cart |

#### Merge Cart Request Body:
```json
{
  "items": [
    { "product_id": 14, "quantity": 2, "variant_index": 0 },
    { "product_id": 22, "quantity": 1 }
  ]
}
```

---

### 5. Orders & Checkout

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shops/[domain]/orders` | Authenticated | List all past orders for the customer within this shop |
| `POST` | `/api/shops/[domain]/orders` | Authenticated | Create an order and generate checkout payment URL |
| `GET` | `/api/shops/[domain]/orders/[trackingId]` | Public / Customer | Get order tracking timeline, items, and status |
| `POST` | `/api/shops/[domain]/orders/[trackingId]/pay` | Authenticated | Re-initiate payment session for an unpaid pending order |

---

### 6. Payment Gateways & Banking Rails

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/shops/[domain]/stripe/genetate-acount-link` | Shop Owner | Generate Stripe Connect merchant onboarding URL |
| `GET` | `/api/shops/[domain]/paystack/banks` | Shop Owner | Retrieve list of verified banks supported by Paystack |
| `POST` | `/api/shops/[domain]/paystack/sub-account` | Shop Owner | Connect bank details and create Paystack Subaccount |
| `PUT` | `/api/shops/[domain]/paystack/sub-account` | Shop Owner | Update existing Paystack Subaccount bank details |
| `GET` | `/api/shops/[domain]/admin/paystack/settlements` | Shop Owner | Retrieve payout settlement history, fees, and balance |

---

### 7. Merchant Admin & Analytics

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shops/[domain]/admin/dashboard/stats` | Shop Owner | High-level KPIs (Revenue, Orders, Customers, Growth) |
| `GET` | `/api/shops/[domain]/admin/dashboard/revenue-chart` | Shop Owner | Timeseries data for revenue area chart |
| `GET` | `/api/shops/[domain]/admin/dashboard/order-status` | Shop Owner | Order status distribution counts |
| `GET` | `/api/shops/[domain]/admin/dashboard/top-products` | Shop Owner | Top 5 best-performing products by sales count |
| `GET` | `/api/shops/[domain]/admin/dashboard/recent-orders` | Shop Owner | Recent 10 orders with item counts and customer names |
| `GET` | `/api/shops/[domain]/admin/orders` | Shop Owner | Comprehensive order management list |
| `GET` | `/api/shops/[domain]/admin/orders/[trackingId]` | Shop Owner | Detailed order view with shipping information |
| `PUT` | `/api/shops/[domain]/admin/orders/[trackingId]` | Shop Owner | Update order status (`processing`, `shipped`, `delivered`, `cancelled`) |

---

### 8. Cloudflare R2 Media Uploads

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/upload-url` | Authenticated | Generate S3 presigned PUT URL for direct client-to-R2 upload |
| `DELETE` | `/api/upload-url?key={key}` | Authenticated | Delete a file from Cloudflare R2 |

#### Upload URL Request Body:
```json
{
  "fileType": "image/webp",
  "fileSize": 1048576,
  "folder": "products"
}
```

#### Upload URL Response:
```json
{
  "presignedUrl": "https://<account-id>.r2.cloudflarestorage.com/shopsphere/products/uuid.webp?...",
  "key": "products/uuid.webp"
}
```

---

### 9. Webhooks

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/webhook/stripe` | Stripe Signature | Listens for `checkout.session.completed` and Connect events |
| `POST` | `/api/webhook/paystack` | Paystack Signature | Listens for `charge.success` and subaccount updates |

---

## 🗄️ Database Schema & Prisma Models

The database is defined in [`prisma/schema.prisma`](prisma/schema.prisma) and managed through Prisma ORM with the `@prisma/adapter-pg` driver.

```mermaid
erDiagram
    User ||--o{ Shop : owns
    User ||--o{ Cart : has
    User ||--o{ Order : places
    Shop ||--o{ Category : contains
    Shop ||--o{ Product : offers
    Shop ||--o{ Cart : has
    Shop ||--o{ Order : receives
    Category }o--o{ Product : categorizes

    User {
        int id PK
        string email UK
        string username UK
        string phone_number
        string password_hash
        UserRole role
        string address
        datetime created_at
    }

    Shop {
        int id PK
        int owner_id FK
        string domain UK
        string name
        string description
        string tagline
        ShopStatus status
        string currency
        string logo
        string banner
        string stripe_account_id UK
        boolean stripe_account_connected
        string paystack_account_id UK
        boolean paystack_account_connected
        json light_theme
        json dark_theme
    }

    Product {
        int id PK
        int shop_id FK
        int[] category_ids
        string name
        string slug
        string description
        float price
        float discount
        json variants
        string image
        string[] thumbnails
        int stock_quantity
        ProductStatus status
        int sales_count
    }

    Cart {
        int id PK
        int user_id FK
        int shop_id FK
        json items
        datetime updated_at
    }

    Order {
        int id PK
        int user_id FK
        int shop_id FK
        string tracking_id UK
        float total_amount
        float discount_amount
        float final_amount
        json items
        OrderStatus status
        string payment_reference
        json shipping_address
    }
```

### Key Models Summary

- **`User`**: System accounts supporting `user`, `admin`, and `guest` roles.
- **`Shop`**: Multi-tenant entities with unique subdomain constraints, Stripe/Paystack account codes, currency settings, and serialized `light_theme` and `dark_theme` JSON definitions.
- **`Category`**: Shop-scoped categorizations with unique `[shop_id, slug]` indexing.
- **`Product`**: Product catalog items with dimensions (weight, length, width, height), JSON variant attributes, image/thumbnail arrays, stock quantity, and sales metrics.
- **`Cart`**: Unique per `[user_id, shop_id]`, storing JSON cart items `{ product_id, quantity, variant_index }`.
- **`Order`**: Order processing record with unique `tracking_id`, full items snapshot at time of purchase, shipping address JSON, payment reference, and timestamps for shipment, delivery, or cancellation.
- **`StripeEvent` / `PaystackEvent`**: Webhook audit logs recording received event payloads and preventing duplicate executions.

---

## 🛠️ Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on [http://localhost:3000](http://localhost:3000) |
| `npm run build` | Compiles the production build |
| `npm run start` | Starts the production server using the compiled `.next` bundle |
| `npm run lint` | Runs ESLint 9 checks across all TypeScript and React files |
| `npm run postinstall` | Runs `prisma migrate deploy && prisma generate` automatically after installing packages |
| `npx prisma studio` | Opens the interactive visual database browser |
| `npx prisma db push` | Pushes the schema state directly to the database without generating a migration file |
| `npx prisma migrate dev` | Creates and applies a new migration in development mode |

---

## 🚢 Deployment & Production Setup

### Deploying to Vercel (Recommended)

1. **Import the Project**: Connect your GitHub repository to [Vercel](https://vercel.com).
2. **Environment Variables**: Add all production environment variables from `.env.example` in the Vercel Dashboard.
3. **Wildcard Domain Setup for Subdomains**:
   - In your Vercel Project Settings under **Domains**, add:
     - Root Domain: `shopsphere.ng`
     - Wildcard Subdomain: `*.shopsphere.ng`
   - In your DNS provider (e.g. Cloudflare, Namecheap, Route 53):
     - Create an `A` record for `@` pointing to `76.76.21.21` (Vercel IP).
     - Create a `CNAME` record for `*` pointing to `cname.vercel-dns.com`.
4. **Deploy**: Trigger a production deployment.

### Cloudflare R2 Bucket Configuration

To allow client-side presigned PUT uploads and image display:
1. Enable **Public Development Access** or assign a custom domain to your R2 bucket.
2. In your Cloudflare R2 bucket settings under **CORS Configuration**, add:
   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://*.shopsphere.ng", "https://shopsphere.ng"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

### Webhook Configuration

- **Stripe**: In your Stripe Dashboard, navigate to Developers -> Webhooks and add endpoint:
  `https://shopsphere.ng/api/webhook/stripe` listening for `checkout.session.completed`.
- **Paystack**: In your Paystack Dashboard, navigate to Settings -> Preferences and set your webhook URL to:
  `https://shopsphere.ng/api/webhook/paystack`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Built with ❤️ by the <strong><a href="https://github.com/Fortunejite">Fortunejite</a></strong> Team
</div>
