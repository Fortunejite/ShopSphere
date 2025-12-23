CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  parent_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shops (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id),
  domain VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tagline VARCHAR(100),
  category_id INTEGER REFERENCES categories(id),
  status VARCHAR(50) DEFAULT 'active',
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  free_shipping_threshold DECIMAL(10,2) DEFAULT 50,
  currency VARCHAR(10) NOT NULL,
  logo VARCHAR(500),
  banner VARCHAR(500),
  stripe_account_id VARCHAR(255) NOT NULL,
  stripe_account_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category_ids INTEGER[] NOT NULL DEFAULT '{}',

  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  discount DECIMAL(5,2) DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),

  variants JSONB DEFAULT '[]'::jsonb,

  image VARCHAR(500) NOT NULL,
  thumbnails TEXT[] DEFAULT '{}',

  is_featured BOOLEAN DEFAULT false,

  weight DECIMAL(8,3) DEFAULT 0,
  length DECIMAL(8,2) DEFAULT 0,
  width DECIMAL(8,2) DEFAULT 0,
  height DECIMAL(8,2) DEFAULT 0,

  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  sales_count INTEGER DEFAULT 0 CHECK (sales_count >= 0),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (shop_id, slug)
);

CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  shop_id INTEGER REFERENCES shops(id),
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

  tracking_id VARCHAR(255) UNIQUE NOT NULL,

  total_amount DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  shipping_amount DECIMAL(12,2) DEFAULT 0,
  final_amount DECIMAL(12,2) NOT NULL,

  items JSONB NOT NULL DEFAULT '[]'::jsonb,

  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status VARCHAR(50) DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method VARCHAR(50),

  shipping_address JSONB,

  notes TEXT,
  admin_notes TEXT,

  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  cancelled_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes (PostgreSQL-compliant)

CREATE INDEX idx_products_shop_id ON products (shop_id);
CREATE INDEX idx_products_category_ids ON products USING GIN (category_ids);
CREATE INDEX idx_products_status ON products (status);
CREATE INDEX idx_products_is_featured ON products (is_featured);
CREATE INDEX idx_products_price ON products (price);
CREATE INDEX idx_products_created_at ON products (created_at);

CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_shop_id ON orders (shop_id);
CREATE INDEX idx_orders_tracking_id ON orders (tracking_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_payment_status ON orders (payment_status);
CREATE INDEX idx_orders_created_at ON orders (created_at);
