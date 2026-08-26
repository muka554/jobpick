import { readFile, writeFile } from 'node:fs/promises';

const source = await readFile('/home/ubuntu/jobpick/supabase/functions/auth-failure-alert/index.ts', 'utf8');
const request = {
  project_id: 'rvitqbkgtgjharxqaxmv',
  name: 'auth-failure-alert',
  verify_jwt: true,
  entrypoint_path: 'index.ts',
  files: [
    { name: 'index.ts', content: source }
  ]
};
await writeFile('/home/ubuntu/deploy_jobpick_auth_failure_alert.json', JSON.stringify(request));
