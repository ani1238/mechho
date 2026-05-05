-- Mechho Kitchen — Supabase Schema (fixed)

create table if not exists categories (
  id text primary key,
  name text not null,
  sort_order int not null default 0,
  image_url text
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  category_id text references categories(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  is_veg boolean not null default false,
  is_available boolean not null default true,
  is_bestseller boolean not null default false,
  tags text[] not null default '{}'
);

create table if not exists addons (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references items(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null default 0
);

create table if not exists service_pincodes (
  pincode text primary key,
  delivery_fee numeric(10,2) not null default 0,
  eta_minutes int not null default 45
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('delivery','pickup','preorder')),
  status text not null default 'confirmed'
    check (status in ('pending_payment','pending_review','confirmed','preparing','out_for_delivery','delivered','rejected','cancelled')),
  customer_name text not null,
  phone text not null,
  address text,
  pincode text not null,
  slot_date date,
  slot_time text,
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  payment_method text not null check (payment_method in ('upi','cod')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed')),
  upi_ref text,
  notes text
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  item_id uuid references items(id),
  qty int not null check (qty > 0),
  unit_price numeric(10,2) not null,
  addons_json jsonb not null default '[]'
);

create table if not exists survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  phone text,
  pincode text not null,
  fish_types text[] not null default '{}',
  preparations text[] not null default '{}',
  portion_size text,
  price_band text,
  frequency text,
  comments text
);

-- RLS
alter table categories enable row level security;
alter table items enable row level security;
alter table addons enable row level security;
alter table service_pincodes enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table survey_responses enable row level security;

create policy "Public read categories" on categories for select using (true);
create policy "Public read items" on items for select using (true);
create policy "Public read addons" on addons for select using (true);
create policy "Public read pincodes" on service_pincodes for select using (true);
create policy "Public insert orders" on orders for insert with check (true);
create policy "Public insert order_items" on order_items for insert with check (true);
create policy "Public insert survey" on survey_responses for insert with check (true);
create policy "Admin read orders" on orders for select using (auth.role() = 'authenticated');
create policy "Admin update orders" on orders for update using (auth.role() = 'authenticated');
create policy "Admin read order_items" on order_items for select using (auth.role() = 'authenticated');
create policy "Admin read survey" on survey_responses for select using (auth.role() = 'authenticated');
create policy "Admin write menu" on items for all using (auth.role() = 'authenticated');
create policy "Admin write categories" on categories for all using (auth.role() = 'authenticated');

-- Seed: pincodes (Kismatpur + nearby)
insert into service_pincodes (pincode, delivery_fee, eta_minutes) values
  ('500005', 30, 40), ('500074', 30, 40), ('500086', 40, 50),
  ('500030', 50, 60), ('500032', 50, 60), ('500031', 40, 45),
  ('500089', 40, 45)
on conflict do nothing;

-- Seed: categories
insert into categories (id, name, sort_order) values
  ('cat-burgers',  'Burgers',        1),
  ('cat-snacks',   'Snacks',         2),
  ('cat-bowls',    'Rice Bowls',     3),
  ('cat-buckets',  'Buckets',        4),
  ('cat-combos',   'Combos',         5),
  ('cat-salad',    'Salad',          6),
  ('cat-acc',      'Accompaniments', 7)
on conflict do nothing;

-- Seed: items
insert into items (category_id, name, price, is_veg, is_bestseller, tags) values
  ('cat-burgers','Peri Peri Fish Burger',219,false,false,'{burger,spicy}'),
  ('cat-burgers','Kolkata Fish Burger',189,false,true,'{burger,kolkata}'),
  ('cat-burgers','Fish Strips Burger',199,false,false,'{burger}'),
  ('cat-burgers','Veggie Burger',199,true,false,'{burger,veg}'),
  ('cat-snacks','Crispy Fish Fingers and Kasundi Dip',179,false,true,'{snack,bestseller}'),
  ('cat-snacks','Kolkata Fish Cutlet',169,false,true,'{snack,kolkata}'),
  ('cat-snacks','Golden Fish Bites (Popcorn)',149,false,false,'{snack,popcorn}'),
  ('cat-snacks','Butter Garlic Fish Roll',189,false,false,'{snack,roll}'),
  ('cat-snacks','Kolkata Fish Kathi Roll',189,false,false,'{snack,roll,kolkata}'),
  ('cat-snacks','Golden Fried Prawns',200,false,true,'{snack,prawns}'),
  ('cat-snacks','Classic Crispy Onion Rings',109,true,false,'{snack,veg}'),
  ('cat-snacks','Peri Peri Masala Fries',99,true,false,'{snack,fries,veg}'),
  ('cat-snacks','Veggie Finger Fries',179,true,false,'{snack,veg}'),
  ('cat-bowls','Fish Paturi Bowl',239,false,true,'{bowl,paturi}'),
  ('cat-bowls','Fish Fry Rice Bowl',249,false,true,'{bowl,bestseller}'),
  ('cat-bowls','Fish Finger Rice Bowl',239,false,false,'{bowl}'),
  ('cat-bowls','Fish Popcorn Rice Bowl',229,false,false,'{bowl}'),
  ('cat-bowls','Fish Rava Fry Rice Bowl',259,false,false,'{bowl}'),
  ('cat-bowls','Fried Prawns Rice Bowl',299,false,false,'{bowl,prawns}'),
  ('cat-bowls','Veggie Fingers Rice Bowl',219,true,false,'{bowl,veg}'),
  ('cat-buckets','Classic Fish Fry Mechho Bucket',449,false,true,'{bucket,sharing}'),
  ('cat-buckets','Rava Fry Bucket',499,false,false,'{bucket,sharing}'),
  ('cat-combos','Solo Fish Combo - Choice of Burger/Rice Bowl',299,false,false,'{combo}'),
  ('cat-combos','Snacker Combo - All Snacks and Choice of Size',229,false,false,'{combo,snack}'),
  ('cat-combos','Adda Combo - Choice of Rice Bowl / Burger',399,false,false,'{combo}'),
  ('cat-combos','Bari Combo - Choice of Rice Bowl/Burger',799,false,false,'{combo,family}'),
  ('cat-combos','Mechho Feast Combo - Large Order',1099,false,true,'{combo,party,feast}');
