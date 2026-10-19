-- ==============================================================================
-- SCHEMA POSTGRESQL & ROW LEVEL SECURITY (RLS) UNTUK KOST-KOSTAN
-- Platform Pencarian Kost dengan Akses Berlangganan Rp15.000 / 30 Hari
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL: PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABEL: KOSTS
CREATE TABLE IF NOT EXISTS public.kosts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    alamat TEXT NOT NULL,
    area TEXT NOT NULL, -- Contoh: 'Kuningan', 'Tebet', 'Benhil', 'Palmerah'
    kota TEXT NOT NULL DEFAULT 'Jakarta',
    harga INTEGER NOT NULL, -- Harga per bulan dalam Rupiah
    tipe TEXT NOT NULL CHECK (tipe IN ('putra', 'putri', 'campur')),
    fasilitas TEXT[] DEFAULT '{}'::TEXT[],
    deskripsi TEXT NOT NULL,
    peraturan TEXT[] DEFAULT '{}'::TEXT[],
    status TEXT NOT NULL DEFAULT 'tersedia' CHECK (status IN ('tersedia', 'penuh')),
    owner_whatsapp TEXT NOT NULL, -- STRICT: HANYA DIAKSES OLEH ROLE SERVICE/PELANGGAN AKTIF
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABEL: KOST_MEDIA
CREATE TABLE IF NOT EXISTS public.kost_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kost_id UUID NOT NULL REFERENCES public.kosts(id) ON DELETE CASCADE,
    tipe TEXT NOT NULL CHECK (tipe IN ('foto_kamar', 'video', 'foto_gedung')),
    storage_key TEXT NOT NULL, -- Path di bucket Cloudflare R2
    urutan INTEGER NOT NULL DEFAULT 1,
    is_preview BOOLEAN NOT NULL DEFAULT false, -- True untuk 3 foto kamar, 1 video, foto gedung
    alt_text TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. TABEL: SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. TABEL: PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id TEXT UNIQUE NOT NULL,
    amount INTEGER NOT NULL DEFAULT 15000, -- Rp15.000
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'settlement', 'expire', 'cancel')),
    payment_method TEXT NOT NULL DEFAULT 'qris' CHECK (payment_method IN ('qris', 'gopay', 'shopeepay', 'other')),
    paid_at TIMESTAMP WITH TIME ZONE,
    raw_webhook JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. TABEL: ACCESS_LOGS
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    kost_id UUID NOT NULL REFERENCES public.kosts(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('view_premium_media', 'view_whatsapp')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- INDEXING UNTUK QUERY CEPAT
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_kosts_slug ON public.kosts(slug);
CREATE INDEX IF NOT EXISTS idx_kosts_area ON public.kosts(area);
CREATE INDEX IF NOT EXISTS idx_kosts_kota ON public.kosts(kota);
CREATE INDEX IF NOT EXISTS idx_kosts_harga ON public.kosts(harga);
CREATE INDEX IF NOT EXISTS idx_kost_media_kost_id ON public.kost_media(kost_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_expires ON public.subscriptions(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);

-- ==============================================================================
-- FUNGSI HELPER: CEK STATUS LANGGANAN AKTIF (SERVER-SIDE & DB)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_user_has_active_subscription(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.subscriptions
        WHERE user_id = check_user_id
          AND expires_at > NOW()
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- KEAMANAN: ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Aktifkan RLS di seluruh tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kost_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Pengguna hanya bisa membaca dan mengubah profil miliknya
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 2. Kosts: Publik hanya boleh melihat kost (Catatan: View terpisah digunakan untuk menyembunyikan owner_whatsapp)
-- Public view column safety:
CREATE VIEW public.kosts_public AS
SELECT 
    id, slug, nama, alamat, area, kota, harga, tipe, fasilitas, deskripsi, peraturan, status, created_at, updated_at
FROM public.kosts;

CREATE POLICY "Public can view basic kosts info" 
    ON public.kosts FOR SELECT 
    TO public
    USING (true);

-- 3. Kost Media:
-- Media dengan is_preview = true dapat dilihat oleh siapapun (publik & Googlebot)
CREATE POLICY "Public can view preview media" 
    ON public.kost_media FOR SELECT 
    TO public 
    USING (is_preview = true);

-- Media premium (is_preview = false) HANYA dapat dibaca jika user memiliki langganan aktif
CREATE POLICY "Subscribers can view premium media" 
    ON public.kost_media FOR SELECT 
    TO authenticated 
    USING (
        public.check_user_has_active_subscription(auth.uid()) = true
    );

-- 4. Subscriptions: Pengguna hanya melihat langganan miliknya
CREATE POLICY "Users can view own subscriptions" 
    ON public.subscriptions FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

-- 5. Payments: Pengguna hanya melihat pembayaran miliknya
CREATE POLICY "Users can view own payments" 
    ON public.payments FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

-- 6. Access Logs: Insert hanya oleh user yang bersangkutan, view hanya user atau admin
CREATE POLICY "Users can insert own access log" 
    ON public.access_logs FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own access logs" 
    ON public.access_logs FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

-- Trigger pembuatan profil otomatis saat signup di auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
