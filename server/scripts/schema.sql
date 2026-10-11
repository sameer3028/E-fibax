-- ============================================================================
-- Fibax Web Platform - Production Relational PostgreSQL Database Schema
-- Compatible with PostgreSQL 13+ and Supabase
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SYSTEM SETTINGS & SINGLETONS
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(64) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS & CUSTOMERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE,
    phone VARCHAR(32) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    addresses JSONB DEFAULT '[]'::jsonb,
    login_count INT DEFAULT 1,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- 3. PRODUCTS & INVENTORY
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sku VARCHAR(64),
    dosage_form VARCHAR(64),
    category_id VARCHAR(64),
    concern_id VARCHAR(64),
    mrp NUMERIC(10, 2) NOT NULL,
    sale_price NUMERIC(10, 2) NOT NULL,
    discount_percent INT DEFAULT 0,
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 15,
    in_stock BOOLEAN DEFAULT true,
    featured_image TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    rating_average NUMERIC(3, 2) DEFAULT 4.8,
    rating_count INT DEFAULT 1,
    is_bestseller BOOLEAN DEFAULT false,
    volume_weight VARCHAR(64),
    shipping_package JSONB DEFAULT '{}'::jsonb,
    short_desc TEXT,
    key_benefits JSONB DEFAULT '[]'::jsonb,
    ingredients TEXT,
    dosage TEXT,
    ayush_certified BOOLEAN DEFAULT true,
    treatment_course_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_concern ON products(concern_id);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(in_stock, stock_quantity);

-- 4. ORDERS & CHECKOUT TRANSACTIONS
CREATE TABLE IF NOT EXISTS orders (
    order_id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    idempotency_key VARCHAR(128) UNIQUE,
    customer JSONB NOT NULL,
    items JSONB NOT NULL,
    shipping JSONB NOT NULL,
    payment JSONB NOT NULL,
    totals JSONB NOT NULL,
    status VARCHAR(64) DEFAULT 'Processing',
    courier VARCHAR(128) DEFAULT 'Delhivery Express',
    tracking_id VARCHAR(128),
    delhivery_awb VARCHAR(128),
    shipment JSONB,
    cancellation_reason TEXT,
    cancelled_by VARCHAR(32),
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_id);
CREATE INDEX IF NOT EXISTS idx_orders_awb ON orders(delhivery_awb);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- 5. COUPONS & DISCOUNTS
CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) UNIQUE NOT NULL,
    type VARCHAR(32) DEFAULT 'percent',
    value NUMERIC(10, 2) NOT NULL,
    min_order NUMERIC(10, 2) DEFAULT 0,
    max_discount NUMERIC(10, 2),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- 6. REVIEWS & RATINGS
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    video TEXT,
    customer_name VARCHAR(120),
    customer_email VARCHAR(180),
    customer_phone VARCHAR(32),
    status VARCHAR(32) DEFAULT 'PENDING',
    verified_purchase BOOLEAN DEFAULT false,
    helpful_count INT DEFAULT 0,
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- 7. CUSTOMER ENQUIRIES & LEADS
CREATE TABLE IF NOT EXISTS enquiries (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(180),
    city VARCHAR(120),
    experience VARCHAR(120),
    message TEXT,
    source VARCHAR(255),
    ip VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at DESC);

-- 8. WEBSITE CONTENT & HERO BANNERS
CREATE TABLE IF NOT EXISTS about_banners (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    status VARCHAR(32) DEFAULT 'published',
    sort_order INT DEFAULT 1,
    desktop_image TEXT,
    mobile_image TEXT,
    badge_text VARCHAR(120),
    heading TEXT,
    description TEXT,
    primary_btn_text VARCHAR(64),
    primary_btn_url VARCHAR(255),
    secondary_btn_text VARCHAR(64),
    secondary_btn_url VARCHAR(255),
    trust_points JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
