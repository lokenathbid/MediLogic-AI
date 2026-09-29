const cp = require('child_process');

const apiKey = process.env.INSFORGE_API_KEY || process.env.API_KEY;
const baseUrl = process.env.INSFORGE_BASE_URL || process.env.API_BASE_URL || 'https://3g2ha7rp.ap-southeast.insforge.app';

if (!apiKey) {
  console.error('Error: Please set the INSFORGE_API_KEY environment variable before running this script.');
  process.exit(1);
}

const sql = `
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('diagnostic_reports', 'user_profiles', 'knowledge_base_conditions')
ORDER BY table_name, ordinal_position;
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
    params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'verify-db', version: '1.0' } }
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
