# 🛍️ ShopSphere

<div align="center">

![Next.js 15](https://img.shields.io/badge/Next.js-15.3.8-black?style=for-the-badge&logo=next.js)
![React 19](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.8.0-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Hosted-336791?style=for-the-badge&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.17-06B6D4?style=for-the-badge&logo=tailwindcss)
![Stripe](https://img.shields.io/badge/Stripe-20.1.0-635BFF?style=for-the-badge&logo=stripe)
![Paystack](https://img.shields.io/badge/Paystack-3.6.1-0BA4DB?style=for-the-badge&logo=paystack)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-S3_Compatible-F38020?style=for-the-badge&logo=cloudflare)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<p align="center">
  <strong>Design and Implementation of a Multi-Tenant E-Commerce Platform with Subdomain Vendor Storefronts and Dual Payment Gateway Integration for Nigerian SMEs.</strong>
</p>

*An applied software engineering project and reference implementation submitted in partial fulfillment of the requirements for the award of a B.Sc. in Computer Science at the Federal University of Petroleum Resources, Effurun (FUPRE).*

[Problem & Objectives](#-problem-statement--research-objectives) • [Architecture](#-architecture--system-design) • [Core Features](#-core-functional-components) • [Evaluation & Tests](#-system-evaluation--verification-record) • [Known Limitations](#-documented-limitations--engineering-constraints) • [Getting Started](#-getting-started) • [Deployment](#-deployment--production-setup) • [API Documentation](#-complete-api-documentation) • [Database Schema](#-database-schema--prisma-models)

</div>

---

## 🎯 Problem Statement & Research Objectives

### The Three Barriers for Nigerian SMEs
Nigerian small and medium enterprises (specifically examined in Delta State and across regional commerce studies) face three compounding barriers when adopting digital commerce:
1. **Cost Structure of Branded Storefronts**: Independent storefront services (such as Shopify) require recurring fixed monthly subscriptions quoted in foreign currency (USD), creating a barrier for vendors with seasonal or irregular cash flows. Aggregated marketplaces (such as Jumia) remove monthly fees via transaction commissions but force vendors to trade under the platform's brand without independent identity.
2. **Payment Settlement Disconnect**: Stripe lists Nigeria as an extended-network market rather than a fully supported jurisdiction, making international-only gateways insufficient for local naira bank account payouts. Conversely, local gateways such as Paystack settle directly to Nigerian commercial banks but are less suited as the primary rail for international shoppers. A unified routing layer is required.
3. **Complex, Multi-Step Onboarding**: Traditional platforms require upfront payment credentials, domain setup, theme design, and complete catalog entry before a storefront is reachable, creating high initial friction.

### Project Objectives
- **Objective i (Architecture Design)**: Design a multi-tenant platform architecture featuring a subdomain routing model, a shared-table schema with application-enforced tenant isolation, and a unified payment routing engine.
- **Objective ii (Multi-Tenant Engine & Staged Onboarding)**: Implement edge middleware subdomain tenant resolution and a staged onboarding flow that makes a storefront reachable immediately after account and shop registration.
- **Objective iii (Storefront Customization)**: Build a visual configuration interface allowing vendors to customize store name, logo, banner, and color themes without writing code.
- **Objective iv (Dual-Gateway Integration)**: Implement a payment routing layer selecting between Stripe Connect and Paystack according to shop configuration, deducting a **2.5% platform commission** at transaction time.
- **Objective v (Vendor Analytics)**: Develop a vendor dashboard displaying revenue, order counts, top products, and low-stock alerts scoped strictly to the requesting merchant's records.

---

## 🏛️ Architecture & System Design

ShopSphere is organized into a **Three-Tier Layered Architecture** deployed on Vercel's serverless infrastructure with managed Neon PostgreSQL and Cloudflare R2 object storage:

```mermaid
flowchart TD
    subgraph ClientLayer ["1. Presentation Layer (Browsers)"]
        Customer["Customer Browser (Subdomain Storefront)"]
        Vendor["Vendor Browser (Admin Dashboard / Settings)"]
    end

    subgraph EdgeLayer ["2. Application Layer: Edge & Routing"]
        EdgeMW["Next.js Edge Middleware (src/middleware.ts)"]
        SubdomainCheck{"Host split count >= 3\nand subdomain != 'www'|'app'?"}
        RewriteRoute["Rewrite request to /shops/[domain]/*"]
        DirectRoute["Pass through (Root / Platform routes)"]
    end

    subgraph BusinessLayer ["2. Application Layer: Business Logic & API"]
        RSC["React Server Components (RSC SSR)"]
        RouteHandlers["API Route Handlers (wrapped in errorHandler)"]
        ServiceLayer["Service Layer:\nShopService • ProductService • OrderService\nCartService • PaymentService • StatsService"]
        AuthModule["NextAuth v5 (stateless JWT in HttpOnly cookies)"]
        AuthorizeUser["authorizeUser() (enforces ownership & session)"]
    end

    subgraph DataLayer ["3. Data Layer: Storage & Gateways"]
        PrismaAdapter["Prisma ORM 7 (@prisma/adapter-pg via pg driver)"]
        NeonDB[("Neon PostgreSQL Database\n(8 Core Shared Tables)")]
        R2Storage["Cloudflare R2 (S3 Client presigned PUT URLs)"]
        StripeAPI["Stripe API & Webhook (Express Connect Destination Charges)"]
        PaystackAPI["Paystack API & Webhook (Subaccount Split Payments)"]
    end

    Customer --> EdgeMW
    Vendor --> EdgeMW
    EdgeMW --> SubdomainCheck
    SubdomainCheck -->|Yes| RewriteRoute --> RSC
    SubdomainCheck -->|No| DirectRoute --> RSC

    RSC --> RouteHandlers
    RouteHandlers --> ServiceLayer
    ServiceLayer --> AuthorizeUser --> AuthModule
    ServiceLayer --> PrismaAdapter --> NeonDB
    ServiceLayer -->|Presigned URL| R2Storage
    ServiceLayer -->|Routing Priority| StripeAPI
    ServiceLayer -->|Routing Priority| PaystackAPI
    StripeAPI -.->|HMAC Signature Webhook| RouteHandlers
    PaystackAPI -.->|HMAC Signature Webhook| RouteHandlers
```

### Request Resolution & Multi-Tenancy Flow
1. **Subdomain Resolution**: A visitor navigating to `myshop.shopsphere.world` triggers `src/middleware.ts`. The middleware splits the hostname; if it has 3 or more segments and is not `www` or `app`, it extracts the subdomain (`myshop`) and rewrites the request internally to `/shops/myshop/*`.
2. **Data Isolation Strategy**: ShopSphere employs **Shared-Schema Multi-Tenancy with Application-Enforced Isolation**. All tenants share the same PostgreSQL database tables. Every tenant-owned table (`categories`, `products`, `carts`, `orders`) carries a `shop_id` foreign key referencing `shops.id`. Application services strictly inject `WHERE shop_id = ?` predicates based on the resolved subdomain. *(Note: PostgreSQL Row-Level Security is not implemented; isolation is maintained by the application layer).*
3. **Server-Side Storefront Rendering**: `src/app/shops/[domain]/layout.tsx` fetches the shop record, injects custom theme CSS variables into the root style element, and passes shop context down to child components.

---

## ✨ Core Functional Components

### 1. Dual-Gateway Payment Routing & Direct Settlement
ShopSphere does not act as a custodial wallet or hold merchant funds. Payouts and splits are executed natively by the respective gateway:
- **Routing Priority Rule**:
  - If the shop has a connected Paystack subaccount (`paystack_account_id` is not null), the platform routes payments to **Paystack**.
  - If no Paystack subaccount is connected, the platform routes payments to **Stripe Connect**.
- **Automated 2.5% Commission Deduction**:
  - **Paystack Subaccounts**: The subaccount is initialized with a `percentage_charge: 2.5`. At the point of charge, Paystack automatically deposits 97.5% (less payment processing fees) directly into the vendor's registered Nigerian bank account according to Paystack's settlement schedule, and routes 2.5% to the platform account.
  - **Stripe Connect**: Express connected accounts use destination charges with `application_fee_amount` set to 2.5% of the gross order total. The net balance transfers to the connected vendor account, while the fee remains in the platform account.

### 2. Transactional & Idempotent Webhook Processing
Payment confirmation relies on webhooks signed by the gateways:
- **Stripe**: Signatures verified using the Stripe SDK with `STRIPE_WEBHOOK_SECRET`.
- **Paystack**: Signatures verified by computing HMAC-SHA512 on the raw request body and comparing it to `x-paystack-signature`.
- **Atomic Execution**: On receiving a verified webhook event, a database transaction is opened:
  1. Checks if `event_id` exists in `stripeEvents` or `paystackEvents`.
  2. If present, the transaction aborts immediately and returns HTTP 200, guaranteeing **idempotency** against gateway retries.
  3. If new, the event record is inserted, the order status transitions from `pending` to `processing`, product `stock_quantity` is decremented, and `sales_count` is incremented. If any step fails, the entire transaction rolls back.

### 3. Staged Vendor Onboarding
To minimize technical barriers at registration:
- **Stage 1 (User Registration)**: Vendor submits username, email, phone number, address, and password (hashed with `bcrypt`). Inline client-side validation is enforced by Zod.
- **Stage 2 (Shop Creation)**: Vendor submits shop name, desired subdomain slug (with real-time 300ms debounced availability checking via `/api/shops/check-domain`), description, and currency (defaults to `USD` or `NGN`). A Stripe Express connected account is provisioned in the background.
- **Reachable Storefront**: Immediately upon completing Stage 2, the vendor's storefront becomes live and reachable at `[slug].shopsphere.world`.
- **Deferred Configuration**: Logo upload, theme selection, Paystack bank details, and product catalog entry are presented as optional post-registration tasks on the onboarding dashboard.

### 4. No-Code Theme Customizer
- **Visual Interface**: In `/shops/[domain]/admin/settings`, vendors can set independent color palettes for light and dark modes (primary, secondary, background, text, accent, card, border, success, warning, destructive).
- **Storage & Injection**: Themes are stored as structured JSON objects in `shops.light_theme` and `shops.dark_theme`. When the storefront renders, `[domain]/layout.tsx` converts these values into CSS custom properties (`--primary`, `--background`, etc.) targeting the `:root` selector.
- **Scope**: Scope is deliberately bounded to color themes, store name, logo, and banner; it does not support arbitrary layout restructuring or typography script editing.

### 5. Product Management & Cloudflare R2 Uploads
- **Direct S3 Upload Pipeline**: Media files are validated on the client (`validatePhoto`: JPEG, PNG, WebP, GIF under 10MB). The client requests a presigned PUT URL from `/api/upload-url`, and uploads directly to Cloudflare R2 via `@aws-sdk/client-s3`, avoiding serverless payload bottlenecks.
- **Variants & Denormalization**: Product variants (size, color, custom attributes) are stored as JSON arrays in `products.variants`. Category IDs are stored as an integer array `category_ids` on the product record.
- **Immutable Order Snapshots**: When an order is placed, line items (including variant choices, unit purchase prices, and active discounts) and the shipping address are frozen as JSON snapshots in `orders.items` and `orders.shipping_address`, ensuring historical accuracy regardless of subsequent product edits.

### 6. Vendor Analytics Dashboard
- Server-rendered dashboard calling `StatsService.getDashboardStats(shop.id)` using shop-scoped queries.
- Displays Total Revenue (sum of `final_amount`), Total Orders, Total Unique Customers, and Low-Stock Alert Counts (`stock_quantity <= 10`).
- Recharts-powered 30-day rolling revenue area chart and order status breakdown.

---

## 🧪 System Evaluation & Verification Record

The system was evaluated in both a local development environment and a live production deployment at `shopsphere.world` using sandbox credentials (Stripe test mode and Paystack sandbox keys). No live funds were processed during the study.

### Functional Test Results (Table 4.2 in Report)

| ID | Test Requirement | Precondition | Input / Action | Expected Result | Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **T01** | Tenant Isolation | Shops A & B exist with orders | User A attempts to view Order B by tracking ID | HTTP 404 Not Found | Returned HTTP 404 Order Not Found page | **Pass** |
| **T02** | Webhook Idempotency | Event previously processed | Replay same webhook `event_id` | HTTP 200; no duplicate order or stock updates | Duplicate delivery exited cleanly; no duplicate order state update or stock deduction | **Pass** |
| **T03** | Gateway Routing | 2 shops: one with Paystack subaccount (NGN), one without (USD) | Initiate checkout on each storefront | Paystack URL for NGN shop; Stripe Checkout session for USD shop | NGN shop redirected to Paystack hosted page; USD shop redirected to Stripe Checkout | **Pass** |
| **T04** | Subdomain Resolution | Tenant shop exists in database | Navigate to `[tenant].shopsphere.world` | Corresponding storefront renders | Tenant storefront loaded with correct branding | **Pass** |
| **T05** | Unknown Subdomain | Subdomain not in database | Navigate to unallocated subdomain | Not-Found response | Returns HTTP 404 tenant not-found page | **Pass** |
| **T06** | Commission Split at Payment | 1 Stripe shop, 1 Paystack shop with 2.5% commission | Complete sandbox checkout on each gateway | Platform commission and vendor share match 2.5% rate | **Paystack**: ₦25,000 total → ₦625 platform commission (2.5%), ₦475 gateway fee, ₦23,900 vendor share.<br>**Stripe**: ₦76,500 total ($54.89 USD) → ₦1,912.50 commission (2.5%), $3.81 Stripe fee. | **Pass** |
| **T07** | Theme Save and Render | Vendor signed in; shop active | Modify colors in theme panel, save, reload storefront | Theme persisted to database and rendered via CSS properties on next load | Storefront updated immediately without redeployment | **Pass** |
| **T08** | Analytics Figures | Shop has completed sandbox orders | Open vendor admin dashboard | Metrics computed solely from shop's own records | Stats and chart figures matched shop orders; zero cross-tenant data visible | **Pass** |

### Cross-Tenant Access Verification (Table 4.3 in Report)

To verify application-enforced tenant separation, an authenticated session belonging to the owner of Shop A was used in attempted read and write operations against resources belonging to Shop B:

| Target Resource | Attempted Action against Shop B | Expected HTTP Status | Actual Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Orders** | Read order list / read single order by tracking ID | `403` / `404` | Order list returned `403`; tracking ID query returned `404` | **Pass** |
| **Orders** | Change status or cancel order | `403` | Status update rejected with `403 Forbidden` | **Pass** |
| **Products** | Fetch admin product list; edit or delete product | `403` or `404` | Admin list returned `403`; edit/delete returned `403`; no changes made | **Pass** |
| **Categories** | Edit or delete category | `403` or `404` | Rejected with `403 Forbidden`; no changes made | **Pass** |
| **Shop Settings** | Read/modify theme, contact details, or payment rails | `403` | Read returned `403`; update rejected with `403`; no changes made | **Pass** |
| **Analytics** | Read dashboard statistics | `403` | Request rejected with `403`; no data returned | **Pass** |
| **Cart** | Read or alter cart of another shop | Scoped to own cart | Operations strictly affected user's own cart for that shop | **Pass** |
| **Any Admin Route**| Request made without active session | `401` | Request returned `401 Unauthorized` | **Pass** |

---

## ⚠️ Documented Limitations & Engineering Constraints

As detailed in Chapter 5 of the thesis report, the current implementation has specific, documented boundaries and engineering trade-offs:

1. **Inventory Concurrency Control**:
   - Stock availability is verified when an order record is created at checkout, but inventory is decremented only when the payment confirmation webhook arrives.
   - Consequently, under concurrent checkouts for the final inventory unit of a product, race conditions can occur where multiple orders are initiated before webhook confirmation. Implementing a time-limited stock reservation system is recommended for future iterations.
2. **Pending Order Reconciliation**:
   - No scheduled background worker or cron job is currently implemented to reconcile pending orders against Stripe or Paystack APIs.
   - If an incoming webhook event is permanently lost, or if a customer abandons payment on the gateway hosted page, the order remains indefinitely in `pending` status.
3. **Settlement Failure Visibility**:
   - Paystack subaccount settlement to a vendor's bank account is handled asynchronously by Paystack. If a bank settlement fails, notification is visible through Paystack's dashboard and requires manual follow-up; ShopSphere does not poll the Paystack settlements API to automate remediation.
4. **Application-Level vs. Database-Level Isolation**:
   - Tenant isolation relies strictly on application code in the service layer consistently appending `shop_id` filters. **PostgreSQL Row-Level Security (RLS) is not implemented** in this version.
5. **Security & Rate Limiting**:
   - API endpoints (`/api/auth/*` and `/api/shops/[domain]/orders`) currently lack automated rate limiting against high-frequency brute-force or flooding requests.
   - User sessions use stateless JWTs stored in HttpOnly cookies and cannot be individually invalidated prior to expiration.
   - Monetary values in the database are stored as floating-point numbers (`Float`) rather than fixed-point integer cents/kobo.
6. **Usability & Load Testing Boundaries**:
   - The staged onboarding workflow was confirmed functional, but its impact on merchant conversion and drop-off rates was not evaluated through a structured usability study with external participants.
   - Testing was conducted using sandbox test credentials; behavior under sustained production load was not empirically measured.
7. **Omitted Convenience Features**:
   - Transactional email dispatch (e.g. order confirmation receipts via SendGrid/Resend) is not implemented; order confirmation is displayed via the web interface.
   - Full-text search on product catalogs and multi-language localization are omitted from the initial scope.

---

## 🛠️ Implementation Tools & Dependencies

| Component | Library / Package | Version | Justification & Architectural Role |
| :--- | :--- | :--- | :--- |
| **Framework** | `next` | `15.3.8` | Next.js App Router, React Server Components (RSC), Edge Middleware URL rewriting |
| **UI Library** | `react`, `react-dom` | `19.0.0` | React 19 component model |
| **Language** | `typescript` | `5.x` | Static end-to-end typing from Zod schemas through Prisma queries to React props |
| **ORM** | `@prisma/client`, `prisma` | `7.8.0` / `7.5.0` | Type-safe database queries; client singleton prevents hot-reload connection leaks |
| **PG Adapter** | `@prisma/adapter-pg`, `pg` | `7.5.0` / `8.20.0` | Connects Prisma directly to PostgreSQL via node-postgres driver |
| **Authentication**| `next-auth` | `5.0.0-beta.25` | Auth.js credentials provider with stateless JWT session management |
| **Cryptography** | `bcrypt` | `6.0.0` | Password hashing for user authentication |
| **Payment (Global)**| `stripe` | `20.1.0` | Stripe Node.js SDK for Express Connect accounts and Checkout sessions |
| **Payment (Regional)**| `paystack-sdk` | `3.6.1` | Paystack SDK for bank verification, subaccount provisioning, and split payments |
| **Object Storage**| `@aws-sdk/client-s3` | `3.1039.0` | AWS S3 client pointed at Cloudflare R2 endpoint |
| **Presigned URLs**| `@aws-sdk/s3-request-presigner` | `3.1039.0` | Generates short-lived presigned PUT URLs for direct client media uploads |
| **State Management**| `@reduxjs/toolkit`, `react-redux`| `2.8.2` / `9.2.0` | Redux store managing cart state, shop metadata, and category filters |
| **Forms & Validation**| `react-hook-form`, `zod` | `7.67.0` / `3.25.76` | Form state management and schema validation via `@hookform/resolvers` |
| **Styling** | `tailwindcss`, `postcss` | `4.1.17` / `8.5.6` | Tailwind CSS v4 engine with `@tailwindcss/postcss` and `tw-animate-css` |
| **Data Visualization**| `recharts` | `3.1.2` | Composable SVG line/area charts for merchant dashboard analytics |
| **Notifications** | `sonner` | `2.0.7` | Client-side toast notifications |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.18.0 or newer (v20+ recommended)
- **PostgreSQL**: PostgreSQL 14+ instance (or a [Neon Serverless Postgres](https://neon.tech/) connection)
- **Cloudflare Account**: Active Cloudflare R2 bucket
- **Stripe Account**: Configured in test mode with Connect enabled
- **Paystack Account**: Configured in test mode with Subaccounts enabled

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Fortunejite/ShopSphere.git
cd ShopSphere

# Install dependencies (runs prisma migrate deploy && prisma generate via postinstall)
npm install
```

### 3. Environment Setup
Create a `.env` file in the project root:
```env
# Authentication
AUTH_SECRET="your_nextauth_secret_key"
AUTH_TRUST_HOST=true

# Multi-Tenant Domain Configuration
# Development: sphere.localhost:3000
# Production: shopsphere.world
NEXT_PUBLIC_ROOT_DOMAIN="sphere.localhost:3000"

# Database Connection
DATABASE_CONNECTION_STRING="postgresql://username:password@localhost:5432/shopsphere?sslmode=prefer"

# Cloudflare R2 Storage
CLOUDFLARE_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESSKEY_ID="your_r2_access_key_id"
R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
R2_BUCKET_NAME="shopsphere"
NEXT_PUBLIC_R2_PUBLIC_URL="https://pub-yourbucketid.r2.dev"

# Payment Gateways (Test Mode)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PAYSTACK_SECRET_KEY="sk_test_..."
```

### 4. Database Setup & Migrations
```bash
# Apply migrations to your database
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

*(Optional)* Launch Prisma Studio to inspect records:
```bash
npx prisma studio
```

### 5. Local Subdomain Configuration
ShopSphere routes tenants via subdomains (e.g., `mystore.sphere.localhost:3000`).
- **Modern Chromium Browsers**: Chromium resolves `*.localhost` to `127.0.0.1` automatically.
- **Hosts File Mapping** (if required by your environment):
  Add to `C:\Windows\System32\drivers\etc\hosts` (Windows) or `/etc/hosts` (macOS/Linux):
  ```text
  127.0.0.1 sphere.localhost
  127.0.0.1 demo.sphere.localhost
  127.0.0.1 store.sphere.localhost
  ```

### 6. Run the Application
```bash
npm run dev
```
Navigate to [http://sphere.localhost:3000](http://sphere.localhost:3000).

---

## 📚 Complete API Documentation

All routes reside under `/api` and are wrapped in the centralized `errorHandler` function.

### Authentication & User Profile
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Registers a user account; hashes password with `bcrypt` |
| `GET`/`POST` | `/api/auth/[...nextauth]` | Public | Auth.js credential authentication, session tokens, and signout |
| `GET` | `/api/profile` | Authenticated | Retrieves current authenticated user record |
| `PUT` | `/api/profile` | Authenticated | Updates user username, phone number, and address |

### Platform & Shop Management
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shops` | Public / User | Retrieves list of shops (filtered to owner if authenticated) |
| `POST` | `/api/shops` | Authenticated | Creates a new shop and provisions Stripe Express connected account |
| `GET` | `/api/shops/check-domain?domain={slug}` | Public | Debounced validation checking if a subdomain slug is available |
| `GET` | `/api/shops/[domain]` | Public | Retrieves public shop record, logo, and active color themes |
| `PUT` | `/api/shops/[domain]` | Shop Owner | Updates shop metadata, branding, and light/dark theme JSON |

### Storefront Catalog & Categories
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shops/[domain]/products` | Public | Paginated product listing with category, search, and price filters |
| `POST` | `/api/shops/[domain]/products` | Shop Owner | Creates product with variants, dimensions, and image URLs |
| `GET` | `/api/shops/[domain]/products/[slug]` | Public | Retrieves individual product by shop-scoped slug |
| `PUT` | `/api/shops/[domain]/products/[slug]` | Shop Owner | Updates product record, price, status, or stock |
| `DELETE` | `/api/shops/[domain]/products/[slug]` | Shop Owner | Deletes product record |
| `GET` | `/api/shops/[domain]/categories` | Public | Lists categories for this specific shop |
| `POST` | `/api/shops/[domain]/categories` | Shop Owner | Creates category record |
| `GET` | `/api/shops/[domain]/categories/[id]` | Public | Gets category details |
| `PUT` | `/api/shops/[domain]/categories/[id]` | Shop Owner | Updates category name and slug |
| `DELETE` | `/api/shops/[domain]/categories/[id]` | Shop Owner | Deletes category |

### Cart Management & Synchronization
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shops/[domain]/cart` | Authenticated | Fetches user's cart enriched with live product and pricing data |
| `POST` | `/api/shops/[domain]/cart` | Authenticated | Adds item or increments quantity in database cart |
| `PUT` | `/api/shops/[domain]/cart` | Authenticated | Updates quantity or selected variant index |
| `DELETE` | `/api/shops/[domain]/cart` | Authenticated | Removes item or clears user cart |
| `POST` | `/api/shops/[domain]/cart/merge` | Authenticated | Synchronizes guest localStorage cart items into database cart on login |

### Orders & Payment Routing
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shops/[domain]/orders` | Authenticated | Lists customer orders placed within this specific shop |
| `POST` | `/api/shops/[domain]/orders` | Authenticated | Creates pending order with price snapshot; returns gateway checkout URL |
| `GET` | `/api/shops/[domain]/orders/[trackingId]` | Customer / Owner | Retrieves order status timeline and line items snapshot |
| `POST` | `/api/shops/[domain]/orders/[trackingId]/pay` | Authenticated | Re-initiates checkout link for an unpaid pending order |

### Gateway Onboarding & Banking Rails
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/shops/[domain]/stripe/genetate-acount-link` | Shop Owner | Generates Stripe Connect hosted onboarding link |
| `GET` | `/api/shops/[domain]/paystack/banks` | Shop Owner | Fetches verified list of commercial banks from Paystack API |
| `POST` | `/api/shops/[domain]/paystack/sub-account` | Shop Owner | Provisions Paystack subaccount with 2.5% split charge |
| `PUT` | `/api/shops/[domain]/paystack/sub-account` | Shop Owner | Updates subaccount settlement bank details |
| `GET` | `/api/shops/[domain]/admin/paystack/settlements` | Shop Owner | Retrieves payout settlement history and net amounts from Paystack |

### Vendor Administration & Analytics
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shops/[domain]/admin/dashboard/stats` | Shop Owner | Returns shop-scoped KPIs (Revenue, Orders, Customers, Low-stock) |
| `GET` | `/api/shops/[domain]/admin/dashboard/revenue-chart` | Shop Owner | Timeseries revenue data for Recharts area chart |
| `GET` | `/api/shops/[domain]/admin/dashboard/order-status` | Shop Owner | Order status distribution counts |
| `GET` | `/api/shops/[domain]/admin/dashboard/top-products` | Shop Owner | Top 5 best-performing products by sales count |
| `GET` | `/api/shops/[domain]/admin/dashboard/recent-orders` | Shop Owner | Ten most recent orders with status badges |
| `GET` | `/api/shops/[domain]/admin/orders` | Shop Owner | Paginated order management list |
| `GET` | `/api/shops/[domain]/admin/orders/[trackingId]` | Shop Owner | Full order detail view with snapshot data |
| `PUT` | `/api/shops/[domain]/admin/orders/[trackingId]` | Shop Owner | Updates order status (`processing`, `shipped`, `delivered`, `cancelled`) |

### Media Uploads (Cloudflare R2)
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/upload-url` | Authenticated | Generates short-lived (5-min) S3 presigned PUT URL for direct R2 upload |
| `DELETE` | `/api/upload-url?key={key}` | Authenticated | Deletes specified object key from Cloudflare R2 bucket |

### Webhook Receivers
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/webhook/stripe` | Stripe Signature | Processes `checkout.session.completed` and `account.updated` |
| `POST` | `/api/webhook/paystack` | Paystack Signature | Processes `charge.success` with HMAC-SHA512 verification |

---

## 🗄️ Database Schema & Prisma Models

Defined in [`prisma/schema.prisma`](prisma/schema.prisma), the schema features eight core tables:

```mermaid
erDiagram
    users ||--o{ shops : "owns"
    users ||--o{ carts : "owns"
    users ||--o{ orders : "places"
    shops ||--o{ categories : "contains"
    shops ||--o{ products : "contains"
    shops ||--o{ carts : "scopes"
    shops ||--o{ orders : "receives"

    users {
        int id PK
        string email UK
        string username UK
        string phone_number
        string password_hash
        UserRole role
        string address
        datetime created_at
        datetime updated_at
    }

    shops {
        int id PK
        int owner_id FK
        string domain UK
        string name
        string description
        string tagline
        ShopStatus status
        string email
        string phone
        string address
        string currency
        string logo
        string banner
        string stripe_account_id UK
        boolean stripe_account_connected
        string paystack_account_id UK
        boolean paystack_account_connected
        json light_theme
        json dark_theme
        datetime created_at
        datetime updated_at
    }

    categories {
        int id PK
        string name UK
        string slug UK
        int shop_id FK
        datetime created_at
        datetime updated_at
    }

    products {
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
        boolean is_featured
        float weight
        float length
        float width
        float height
        int stock_quantity
        ProductStatus status
        int sales_count
        datetime created_at
        datetime updated_at
    }

    carts {
        int id PK
        int user_id FK
        int shop_id FK
        json items
        datetime created_at
        datetime updated_at
    }

    orders {
        int id PK
        int user_id FK
        int shop_id FK
        string tracking_id UK
        float total_amount
        float discount_amount
        float tax_amount
        float shipping_amount
        float final_amount
        json items
        OrderStatus status
        string payment_reference
        json shipping_address
        string notes
        string admin_notes
        datetime shipped_at
        datetime delivered_at
        datetime cancelled_at
        datetime created_at
        datetime updated_at
    }

    stripe_events {
        string event_id PK
        string event_type
        json payload
        datetime received_at
    }

    paystack_event {
        string event_id PK
        string event_type
        json payload
        datetime received_at
    }
```

---

## 🚢 Deployment & Production Setup

ShopSphere is designed for a cloud-managed, serverless infrastructure deployment. The production architecture evaluated in the thesis comprises **Vercel** for compute and edge routing, a **Neon PostgreSQL** managed instance for relational data, and **Cloudflare R2** for object storage.

### 1. Vercel Wildcard DNS & SSL Configuration

Serving distinct tenant storefronts from dynamic subdomains (e.g., `vendor.shopsphere.world`) without requiring manual DNS configuration per registration requires wildcard DNS and certificate automation.

1. **Point Nameservers to Vercel**:
   - In your domain registrar (e.g., Namecheap, Cloudflare Registrar), delegate DNS authority by setting your domain nameservers to:
     ```text
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```
2. **Add Domains to Vercel Project**:
   - Under **Project Settings $\rightarrow$ Domains**, add:
     - `shopsphere.world` (Apex domain)
     - `*.shopsphere.world` (Wildcard subdomain)
3. **Automated DNS-01 Challenge**:
   - Because Vercel manages the nameservers, it automatically answers the Let's Encrypt DNS-01 challenge and issues a single wildcard SSL certificate covering all first-level subdomains.
   - The edge middleware (`src/middleware.ts`) inspects the host header on incoming requests and rewrites `[subdomain].shopsphere.world/path` to `/shops/[subdomain]/path`.

---

### 2. Database Migration Pipeline (Neon PostgreSQL)

1. **Connection String**:
   - Create a database project in [Neon](https://neon.tech/).
   - Obtain the connection string with pooled connection and SSL enabled (`sslmode=require`).
   - Set the `DATABASE_CONNECTION_STRING` variable in your Vercel project environment settings.
2. **Automated Postinstall Hook**:
   - ShopSphere's [`package.json`](package.json) includes an automated postinstall script:
     ```json
     "postinstall": "prisma migrate deploy && prisma generate"
     ```
   - On every production deployment, Vercel executes this hook during the build step, automatically applying pending Prisma migrations to the Neon PostgreSQL instance and regenerating the Prisma client before bundling serverless functions.

---

### 3. Cloudflare R2 Media Storage & CORS Policy

To support direct client-to-R2 image uploads via presigned URLs and allow browser display without proxying:

1. **Create Bucket**:
   - In the Cloudflare Dashboard, navigate to **R2 $\rightarrow$ Create bucket** named `shopsphere`.
2. **Enable Public Access**:
   - Under **Settings $\rightarrow$ Public Access**, enable the `r2.dev` public subdomain or connect a custom domain (e.g., `pub-7ca8585d8b0b4fd49e0c07b4429275b7.r2.dev`).
   - Set this URL as `NEXT_PUBLIC_R2_PUBLIC_URL`.
3. **Create API Credentials**:
   - Under **R2 $\rightarrow$ Manage R2 API Tokens**, create a token with `Admin Read & Write` permissions.
   - Record the Account ID, Access Key ID, and Secret Access Key.
4. **CORS Configuration**:
   - Under your bucket's **Settings $\rightarrow$ CORS Policy**, add the following JSON policy to allow cross-origin `PUT` uploads from storefront subdomains:
     ```json
     [
       {
         "AllowedOrigins": [
           "https://shopsphere.world",
           "https://*.shopsphere.world",
           "http://localhost:3000",
           "http://*.localhost:3000"
         ],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
         "AllowedHeaders": ["*"],
         "ExposeHeaders": ["ETag"],
         "MaxAgeSeconds": 3600
       }
     ]
     ```

---

### 4. Gateway Webhook Configuration

Production webhook endpoints must be registered in the gateway dashboards to receive signed event payloads.

#### Stripe Dashboard
1. Navigate to **Developers $\rightarrow$ Webhooks $\rightarrow$ Add endpoint**.
2. **Endpoint URL**: `https://shopsphere.world/api/webhook/stripe`
3. **Events to Send**:
   - `checkout.session.completed`
   - `account.updated`
4. Copy the **Signing Secret** (`whsec_...`) and configure it as `STRIPE_WEBHOOK_SECRET` in Vercel.

#### Paystack Dashboard
1. Navigate to **Settings $\rightarrow$ Preferences $\rightarrow$ Webhook**.
2. **Live Webhook URL**: `https://shopsphere.world/api/webhook/paystack`
3. Paystack automatically signs all event payloads (`charge.success`) with your secret key using HMAC-SHA512. ShopSphere verifies this against the `x-paystack-signature` header using `PAYSTACK_SECRET_KEY`.

---

### 5. Production Environment Variables Checklist

Configure the following variables in the **Vercel Project Settings $\rightarrow$ Environment Variables**:

| Variable | Description | Example / Target |
| :--- | :--- | :--- |
| `AUTH_SECRET` | Secret key for Auth.js session encryption | `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | Trust Vercel proxy headers | `true` |
| `NEXT_PUBLIC_ROOT_DOMAIN` | Production root platform domain | `shopsphere.world` |
| `DATABASE_CONNECTION_STRING` | Neon PostgreSQL pooled connection URI | `postgresql://user:pass@ep-...pooler...neon.tech/dbname?sslmode=require` |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | `5e1162906111...` |
| `R2_ACCESSKEY_ID` | Cloudflare R2 access key ID | `afb9ff52d9...` |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret access key | `d5c4a1afcc...` |
| `R2_BUCKET_NAME` | Cloudflare R2 bucket name | `shopsphere` |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Public CDN URL for R2 objects | `https://pub-7ca8585d8b0b4fd49e0c07b4429275b7.r2.dev` |
| `STRIPE_SECRET_KEY` | Stripe secret API key | `sk_live_...` (or `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `PAYSTACK_SECRET_KEY` | Paystack secret API key | `sk_live_...` (or `sk_test_...`) |

---

## 📜 Available NPM Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `dev` | `next dev` | Runs the Next.js local development server |
| `build` | `next build` | Compiles the production build for deployment |
| `start` | `next start` | Runs the production server after compilation |
| `lint` | `next lint` | Executes ESLint 9 code quality and type checks |
| `postinstall` | `prisma migrate deploy && prisma generate` | Automatically migrates database and updates Prisma client |

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Department of Computer Science</strong><br>
  Federal University of Petroleum Resources, Effurun (FUPRE), Delta State, Nigeria<br>
  <em>Academic Year 2025/2026</em>
</div>
