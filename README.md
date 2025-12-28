# 🛍️ ShopSphere

A modern, full-stack multi-vendor e-commerce platform built with Next.js 15, TypeScript, and PostgreSQL. ShopSphere enables users to create their own online shops with custom domains, manage products, process orders with Stripe integration, and provide a seamless shopping experience with Firebase storage.

![Next.js](https://img.shields.io/badge/Next.js-15.3.8-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.17-06B6D4)
![Stripe](https://img.shields.io/badge/Stripe-20.1.0-635BFF)
![Firebase](https://img.shields.io/badge/Firebase-12.7.0-FFCA28)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🏪 Multi-Vendor Support
- **Custom Shop Creation**: Users can create their own shops with unique domains
- **Shop Management**: Complete shop customization with Stripe Connect integration
- **Domain Routing**: Each shop gets its own domain routing (e.g., `myshop.localhost:3000`)
- **Admin Dashboard**: Comprehensive dashboard with analytics and management tools

### 🛒 E-commerce Core
- **Product Management**: Full CRUD operations with variants, categories, and inventory tracking
- **Shopping Cart**: Redux-powered cart with persistent state and local storage
- **Order Processing**: Complete order management with status tracking
- **Payment Integration**: Stripe Connect for secure payment processing
- **Inventory Management**: Real-time stock tracking with low-stock alerts

### 🎨 Modern UI/UX
- **Shadcn/UI Design**: Clean, responsive interface using Shadcn/UI components
- **Tailwind CSS**: Utility-first CSS framework with custom styling
- **Mobile-First**: Fully responsive design optimized for all devices
- **Product Gallery**: High-quality image displays with Firebase Storage
- **Loading States**: Skeleton loaders and progressive loading

### 🔐 Authentication & Security
- **NextAuth.js v5**: Secure authentication with credentials provider
- **User Management**: Registration, login, and profile management
- **Protected Routes**: Middleware-based route protection with role-based access
- **Password Security**: Bcrypt hashing for secure password storage

### 📦 Advanced Features
- **Product Variants**: Support for size, color, and custom attributes with JSON storage
- **Categories & Filtering**: Hierarchical categories with advanced search capabilities
- **Firebase Storage**: Cloud storage for product images and media
- **Stripe Integration**: Complete payment processing with webhooks
- **Analytics Dashboard**: Business insights with performance metrics
- **Order Tracking**: Real-time order status updates

### 🛠️ Developer Experience
- **TypeScript**: Full type safety throughout the application
- **PostgreSQL**: Robust relational database with advanced indexing
- **API Routes**: RESTful API with Next.js 15 App Router
- **Redux Toolkit**: State management for complex UI interactions
- **Shadcn/UI**: Modern component library with Radix UI primitives
- **Form Management**: React Hook Form with Zod validation
- **Error Handling**: Comprehensive error handling and validation
- **Code Organization**: Clean architecture with separation of concerns

## 🏗️ Project Structure

```
shop_sphere_v2/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   ├── global.css               # Global styles with Tailwind
│   │   ├── login/                   # Authentication pages
│   │   ├── signup/
│   │   ├── shops/                   # Shop management
│   │   │   ├── page.tsx             # Shop listing
│   │   │   ├── new/                 # Create new shop
│   │   │   └── [domain]/            # Individual shop routes
│   │   │       ├── layout.tsx       # Shop-specific layout
│   │   │       ├── page.tsx         # Shop homepage
│   │   │       ├── admin/           # Shop admin dashboard
│   │   │       │   ├── page.tsx     # Dashboard overview
│   │   │       │   ├── layout.tsx   # Admin layout
│   │   │       │   ├── orders/      # Order management
│   │   │       │   ├── products/    # Product management
│   │   │       │   │   ├── page.tsx # Product listing
│   │   │       │   │   ├── new/     # Add new product
│   │   │       │   │   └── [slug]/  # Product details
│   │   │       │   ├── customers/   # Customer management
│   │   │       │   ├── analytics/   # Analytics dashboard
│   │   │       │   └── settings/    # Shop settings
│   │   │       ├── cart/            # Shopping cart
│   │   │       ├── checkout/        # Checkout process
│   │   │       ├── products/        # Product catalog
│   │   │       ├── orders/          # Order history
│   │   │       ├── login/           # Shop-specific login
│   │   │       └── signup/          # Shop-specific signup
│   │   └── api/                     # API endpoints
│   │       ├── auth/                # Authentication API
│   │       │   ├── [...nextauth]/   # NextAuth.js handler
│   │       │   └── register/        # User registration
│   │       ├── categories/          # Category management
│   │       ├── shops/               # Shop management API
│   │       │   ├── route.ts         # Shop CRUD operations
│   │       │   ├── [domain]/        # Domain-specific API
│   │       │   │   ├── route.ts     # Shop details
│   │       │   │   ├── admin/       # Admin API endpoints
│   │       │   │   ├── cart/        # Cart management
│   │       │   │   ├── orders/      # Order processing
│   │       │   │   ├── products/    # Product management
│   │       │   │   └── stripe/      # Stripe integration
│   │       │   └── check-domain/    # Domain validation
│   │       └── webhook/
│   │           └── stripe/          # Stripe webhooks
│   ├── components/                  # Reusable components
│   │   ├── ui/                      # Shadcn/UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── dialog.tsx
│   │   ├── Loading.tsx              # Loading components
│   │   ├── ShopNavbar.tsx           # Shop navigation
│   │   ├── ShopFooter.tsx           # Shop footer
│   │   ├── ProductCard.tsx          # Product display card
│   │   ├── OrderCard.tsx            # Order display card
│   │   ├── AdminDashboardSkeleton.tsx # Loading skeletons
│   │   └── productForm/             # Product form components
│   │       ├── ProductStepForm.tsx
│   │       ├── BasicInfoStep.tsx
│   │       ├── ImageStep.tsx
│   │       ├── PriceStep.tsx
│   │       ├── VariantStep.tsx
│   │       └── ShippingStep.tsx
│   ├── models/                      # Data models (PostgreSQL)
│   │   ├── BaseModel.ts             # Base model class
│   │   ├── User.ts                  # User model
│   │   ├── Shop.ts                  # Shop model
│   │   ├── Product.ts               # Product model
│   │   ├── Cart.ts                  # Cart model
│   │   ├── Category.ts              # Category model
│   │   ├── Order.ts                 # Order model
│   │   └── StripeEvents.ts          # Stripe events model
│   ├── redux/                       # State management
│   │   ├── store.ts                 # Redux store configuration
│   │   ├── cartSlice.ts             # Cart state management
│   │   ├── shopSlice.ts             # Shop state management
│   │   └── categorySlice.ts         # Category state management
│   ├── lib/                         # Utilities and configurations
│   │   ├── db.ts                    # PostgreSQL connection
│   │   ├── utils.ts                 # Utility functions
│   │   ├── currency.ts              # Currency formatting
│   │   ├── domain.ts                # Domain utilities
│   │   ├── errorHandler.ts          # Error handling
│   │   ├── localCart.ts             # Local cart management
│   │   ├── shop.ts                  # Shop utilities
│   │   ├── uploadPhoto.ts           # Firebase image upload
│   │   ├── apiAuth.ts               # API authentication
│   │   ├── inventory/               # Inventory management
│   │   │   ├── index.ts
│   │   │   ├── products.ts
│   │   │   ├── order.ts
│   │   │   └── types.ts
│   │   └── schema/                  # Zod validation schemas
│   │       ├── auth.ts              # Authentication schemas
│   │       ├── cart.ts              # Cart validation
│   │       ├── order.ts             # Order validation
│   │       ├── product.ts           # Product validation
│   │       └── shop.ts              # Shop validation
│   ├── services/                    # External services
│   │   ├── firebase/                # Firebase configuration
│   │   │   ├── index.ts             # Firebase app initialization
│   │   │   └── storage.ts           # Firebase Storage service
│   │   └── stripe/                  # Stripe integration
│   │       ├── index.ts             # Stripe client
│   │       ├── account.ts           # Stripe Connect accounts
│   │       ├── checkout.ts          # Checkout sessions
│   │       ├── utils.ts             # Stripe utilities
│   │       └── constants.ts         # Stripe constants
│   ├── hooks/                       # Custom React hooks
│   │   ├── redux.hook.ts            # Redux typed hooks
│   │   └── useAuthWithCartMerge.ts  # Auth with cart merge
│   ├── auth.ts                      # NextAuth.js configuration
│   └── middleware.ts                # Next.js middleware for routing
├── database/                        # Database files
│   ├── schema.sql                   # PostgreSQL schema
│   └── seed.sql                     # Seed data
├── types/                           # TypeScript type definitions
│   ├── next-auth.d.ts               # NextAuth.js types
│   └── params.d.ts                  # Route parameters
├── public/                          # Static assets
│   ├── placeholder.png              # Default images
│   ├── authPic.png                  # Authentication assets
│   └── *.svg                        # SVG icons
├── components.json                  # Shadcn/UI configuration
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── postcss.config.mjs               # PostCSS configuration
├── eslint.config.mjs                # ESLint configuration
├── next.config.ts                   # Next.js configuration
└── next-env.d.ts                    # Next.js type definitions
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database (v12 or higher)
- **Firebase** account (for image storage)
- **Stripe** account (for payment processing)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/shop_sphere_v2.git
   cd shop_sphere_v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/shop_sphere
   
   # NextAuth
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   
   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Firebase (for image storage)
   FIREBASE_API_KEY=your-firebase-api-key
   
   # Stripe (for payments)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb shop_sphere
   
   # Run the schema
   psql -d shop_sphere -f database/schema.sql
   
   # Optional: Run seed data
   psql -d shop_sphere -f database/seed.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 API Documentation

### Authentication API

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword",
  "phone_number": "+1234567890",
  "address": "123 Main St",
  "city": "New York"
}
```

### Shops API

#### Get Shops
```http
GET /api/shops
```

#### Get Shop by Domain
```http
GET /api/shops/[domain]
```

#### Create Shop
```http
POST /api/shops
```

**Request Body:**
```json
{
  "domain": "myshop",
  "name": "My Shop",
  "description": "A great shop selling amazing products",
  "tagline": "Quality products for everyone",
  "category_id": 1,
  "email": "shop@example.com",
  "phone": "+1234567890",
  "address": "456 Shop St",
  "city": "Shop City",
  "state": "Shop State",
  "postal_code": "12345",
  "country": "Shop Country",
  "currency": "USD"
}
```

### Products API

#### Get Shop Products
```http
GET /api/shops/[domain]/products
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by product name
- `category` - Filter by category ID
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `status` - Filter by status (active, inactive, out_of_stock)
- `sortBy` - Sort field (name, price, created_at, sales_count)
- `sortOrder` - Sort direction (asc, desc)

#### Get Single Product
```http
GET /api/shops/[domain]/products/[slug]
```

#### Create Product (Admin)
```http
POST /api/shops/[domain]/admin/products
```

**Request Body:**
```json
{
  "name": "Amazing Product",
  "description": "This is an amazing product",
  "price": 99.99,
  "discount": 10,
  "stock_quantity": 100,
  "category_ids": [1, 2],
  "variants": [
    {
      "attributes": {
        "size": "Large",
        "color": "Blue"
      },
      "is_default": true
    }
  ],
  "weight": 1.5,
  "length": 10,
  "width": 8,
  "height": 5,
  "image": "https://example.com/image.jpg",
  "thumbnails": ["https://example.com/thumb1.jpg"]
}
```

### Cart API

#### Get Cart
```http
GET /api/shops/[domain]/cart
```

#### Add to Cart
```http
POST /api/shops/[domain]/cart
```

**Request Body:**
```json
{
  "product_id": 123,
  "quantity": 2,
  "variant_attributes": {
    "size": "Large",
    "color": "Blue"
  }
}
```

#### Update Cart Item
```http
PUT /api/shops/[domain]/cart/[item_id]
```

#### Remove from Cart
```http
DELETE /api/shops/[domain]/cart/[item_id]
```

### Orders API

#### Get Orders (Admin)
```http
GET /api/shops/[domain]/admin/orders
```

#### Get Single Order
```http
GET /api/shops/[domain]/orders/[tracking_id]
```

#### Create Order
```http
POST /api/shops/[domain]/orders
```

### Categories API

#### Get Categories
```http
GET /api/categories
```

#### Get Category Tree
```http
GET /api/categories?tree=true
```

## 🎨 Theming and Customization

ShopSphere uses Shadcn/UI with Tailwind CSS for modern, customizable styling:

### Shadcn/UI Configuration

```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/global.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide"
}
```

### Tailwind CSS Configuration

```css
/* src/app/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
  }
}
```

### Custom Components

The project includes custom styled components:

- **ProductCard**: Responsive product display with hover effects
- **ShopNavbar**: Shop-specific navigation with mobile support
- **AdminDashboard**: Modern dashboard with glassmorphism effects
- **Loading Components**: Skeleton loaders and spinner components

## 🔧 Configuration

### ESLint Configuration

```javascript
// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Next.js Configuration

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
};

export default nextConfig;
```

### PostgreSQL Database Schema

The database uses PostgreSQL with the following key tables:

- **users**: User accounts and authentication
- **shops**: Multi-vendor shop information
- **categories**: Hierarchical product categories
- **products**: Product catalog with variants
- **carts**: Shopping cart management
- **orders**: Order processing and tracking
- **stripe_events**: Stripe webhook event logging

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── __tests__/
│   ├── components/
│   ├── pages/
│   └── api/
├── __mocks__/
└── setup.js
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Environment Variables**
   Add your environment variables in the Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 📊 Performance

### Core Web Vitals
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

### Optimization Features
- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- Server-side rendering for SEO
- Static generation for product pages

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📋 Roadmap

### Current Version (v0.1.0)
- ✅ Multi-vendor shop creation with domain routing
- ✅ Product management with variants and categories
- ✅ Shopping cart with Redux state management
- ✅ User authentication with NextAuth.js v5
- ✅ Stripe Connect payment integration
- ✅ Firebase Storage for image management
- ✅ PostgreSQL database with advanced schema
- ✅ Admin dashboard with analytics
- ✅ Responsive design with Shadcn/UI
- ✅ Order management and tracking

### Upcoming Features (v0.2.0)
- 🔄 Advanced order tracking with notifications
- 🔄 Email notifications for orders and shop updates
- 🔄 Advanced analytics with charts and reports
- 🔄 Customer reviews and ratings system
- 🔄 Inventory alerts and low-stock notifications
- 🔄 SEO optimization for shop pages
- 🔄 Social media integration
- 🔄 Bulk product import/export

### Future Enhancements (v1.0.0)
- 📋 Multi-language support (i18n)
- 📋 Advanced SEO features and sitemap generation
- 📋 Vendor subscription plans and billing
- 📋 AI-powered product recommendations
- 📋 Advanced reporting and business intelligence
- 📋 Mobile app (React Native)
- 📋 Third-party integrations (MailChimp, Google Analytics)
- 📋 Advanced shipping calculator

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Test PostgreSQL connection
psql -h localhost -p 5432 -U username -d shop_sphere
```

#### Environment Variables
```bash
# Verify environment variables are loaded
node -e "console.log(process.env.DATABASE_URL)"
```

#### Port Issues
```bash
# Kill process on port 3000
npx kill-port 3000
# or
lsof -ti:3000 | xargs kill -9
```

#### Firebase Storage Issues
```bash
# Verify Firebase configuration
node -e "console.log(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)"
```

#### Stripe Integration Issues
```bash
# Test Stripe keys
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

### Development Tips

- Use `npm run dev` for hot reload during development
- Check browser console for client-side errors
- Monitor server logs for API errors
- Use PostgreSQL query logs for database debugging
- Test Stripe webhooks with Stripe CLI

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js 15](https://nextjs.org/) - The React framework for production
- [Shadcn/UI](https://ui.shadcn.com/) - Modern React UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [PostgreSQL](https://www.postgresql.org/) - Advanced open source database
- [NextAuth.js](https://next-auth.js.org/) - Authentication library for Next.js
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [TypeScript](https://www.typescriptlang.org/) - Type safety for JavaScript
- [Stripe](https://stripe.com/) - Payment processing platform
- [Firebase](https://firebase.google.com/) - Cloud storage and services
- [Lucide React](https://lucide.dev/) - Beautiful & consistent icon toolkit
- [React Hook Form](https://react-hook-form.com/) - Performant forms library
- [Zod](https://zod.dev/) - TypeScript-first schema validation

## 📞 Support

For support, email support@shopsphere.com or create an issue on [GitHub Issues](https://github.com/yourusername/shop_sphere_v2/issues).

## 🔗 Demo

Visit our live demo: [https://shopsphere-demo.vercel.app](https://shopsphere-demo.vercel.app)

---

**Built with ❤️ by the ShopSphere Team**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Environment Variables for Production

Make sure to set these environment variables in your Vercel dashboard:

- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth.js
- `NEXTAUTH_URL` - Your production URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- Firebase configuration variables (all `NEXT_PUBLIC_FIREBASE_*`)

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
