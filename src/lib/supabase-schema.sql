create table stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  website_url text,
  created_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  image_url text,
  icon text,
  seo_title text,
  seo_description text,
  created_at timestamptz default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  short_description text,
  long_description text,
  featured_image text,
  gallery_images text[] default '{}',
  store_id uuid references stores(id),
  brand text,
  category_id uuid references categories(id),
  regular_price numeric(10,2),
  sale_price numeric(10,2),
  discount integer,
  affiliate_link text not null,
  coupon_code text,
  availability text,
  stock_status text,
  deal_expiration timestamptz,
  featured boolean default false,
  trending boolean default false,
  clearance boolean default false,
  status text default 'draft',
  seo_title text,
  seo_description text,
  hero_enabled boolean default false,
  hero_sort_order integer,
  hero_starts_at timestamptz,
  hero_ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  body jsonb,
  excerpt text,
  featured_image text,
  product_id uuid references products(id),
  category_id uuid references categories(id),
  tags text[] default '{}',
  seo_title text,
  seo_description text,
  author text,
  status text default 'draft',
  publish_date timestamptz,
  created_at timestamptz default now()
);

create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text,
  created_at timestamptz default now()
);

create table media (
  id uuid primary key default gen_random_uuid(),
  title text,
  url text not null,
  alt_text text,
  mime_type text,
  created_at timestamptz default now()
);

create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

create table affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  product_id text,
  store_id text,
  article_id text,
  category_id text,
  source_page text,
  button_location text,
  destination_domain text,
  session_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  referrer text,
  device_type text,
  created_at timestamptz default now()
);

create index affiliate_clicks_product_idx on affiliate_clicks(product_id);
create index affiliate_clicks_category_idx on affiliate_clicks(category_id);
create index affiliate_clicks_store_idx on affiliate_clicks(store_id);
create index affiliate_clicks_created_idx on affiliate_clicks(created_at);
