# 🛍️ ShopSphere

A modern, full-stack multi-vendor e-commerce platform built with Next.js 15, TypeScript, and MongoDB. ShopSphere enables users to create their own online shops with custom subdomains, manage products, process orders, and provide a seamless shopping experience.

![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![Material-UI](https://img.shields.io/badge/Material--UI-7.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🏪 Multi-Vendor Support
- **Custom Shop Creation**: Users can create their own shops with unique subdomains
- **Shop Management**: Full shop customization and management capabilities
- **Subdomain Routing**: Each shop gets its own subdomain (e.g., `myshop.shopsphere.com`)

### 🛒 E-commerce Core
- **Product Management**: Full CRUD operations for products with variants, categories, and tags
- **Shopping Cart**: Redux-powered cart with persistent state
- **Order Processing**: Complete order management system
- **Inventory Tracking**: Real-time stock management

### 🎨 Modern UI/UX
- **Material-UI Design**: Clean, responsive interface using Material-UI components
- **Mobile-First**: Fully responsive design for all devices
- **Dark/Light Mode**: Theme switching capabilities
- **Product Gallery**: High-quality image displays with zoom functionality

### 🔐 Authentication & Security
- **NextAuth.js Integration**: Secure authentication with credentials provider
- **User Management**: Registration, login, and profile management
- **Protected Routes**: Middleware-based route protection
- **Password Encryption**: Bcrypt for secure password hashing

### 📦 Advanced Product Features
- **Product Variants**: Support for size, color, and custom attributes
- **Categories & Tags**: Organized product categorization
- **Reviews & Ratings**: Customer feedback system
- **Search & Filtering**: Advanced product search with multiple filters
- **Product SEO**: Slug-based URLs for better SEO

### 🛠️ Developer Experience
- **TypeScript**: Full type safety throughout the application
- **API Routes**: RESTful API with Next.js App Router
- **Redux Toolkit**: State management for complex UI interactions
- **Error Handling**: Comprehensive error handling and validation
- **Code Organization**: Clean architecture with separation of concerns

## 🏗️ Project Structure

```
shop_sphere/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication routes
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (home)/                   # Main marketplace
│   │   │   ├── products/
│   │   │   └── page.tsx
│   │   ├── (shops)/                  # Individual shop routes
│   │   │   └── shops/[subdomain]/
│   │   │       ├── cart/
│   │   │       ├── checkout/
│   │   │       └── products/
│   │   └── api/                      # API endpoints
│   │       ├── auth/
│   │       ├── products/
│   │       ├── cart/
│   │       ├── orders/
│   │       └── shops/
│   ├── components/                   # Reusable components
│   │   ├── navbar.tsx
│   │   ├── shopNavbar.tsx
│   │   └── products/
│   ├── models/                       # MongoDB schemas
│   │   ├── User.model.ts
│   │   ├── Shop.model.ts
│   │   ├── Product.model.ts
│   │   ├── Cart.model.ts
│   │   └── Order.model.ts
│   ├── redux/                        # State management
│   │   ├── store.ts
│   │   ├── cartSlice.ts
│   │   ├── shopSlice.ts
│   │   └── categorySlice.ts
│   ├── lib/                          # Utilities and configurations
│   │   ├── mongodb.ts
│   │   ├── utils.ts
│   │   ├── errorHandler.ts
│   │   └── schema/                   # Validation schemas
│   └── hooks/                        # Custom React hooks
└── public/                           # Static assets
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** database
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/shop_sphere.git
   cd shop_sphere
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
   MONGODB_URI=mongodb://localhost:27017/shop_sphere
   
   # NextAuth
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   
   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Setup

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Seed the database** (optional)
   ```bash
   # Access the seed endpoints
   GET /api/seed/categories
   GET /api/seed/products
   ```

## 📚 API Documentation

### Products API

#### Get Products
```http
GET /api/products
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `name` - Search by product name
- `shopId` - Filter by shop ID
- `category` - Filter by category
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `sortBy` - Sort field (name, price, createdAt)
- `sortOrder` - Sort direction (asc, desc)

#### Get Single Product
```http
GET /api/products/[slug]
```

#### Create Product
```http
POST /api/products
```

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "stock": 100,
  "categories": ["category-id"],
  "tags": ["tag1", "tag2"],
  "variants": [
    {
      "attributes": {
        "size": "L",
        "color": "Blue"
      },
      "isDefault": true
    }
  ]
}
```

### Cart API

#### Get Cart
```http
GET /api/cart
```

#### Add to Cart
```http
POST /api/cart
```

#### Update Cart Item
```http
PUT /api/cart/[id]
```

#### Remove from Cart
```http
DELETE /api/cart/[id]
```

### Shops API

#### Get Shops
```http
GET /api/shops
```

#### Get Shop by Subdomain
```http
GET /api/shops/[subdomain]
```

#### Create Shop
```http
POST /api/shops
```

## 🎨 Theming and Customization

ShopSphere uses Material-UI with custom theming support:

```typescript
// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});
```

### Custom Components

The project includes custom styled components for enhanced UI:

- **VariantElement**: Styled product variant selector
- **ProductGrid**: Responsive product grid layout
- **ShopNavbar**: Shop-specific navigation

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
- ✅ Multi-vendor shop creation
- ✅ Product management with variants
- ✅ Shopping cart functionality
- ✅ User authentication
- ✅ Responsive design

### Upcoming Features (v0.2.0)
- 🔄 Payment integration (Stripe, PayPal)
- 🔄 Order tracking and notifications
- 🔄 Advanced analytics dashboard
- 🔄 Social media integration
- 🔄 Mobile app (React Native)

### Future Enhancements (v1.0.0)
- 📋 Multi-language support
- 📋 Advanced SEO features
- 📋 Vendor subscription plans
- 📋 AI-powered recommendations
- 📋 Advanced reporting tools

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check MongoDB connection
mongo --eval "db.adminCommand('ismaster')"
```

#### Environment Variables
```bash
# Verify environment variables
npm run env:check
```

#### Port Issues
```bash
# Kill process on port 3000
npx kill-port 3000
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Material-UI](https://mui.com/) - React UI library
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [NextAuth.js](https://next-auth.js.org/) - Authentication library
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## 📞 Support

For support, email support@shopsphere.com or join our [Discord community](https://discord.gg/shopsphere).

---

**Built with ❤️ by the ShopSphere Team**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
