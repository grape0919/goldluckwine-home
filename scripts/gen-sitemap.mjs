// Supabase의 wines/wineries 목록을 읽어 public/sitemap.xml 을 생성합니다.
// 사용: node scripts/gen-sitemap.mjs
// (.env 의 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 를 사용하며,
//  값이 없으면 정적 페이지만 담은 sitemap 을 생성합니다)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const BASE_URL = 'https://goldluckwine.com';
const STATIC_PATHS = ['/', '/winelist', '/wineries', '/contact'];

// .env / .env.local 에서 Supabase 접속 정보 로드 (dotenv 없이 직접 파싱)
const env = { ...process.env };
for (const name of ['.env', '.env.local']) {
  const file = resolve(root, name);
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) env[m[1]] = m[2];
  }
}

const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

async function fetchIds(table) {
  const res = await fetch(`${url}/rest/v1/${table}?select=id&order=id`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });
  if (!res.ok) {
    throw new Error(`${table} 조회 실패: ${res.status} ${await res.text()}`);
  }
  return (await res.json()).map((row) => row.id);
}

let paths = [...STATIC_PATHS];
if (url && anonKey) {
  const [wineIds, wineryIds] = await Promise.all([
    fetchIds('wines'),
    fetchIds('wineries'),
  ]);
  paths.push(
    ...wineIds.map((id) => `/wines/${id}`),
    ...wineryIds.map((id) => `/wineries/${id}`),
  );
  console.log(
    `Supabase에서 와인 ${wineIds.length}건, 와이너리 ${wineryIds.length}건을 읽었습니다.`,
  );
} else {
  console.warn(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 없어 정적 페이지만 포함합니다.',
  );
}

const today = new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (p) => `  <url>
    <loc>${BASE_URL}${p}</loc>
    <lastmod>${today}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

writeFileSync(resolve(root, 'public/sitemap.xml'), xml);
console.log(`public/sitemap.xml 생성 완료 (URL ${paths.length}개)`);
