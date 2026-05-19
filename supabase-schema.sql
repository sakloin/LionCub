-- ============================================================
-- LION CUB - Esquema de base de datos Supabase
-- Correr en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. PRODUCTOS
create table if not exists products (
  id          text primary key,           -- LC-001, LC-101, etc.
  sku         text unique not null,
  name        text not null,
  tagline     text,
  desc        text,
  category    text not null,
  price       numeric(10,2) not null,
  cost        numeric(10,2) default 0,    -- costo de fabricación/compra
  stock       int default 0,
  sizes       text[] default '{}',
  colors      text[] default '{}',
  gender      text default 'Unisex',
  material    text default '100% Algodón Pima',
  has_offer   boolean default false,
  image_url   text,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- 2. PEDIDOS
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  customer_name    text not null,
  customer_phone   text not null,
  customer_email   text,
  address          text,
  district         text,
  city             text default 'Lima',
  shipping_method  text not null default 'domicilio',  -- domicilio | shalom
  shalom_agency    text,
  shipping_cost    numeric(10,2) default 0,
  subtotal         numeric(10,2) not null,
  total            numeric(10,2) not null,
  payment_method   text default 'izipay',              -- izipay | transferencia | contraentrega
  payment_status   text default 'pendiente',           -- pendiente | pagado | fallido
  order_status     text default 'nuevo',               -- nuevo | procesando | enviado | entregado | cancelado
  notes            text,
  created_at       timestamptz default now()
);

-- 3. ITEMS DEL PEDIDO
create table if not exists order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid references orders(id) on delete cascade,
  product_id    text references products(id),
  product_name  text not null,
  product_sku   text not null,
  selected_size  text,
  selected_color text,
  quantity      int not null,
  unit_price    numeric(10,2) not null,
  unit_cost     numeric(10,2) default 0,
  subtotal      numeric(10,2) not null
);

-- 4. COMPRAS / REPOSICIÓN DE STOCK
create table if not exists purchases (
  id            uuid primary key default gen_random_uuid(),
  product_id    text references products(id),
  product_name  text not null,
  quantity      int not null,
  unit_cost     numeric(10,2) not null,
  total_cost    numeric(10,2) not null,
  supplier      text,
  notes         text,
  purchased_at  date default current_date,
  created_at    timestamptz default now()
);

-- ============================================================
-- DATOS INICIALES: importar catálogo actual
-- ============================================================
insert into products (id, sku, name, tagline, desc, category, price, cost, stock, sizes, colors, gender, has_offer, image_url, active) values
('LC-001','LC-001','Tiernos Conejitos','El primer abrazo suave','Set de 5 piezas con delicado estampado de conejitos: body kimono, pantalón con pie, gorrito, mantita envolvente y gorro. Ideal para la llegada a casa.','conjuntos',79,0,10,'{"RN","0-3m","3-6m"}','{"Blanco"}','Unisex',false,'/products/LC-001.jpeg',true),
('LC-002','LC-002','Dulce Conejita Anticólico','Hecho con amor para noches tranquilas','Conjunto anticólico de 3 piezas en tono palo rosa.','conjuntos',69,0,8,'{"RN","0-3m"}','{"Palo Rosa"}','Niña',false,'/products/LC-002.jpeg',true),
('LC-003','LC-003','Bear & Bunny Amiguitos','Los compañeros de cuna preferidos','Set 3 piezas en verde suave con bordado exclusivo de osito y conejita.','conjuntos',79,0,10,'{"RN","0-3m","3-6m"}','{"Verde menta"}','Unisex',false,'/products/LC-003.jpeg',true),
('LC-004','LC-004','Besties del Alma','Amigos inseparables desde el día uno','Conjunto 3 piezas en celeste con aplique de ositos rayados.','conjuntos',59,0,12,'{"RN","0-3m","3-6m"}','{"Celeste"}','Unisex',false,'/products/LC-004.jpeg',true),
('LC-005','LC-005','Blonditas de Amor','Elegancia tierna para princesas','Set 3 piezas en rosa empolvado con blondas y moño central.','conjuntos',59,0,8,'{"RN","0-3m"}','{"Rosa"}','Niña',false,'/products/LC-005.jpeg',true),
('LC-006','LC-006','Conejita en Ballet','Un ballet de ternura','Conjunto 3 piezas palo rosa con bordado de conejita bailarina.','conjuntos',59,0,10,'{"RN","0-3m","3-6m"}','{"Palo Rosa"}','Niña',false,'/products/LC-006.jpeg',true),
('LC-007','LC-007','Cute Bunny','Suave como una caricia de orejas largas','Conjunto 3 piezas blanco con volantes y bordado de conejita.','conjuntos',59,0,8,'{"RN","0-3m"}','{"Blanco"}','Niña',false,'/products/LC-007.jpeg',true),
('LC-008','LC-008','Pequeño Explorador Dino','Aventuras desde la cuna','Set 5 piezas: chaquetita kimono con estampado de dinos.','conjuntos',59,0,8,'{"RN","0-3m","3-6m"}','{"Azul"}','Niño',false,'/products/LC-008.jpeg',true),
('LC-009','LC-009','Dino del Bosque','Tierno como su habitat natural','Set 5 piezas verde menta con estampado de dinos y árboles.','conjuntos',59,0,8,'{"RN","0-3m","3-6m"}','{"Verde menta"}','Niño',false,'/products/LC-009.jpeg',true),
('LC-010','LC-010','Mi Duraznito','Dulce como su nombre','Ajuar premium 5 piezas en tono durazno.','conjuntos',79,0,6,'{"RN","0-3m","3-6m"}','{"Durazno"}','Niña',false,'/products/LC-010.jpeg',true),
('LC-011','LC-011','Mi Lacito Bonito','Detalles que enamoran','Conjunto 3 piezas crema con lacitos bordados.','conjuntos',59,0,10,'{"RN","0-3m","3-6m"}','{"Crema"}','Niña',false,'/products/LC-011.jpeg',true),
('LC-012','LC-012','Native Bear','Carácter tierno del norte','Set 3 piezas en tonos tierra con estampado all-over de ositos nativos.','conjuntos',69,0,12,'{"RN","0-3m","3-6m","6-9m"}','{"Crema"}','Unisex',false,'/products/LC-012.jpeg',true),
('LC-013','LC-013','Osita Ballerina','Giros suaves, pasos de algodón','Conjunto 3 piezas verde menta con bordado de osita bailarina.','conjuntos',65,0,8,'{"RN","0-3m","3-6m"}','{"Verde menta"}','Niña',false,'/products/LC-013.jpeg',true),
('LC-014','LC-014','Ovejita de mis Sueños','Noches tranquilas, sueños dulces','Set 3 piezas beige con bordado de ovejita.','conjuntos',59,0,10,'{"RN","0-3m","3-6m"}','{"Beige"}','Unisex',false,'/products/LC-014.jpeg',true),
('LC-015','LC-015','Princesita de Ballet','Pequeña estrella del primer escenario','Ajuar premium 5 piezas en durazno.','conjuntos',79,0,6,'{"RN","0-3m","3-6m"}','{"Durazno"}','Niña',false,'/products/LC-015.jpeg',true),
('LC-016','LC-016','Nube Celeste Premium','La suavidad hecha ajuar','Ajuar premium 4 piezas en celeste.','conjuntos',79,0,8,'{"RN","0-3m"}','{"Celeste"}','Unisex',false,'/products/LC-016.jpeg',true),
('LC-017','LC-017','Ositos de Cuentos','Cada puntada, una historia','Conjunto 2 piezas con exquisito bordado de osito y conejita.','conjuntos',59,0,10,'{"RN","0-3m","3-6m"}','{"Crema"}','Niña',false,'/products/LC-017.jpeg',true),
('LC-018','LC-018','Ternura Libélula','Ligereza que acaricia','Conjunto 3 piezas verde menta con bordado de libélulas.','conjuntos',59,0,10,'{"RN","0-3m","3-6m"}','{"Verde menta"}','Unisex',false,'/products/LC-018.jpeg',true),
('LC-019','LC-019','Hilo de Algodón Nativo','Textura que abraza','Ajuar tejido 3 piezas con textura de hilo.','conjuntos',79,0,8,'{"RN","0-3m","3-6m"}','{"Crema","Verde menta"}','Unisex',false,'/products/LC-019.jpeg',true),
('LC-020','LC-020','Mariposa de Primavera','Alas suaves, primer vuelo','Conjunto 3 piezas crema con bordado de mariposa y lazos.','conjuntos',59,0,10,'{"RN","0-3m","3-6m"}','{"Crema"}','Niña',false,'/products/LC-020.jpeg',true),
('LC-101','LC-101','Body Esencial Premium','La segunda piel del bebé','Body manga larga con broches en hombro, cuello redondo y broches en entrepierna.','bodies',29,0,30,'{"RN","0-3m","3-6m","6-9m","9-12m"}','{"Blanco","Celeste","Palo Rosa","Beige"}','Unisex',true,'/products/LC-101.jpeg',true),
('LC-201','LC-201','Pack Dino Aventurero','Cada comida, una expedición','Trío de baberos con estampado y bordado de dinos. Incluye 3 unidades.','baberos',19,0,15,'{"Único"}','{"Azul","Verde menta","Blanco"}','Unisex',true,'/products/LC-201.jpeg',true),
('LC-202','LC-202','Pack Safari Tierno','Tres amigos para tres momentos','Trío de baberos con bordado de jirafa y elefante. Incluye 3 unidades.','baberos',19,0,15,'{"Único"}','{"Blanco","Beige","Palo Rosa"}','Unisex',true,'/products/LC-202.jpeg',true),
('LC-301','LC-301','Manta Celestial','Envuelto en un cielo de suavidad','Manta envolvente celeste con puntilla delicada en los bordes. 80×80 cm.','mantas',49,0,12,'{"80 × 80 cm"}','{"Celeste"}','Unisex',true,'/products/LC-301.jpeg',true),
('LC-302','LC-302','Manta Dulces Pétalos','Un jardín sobre la cuna','Manta envolvente con delicado estampado floral multicolor sobre blanco.','mantas',49,0,12,'{"80 × 80 cm"}','{"Floral"}','Unisex',true,'/products/LC-302.jpeg',true)
on conflict (id) do nothing;

-- Habilitar Row Level Security (RLS) - acceso público de lectura, escritura solo autenticada
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table purchases enable row level security;

-- Política: lectura pública de productos activos
create policy "Public read active products" on products for select using (active = true);

-- Política: lectura/escritura total desde el server (service role key o sin RLS en API routes)
create policy "Service full access products" on products for all using (true);
create policy "Service full access orders" on orders for all using (true);
create policy "Service full access order_items" on order_items for all using (true);
create policy "Service full access purchases" on purchases for all using (true);
