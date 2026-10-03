const cp = require('child_process');

const apiKey = process.env.INSFORGE_API_KEY || process.env.API_KEY;
const baseUrl = process.env.INSFORGE_BASE_URL || process.env.API_BASE_URL || 'https://3g2ha7rp.ap-southeast.insforge.app';

if (!apiKey) {
  console.error('Error: Please set the INSFORGE_API_KEY environment variable before running this script.');
  process.exit(1);
}

const sql = `
CREATE TABLE IF NOT EXISTS diagnostic_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  patient_name TEXT,
  patient_age INT,
  patient_gender TEXT,
  symptoms JSONB DEFAULT '[]'::jsonb,
  primary_condition JSONB,
  differential_conditions JSONB DEFAULT '[]'::jsonb,
  matched_symptoms JSONB DEFAULT '[]'::jsonb,
  unmatched_symptoms JSONB DEFAULT '[]'::jsonb,
  risk_level TEXT DEFAULT 'low',
  recommendations JSONB DEFAULT '[]'::jsonb,
  triage_level TEXT DEFAULT 'routine',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  age INT,
  gender TEXT,
  blood_group TEXT,
  allergies TEXT,
  medical_history TEXT,
  emergency_contact TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

CREATE TABLE IF NOT EXISTS knowledge_base_conditions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  required_symptoms JSONB DEFAULT '[]'::jsonb,
  characteristic_symptoms JSONB DEFAULT '[]'::jsonb,
  optional_symptoms JSONB DEFAULT '[]'::jsonb,
  risk_level TEXT DEFAULT 'moderate',
  recommended_specialist TEXT,
  clinical_notes TEXT,
  lifestyle_guidance JSONB DEFAULT '[]'::jsonb,
  warning_signs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Security & RLS Helper Functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.user_profiles WHERE id = auth.uid()::text),
    false
  );
$$;

-- Trigger to prevent client-side tampering of role in user_profiles
CREATE OR REPLACE FUNCTION public.protect_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized: only an administrator can change user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_protect_user_role ON public.user_profiles;
CREATE TRIGGER trigger_protect_user_role
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_user_role();

-- Trigger to ensure default user role on profile insert unless admin
CREATE OR REPLACE FUNCTION public.enforce_user_role_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    IF NOT public.is_admin() THEN
      NEW.role := 'user';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_enforce_user_role_insert ON public.user_profiles;
CREATE TRIGGER trigger_enforce_user_role_insert
  BEFORE INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_user_role_insert();

-- Automatic sync trigger: whenever a new user signs up in auth.users, create their user_profiles row
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, role)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.profile->>'name', split_part(NEW.email, '@', 1)),
    'user'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = CASE 
      WHEN public.user_profiles.name IS NULL OR public.user_profiles.name = '' 
      THEN EXCLUDED.name 
      ELSE public.user_profiles.name 
    END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- Secure Admin Directory View: primary source is auth.users
CREATE OR REPLACE VIEW public.admin_user_directory AS
SELECT 
  u.id::text AS id,
  u.email,
  COALESCE(p.name, u.profile->>'name', split_part(u.email, '@', 1)) AS name,
  p.age,
  COALESCE(p.gender, 'Unspecified') AS gender,
  p.blood_group,
  p.allergies,
  p.medical_history,
  p.emergency_contact,
  COALESCE(p.role, 'user') AS role,
  COALESCE(p.updated_at, u.updated_at, u.created_at) AS profile_updated_at,
  COALESCE(u.email_verified, false) AS email_verified,
  u.created_at AS account_created_at
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id::uuid;

REVOKE ALL ON public.admin_user_directory FROM anon, authenticated;
GRANT SELECT ON public.admin_user_directory TO postgres, project_admin;

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_conditions ENABLE ROW LEVEL SECURITY;

`;

const p = cp.spawn('npx.cmd', [
  '-y',
  '@insforge/mcp@latest',
  '--api_key',
  apiKey,
  '--api_base_url',
  baseUrl
], { shell: true });

let buf = '';
p.stdout.on('data', d => { buf += d.toString(); });
p.stderr.on('data', d => { console.error('STDERR:', d.toString()); });

setTimeout(() => {
  p.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'setup-db', version: '1.0' } }
  }) + '\n');
}, 1000);

setTimeout(() => {
  p.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'run-raw-sql',
      arguments: { query: sql }
    }
  }) + '\n');
}, 2000);

setTimeout(() => {
  console.log('OUTPUT:');
  console.log(buf);
  p.kill();
  process.exit(0);
}, 6000);
