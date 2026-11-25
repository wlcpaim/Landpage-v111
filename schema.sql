-- OMNIPOS CORE - BANCO DE DADOS SUPABASE (PostgreSQL)

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document text not null,
  email text not null,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  name text not null,
  email text not null,
  role text not null check (role in ('admin', 'cashier', 'manager')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  barcode text,
  price decimal(10,2) not null default 0.00,
  cost_price decimal(10,2) not null default 0.00,
  stock integer not null default 0,
  min_stock integer not null default 5,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists cash_registers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  opening_amount decimal(10,2) not null default 0.00,
  closing_amount decimal(10,2),
  expected_amount decimal(10,2),
  status text not null check (status in ('aberto', 'fechado')),
  opened_at timestamp with time zone default timezone('utc'::text, now()) not null,
  closed_at timestamp with time zone,
  notes text
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  debt decimal(10,2) default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  client_id uuid references clients(id) on delete set null,
  client_name text,
  total_amount decimal(10,2) not null,
  discount decimal(10,2) default 0.00,
  payment_method text not null,
  status text not null default 'concluida',
  cashier_id uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references sales(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity integer not null,
  unit_price decimal(10,2) not null,
  total_price decimal(10,2) not null
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  type text not null check (type in ('receita', 'despesa')),
  category text not null,
  amount decimal(10,2) not null,
  description text,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices de alta performance
create index if not exists idx_products_company on products(company_id);
create index if not exists idx_products_barcode on products(barcode);
create index if not exists idx_sales_company_date on sales(company_id, created_at);
create index if not exists idx_sale_items_sale on sale_items(sale_id);
create index if not exists idx_transactions_company on transactions(company_id);

-- SEED INICIAL
insert into companies (id, name, document, email, phone) 
values ('demo-company-1', 'OmniCafé & Bistrô Demo', '12.345.678/0001-99', 'contato@omnicafe.com', '(11) 99999-0000')
on conflict (id) do nothing;
