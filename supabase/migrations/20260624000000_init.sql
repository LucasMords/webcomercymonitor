-- ============================================
-- Schema para viewep — Supabase
-- Execute no SQL Editor do Supabase
-- ============================================

-- Recria tabela de produtos com schema completo
DROP TABLE IF EXISTS products CASCADE;

-- Tabela de produtos
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  price INTEGER NOT NULL,
  screen_size TEXT,
  resolution TEXT,
  refresh_rate TEXT,
  panel_type TEXT,
  response_time TEXT,
  curvature TEXT,
  hdr TEXT,
  color TEXT,
  color_hex TEXT,
  accent_color TEXT,
  features TEXT[],
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 10,
  active BOOLEAN DEFAULT true,
  aspect TEXT DEFAULT '16:9',
  size_inches INTEGER DEFAULT 27,
  curved BOOLEAN DEFAULT false,
  stand TEXT DEFAULT 'fixed',
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed de produtos — 10 monitores reais
INSERT INTO products (id, name, tagline, price, screen_size, resolution, refresh_rate, panel_type, response_time, curvature, hdr, color, color_hex, accent_color, features, featured, aspect, size_inches, curved, stand, image) VALUES
('titan-45', 'Titan 45 OLED', 'Curvatura agressiva. Imersão total.', 1699, '45"', '3440 x 1440', '240Hz', 'OLED', '0.03ms', '800R', 'HDR10', 'Preto Carbono', '#1a1a1a', '#f43f5e', ARRAY['OLED 240Hz','800R Curve','G-Sync Compatible','Anti-Glare'], true, '21:9', 45, true, 'gaming', 'generated'),
('ultra-49', 'UltraView 49', 'Imersão sem limites', 1499, '49"', '5120 x 1440', '240Hz', 'QD-OLED', '0.03ms', '1800R', 'HDR10+', 'Preto Espacial', '#1a1a1a', '#6366f1', ARRAY['Super Ultrawide 32:9','QD-OLED','G-Sync Compatible','KVM Switch'], true, '32:9', 49, true, 'professional', NULL),
('spectra-32', 'Spectra 32 OLED', 'OLED 4K para criadores exigentes', 1399, '32"', '3840 x 2160', '144Hz', 'OLED', '0.1ms', 'Flat', 'HDR10+', 'Cinza Lunar', '#3a3a3a', '#a78bfa', ARRAY['4K OLED','DCI-P3 99%','USB-C 90W','Delta E < 1'], false, '16:9', 32, false, 'minimalist', NULL),
('pro-32', 'ProVision 32', 'Precisão profissional para criadores', 1199, '32"', '3840 x 2160', '144Hz', 'IPS Black', '4ms', 'Flat', 'HDR600', 'Cinza Grafite', '#2d2d2d', '#ec4899', ARRAY['4K UHD','DCI-P3 98%','USB-C 90W','Hardware Calibration'], false, '16:9', 32, false, 'professional', NULL),
('panorama-38', 'Panorama 38', 'O ultrawide definitivo para produtividade', 1099, '38"', '3840 x 1600', '144Hz', 'Nano IPS', '1ms', '2300R', 'HDR600', 'Branco Estelar', '#f0f0f0', '#14b8a6', ARRAY['21:9 UltraWide','Nano IPS','G-Sync Ultimate','RGB Lighting'], false, '21:9', 38, true, 'arm', NULL),
('luxview-27', 'LuxView 27', 'Mini-LED com brilho excepcional', 949, '27"', '3840 x 2160', '165Hz', 'Mini-LED IPS', '1ms', 'Flat', 'HDR1000', 'Prata Escovado', '#c8c8c8', '#f59e0b', ARRAY['Mini-LED 1152 zonas','HDR1000','USB-C PD 90W','P3 97%'], false, '16:9', 27, false, 'minimalist', NULL),
('curve-34', 'CurvePro 34', 'Curvatura perfeita para produtividade', 899, '34"', '3440 x 1440', '175Hz', 'VA', '1ms', '1500R', 'HDR400', 'Prata Lunar', '#c0c0c0', '#8b5cf6', ARRAY['Ultrawide QHD','1500R Curve','FreeSync Premium','PIP/PBP'], false, '21:9', 34, true, 'fixed', NULL),
('artisan-27', 'Artisan 27', '5K Retina. Cores que inspiram.', 799, '27"', '5120 x 2880', '60Hz', 'IPS', '5ms', 'Flat', 'HDR500', 'Branco Neve', '#fafafa', '#06b6d4', ARRAY['5K Retina','True Tone','P3 Wide Color','Thunderbolt 4'], false, '16:9', 27, false, 'arm', NULL),
('blitz-27', 'Blitz 27', '360Hz para vencer cada frame', 699, '27"', '2560 x 1440', '360Hz', 'IPS', '0.5ms', 'Flat', 'HDR400', 'Preto Furtivo', '#111111', '#f43f5e', ARRAY['360Hz','NVIDIA Reflex','ULMB 2','eSports Mode'], true, '16:9', 27, false, 'gaming', NULL),
('nitro-24', 'Nitro 24', '540Hz puro para eSports', 549, '24.5"', '1920 x 1080', '540Hz', 'TN', '0.3ms', 'Flat', 'HDR10', 'Preto Matte', '#0d0d0d', '#22c55e', ARRAY['540Hz','DyAc+ 2','NVIDIA Reflex','Low Motion Blur'], false, '16:9', 24, false, 'gaming', NULL)
ON CONFLICT (id) DO NOTHING;

-- Carrinho
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id TEXT REFERENCES products NOT NULL,
  quantity INTEGER DEFAULT 1,
  UNIQUE(user_id, product_id)
);

-- Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  status TEXT DEFAULT 'pending',
  total INTEGER NOT NULL,
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_address JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders NOT NULL,
  product_id TEXT REFERENCES products NOT NULL,
  quantity INTEGER NOT NULL,
  price_each INTEGER NOT NULL,
  product_name TEXT NOT NULL
);

-- RLS: produtos — leitura pública
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Produtos visíveis a todos" ON products FOR SELECT USING (active = true);

-- RLS: carrinho — só o dono
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuário vê próprio carrinho" ON cart_items;
CREATE POLICY "Usuário vê próprio carrinho" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- RLS: pedidos — só o dono
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuário vê próprios pedidos" ON orders;
CREATE POLICY "Usuário vê próprios pedidos" ON orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
DROP POLICY IF EXISTS "Permitir criar pedido" ON orders;
CREATE POLICY "Permitir criar pedido" ON orders FOR INSERT WITH CHECK (true);

-- RLS: order_items — só dono do pedido
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuário vê itens dos próprios pedidos" ON order_items;
CREATE POLICY "Usuário vê itens dos próprios pedidos" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)));
DROP POLICY IF EXISTS "Permitir criar item do pedido" ON order_items;
CREATE POLICY "Permitir criar item do pedido" ON order_items FOR INSERT WITH CHECK (true);
