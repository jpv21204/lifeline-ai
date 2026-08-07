-- ========================================================
-- LifeLine AI - Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up tables
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE NOT NULL,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    age INTEGER,
    gender TEXT,
    location TEXT,
    state TEXT DEFAULT 'Telangana',
    language TEXT DEFAULT 'en',
    income TEXT,
    occupation TEXT,
    existing_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. CONSULTATIONS / MEDICAL HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    symptoms TEXT NOT NULL,
    urgency TEXT DEFAULT 'Low',
    summary TEXT,
    action_plan JSONB,
    agent_results JSONB,
    response_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON public.consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON public.consultations(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Permissive policies for anon / authenticated access
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update access to profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Allow public read access to consultations" ON public.consultations FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update/delete access to consultations" ON public.consultations FOR ALL USING (true);
