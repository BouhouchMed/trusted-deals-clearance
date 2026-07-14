create table if not exists products (
  id text primary key,
  slug text unique not null,
  title text not null,
  short_description text,
  long_description text,
  image text,
  gallery text[] default '{}',
  store_id text not null,
  brand text,
  category_slug text not null,
  regular_price numeric(10,2) not null default 0,
  sale_price numeric(10,2) not null default 0,
  rating numeric(3,2) default 4.5,
  coupon_code text,
  affiliate_url text not null,
  affiliate_network text,
  availability text default 'In Stock',
  expiration date,
  featured boolean default false,
  trending boolean default false,
  clearance boolean default false,
  published boolean default true,
  specs text[] default '{}',
  pros text[] default '{}',
  cons text[] default '{}',
  tips text[] default '{}',
  seo_title text,
  seo_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists categories (
  slug text primary key,
  title text not null,
  description text,
  image text,
  icon text default 'Sparkles',
  is_deleted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists articles (
  slug text primary key,
  title text not null,
  excerpt text,
  category_slug text not null,
  product_slug text,
  image text,
  author text,
  published_at date default current_date,
  tags text[] default '{}',
  is_deleted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table categories add column if not exists is_deleted boolean default false;
alter table articles add column if not exists is_deleted boolean default false;

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text,
  created_at timestamptz default now()
);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  title text,
  url text not null,
  alt_text text,
  mime_type text,
  created_at timestamptz default now()
);

create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists affiliate_clicks (
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

create index if not exists products_slug_idx on products(slug);
create index if not exists products_category_idx on products(category_slug);
create index if not exists products_store_idx on products(store_id);
create index if not exists categories_slug_idx on categories(slug);
create index if not exists articles_slug_idx on articles(slug);
create index if not exists articles_category_idx on articles(category_slug);
create index if not exists affiliate_clicks_product_idx on affiliate_clicks(product_id);
create index if not exists affiliate_clicks_category_idx on affiliate_clicks(category_id);
create index if not exists affiliate_clicks_store_idx on affiliate_clicks(store_id);
create index if not exists affiliate_clicks_created_idx on affiliate_clicks(created_at);
