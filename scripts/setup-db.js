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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
