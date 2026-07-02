// 기존 더미 데이터(src/dummy/*.ts)를 읽어 supabase/seed.sql 을 생성합니다.
// 사용: node scripts/gen-seed.mjs
// (esbuild 는 vite 의 의존성으로 이미 설치되어 있습니다)
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const srcDir = resolve(root, 'src');

const result = await build({
  entryPoints: [resolve(__dirname, '_seed-entry.ts')],
  bundle: true,
  format: 'esm',
  write: false,
  platform: 'node',
  alias: { '@': srcDir },
});

const code = result.outputFiles[0].text;
const mod = await import(
  'data:text/javascript;base64,' + Buffer.from(code).toString('base64')
);
const { wines, wineriesData } = mod;

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const arr = (a) => `ARRAY[${a.map(q).join(', ')}]::text[]`;

let sql = `-- 자동 생성 (scripts/gen-seed.mjs) — 기존 더미 데이터를 Supabase 로 이관
-- 실행: schema.sql 적용 후 SQL Editor 에 붙여넣고 Run
begin;

-- 도멘(와이너리) 삽입. 기존 dummy id 를 sort_order 로 보존합니다.
`;

// 도멘: 기존 dummy id(1..5)를 domaine 으로 매핑하기 위해 임시로 sort_order 에 저장
for (const w of wineriesData) {
  sql += `insert into public.wineries (domaine, domaine_kr, location, description, image_path, sort_order)
values (${q(w.domaine)}, ${q(w.domaineKR)}, ${q(w.location)}, ${q(w.description)}, ${q(w.imagePath)}, ${w.id});\n`;
}

sql += `\n-- 와인 삽입. dummy wineryId 를 방금 넣은 도멘(sort_order 로 매칭)의 실제 id 로 연결합니다.\n-- 처음 3개 와인은 홈 'OUR COLLECTION' 노출용으로 is_featured 를 켭니다.\n`;
for (const [i, wine] of wines.entries()) {
  const featured = i < 3;
  sql += `insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, ${q(wine.wineNameEN)}, ${q(wine.wineNameKR)}, ${q(wine.wineType)}, ${arr(wine.wineVariety)}, ${q(wine.wineDescription)}, ${q(wine.wineImagePath)}, ${wine.wineId}, ${featured}
from public.wineries where sort_order = ${wine.wineryId};\n`;
}

sql += `\ncommit;\n`;

const out = resolve(root, 'supabase', 'seed.sql');
writeFileSync(out, sql, 'utf8');
console.log(`wrote ${out} (${wineriesData.length} wineries, ${wines.length} wines)`);
