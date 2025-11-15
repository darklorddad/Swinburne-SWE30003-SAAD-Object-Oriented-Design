-- =================================================================
-- PART 1: RESET DATABASE
-- Safely drops all existing public tables and functions.
-- =================================================================
DROP FUNCTION IF EXISTS public.decrement_stock;
DROP FUNCTION IF EXISTS public.increment_stock;
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.merchandise;
DROP TABLE IF EXISTS public.ticket_types;
DROP TABLE IF EXISTS public.parks;
DROP TABLE IF EXISTS public.users;


-- =================================================================
-- PART 2: RECREATE SCHEMA
-- Creates all tables and functions from scratch.
-- =================================================================

-- Create 'users' profile table
CREATE TABLE public.users (
    id uuid NOT NULL, email text NOT NULL, full_name text NULL, is_active boolean NOT NULL DEFAULT true, is_admin boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id), CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE, CONSTRAINT users_email_key UNIQUE (email)
);
-- Create 'parks' table
CREATE TABLE public.parks (
    id uuid NOT NULL DEFAULT uuid_generate_v4(), name text NOT NULL, location text NULL, description text NULL, created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT parks_pkey PRIMARY KEY (id)
);
-- Create 'ticket_types' table
CREATE TABLE public.ticket_types (
    id uuid NOT NULL DEFAULT uuid_generate_v4(), park_id uuid NOT NULL, name text NOT NULL, price numeric NOT NULL, is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ticket_types_pkey PRIMARY KEY (id), CONSTRAINT ticket_types_park_id_fkey FOREIGN KEY (park_id) REFERENCES parks(id)
);
-- Create 'merchandise' table
CREATE TABLE public.merchandise (
    id uuid NOT NULL DEFAULT uuid_generate_v4(), park_id uuid NOT NULL, name text NOT NULL, description text NULL, price numeric NOT NULL, stock integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT merchandise_pkey PRIMARY KEY (id), CONSTRAINT merchandise_park_id_fkey FOREIGN KEY (park_id) REFERENCES parks(id)
);
-- Create 'orders' table
CREATE TABLE public.orders (
    id uuid NOT NULL DEFAULT uuid_generate_v4(), customer_id uuid NOT NULL, status text NOT NULL, total_amount numeric NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT orders_pkey PRIMARY KEY (id), CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Create 'order_items' table
CREATE TABLE public.order_items (
    id uuid NOT NULL DEFAULT uuid_generate_v4(), order_id uuid NOT NULL, ticket_type_id uuid NULL, merchandise_id uuid NULL, quantity integer NOT NULL, visit_date date NULL, price_at_purchase numeric NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT order_items_pkey PRIMARY KEY (id), CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id), CONSTRAINT order_items_ticket_type_id_fkey FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id), CONSTRAINT order_items_merchandise_id_fkey FOREIGN KEY (merchandise_id) REFERENCES merchandise(id),
    CONSTRAINT check_item_type CHECK (((ticket_type_id IS NOT NULL) AND (merchandise_id IS NULL)) OR ((ticket_type_id IS NULL) AND (merchandise_id IS NOT NULL)))
);
-- Create stock management functions
CREATE OR REPLACE FUNCTION decrement_stock(merch_id uuid, decrement_by int) RETURNS void LANGUAGE plpgsql AS $$ BEGIN UPDATE public.merchandise SET stock = stock - decrement_by WHERE id = merch_id; END; $$;
CREATE OR REPLACE FUNCTION increment_stock(merch_id uuid, increment_by int) RETURNS void LANGUAGE plpgsql AS $$ BEGIN UPDATE public.merchandise SET stock = stock + increment_by WHERE id = merch_id; END; $$;

-- =================================================================
-- PART 3: SEED SAMPLE DATA
-- Fills the tables with sample data for testing.
-- =================================================================
DO $$
DECLARE
    -- !!! IMPORTANT: REPLACE THESE PLACEHOLDERS WITH THE UUIDs YOU COPIED !!!
    admin_user_id uuid := 'YOUR_ADMIN_USER_ID_HERE';
    customer_user_id uuid := 'YOUR_CUSTOMER_USER_ID_HERE';

    bako_park_id uuid;
    mulu_park_id uuid;
    niah_park_id uuid;
    
    bako_adult_ticket_id uuid;
    bako_child_ticket_id uuid;
    mulu_adult_ticket_id uuid;
    
    bako_tshirt_id uuid;
    mulu_cap_id uuid;
    
    order1_id uuid;
    order2_id uuid;
BEGIN
    -- Seed User Profiles
    INSERT INTO public.users (id, email, full_name, is_admin) VALUES
    (admin_user_id, 'admin@example.com', 'Admin User', true),
    (customer_user_id, 'customer@example.com', 'Normal Customer', false);

    -- Seed Parks and capture their new IDs
    INSERT INTO public.parks (name, location, description) VALUES
    ('Bako National Park', 'Sarawak, Malaysia', 'Famous for its extraordinary wildlife, including the proboscis monkey.') RETURNING id INTO bako_park_id;
    
    INSERT INTO public.parks (name, location, description) VALUES
    ('Mulu National Park', 'Sarawak, Malaysia', 'A UNESCO World Heritage site, famous for its caves and karst formations.') RETURNING id INTO mulu_park_id;
    
    INSERT INTO public.parks (name, location, description) VALUES
    ('Niah National Park', 'Sarawak, Malaysia', 'Site of the Niah Caves, one of the most important archaeological sites in the world.') RETURNING id INTO niah_park_id;

    -- Seed Ticket Types for Parks (Corrected Section)
    INSERT INTO public.ticket_types (park_id, name, price) VALUES
    (bako_park_id, 'Adult Entrance', 20.00) RETURNING id INTO bako_adult_ticket_id;
    
    INSERT INTO public.ticket_types (park_id, name, price) VALUES
    (bako_park_id, 'Child Entrance', 7.00) RETURNING id INTO bako_child_ticket_id;
    
    INSERT INTO public.ticket_types (park_id, name, price) VALUES
    (mulu_park_id, 'Adult Entrance', 30.00) RETURNING id INTO mulu_adult_ticket_id;

    -- Seed Merchandise for Parks
    INSERT INTO public.merchandise (park_id, name, description, price, stock) VALUES
    (bako_park_id, 'Bako Park T-Shirt', 'A high-quality cotton t-shirt with a proboscis monkey print.', 55.00, 100)
    RETURNING id INTO bako_tshirt_id;
    
    INSERT INTO public.merchandise (park_id, name, description, price, stock) VALUES
    (mulu_park_id, 'Mulu Caves Cap', 'A durable cap, perfect for exploring.', 45.00, 50)
    RETURNING id INTO mulu_cap_id;

    -- Seed Orders for the customer user and capture their IDs
    INSERT INTO public.orders (customer_id, status, total_amount) VALUES
    (customer_user_id, 'pending', 95.00) RETURNING id INTO order1_id;
    
    INSERT INTO public.orders (customer_id, status, total_amount) VALUES
    (customer_user_id, 'cancelled', 45.00) RETURNING id INTO order2_id;
    
    -- Seed Order Items for the orders
    INSERT INTO public.order_items (order_id, ticket_type_id, quantity, visit_date, price_at_purchase) VALUES
    (order1_id, bako_adult_ticket_id, 2, '2025-12-25', 20.00);
    
    INSERT INTO public.order_items (order_id, merchandise_id, quantity, price_at_purchase) VALUES
    (order1_id, bako_tshirt_id, 1, 55.00);
    
    INSERT INTO public.order_items (order_id, merchandise_id, quantity, price_at_purchase) VALUES
    (order2_id, mulu_cap_id, 1, 45.00);

END $$;