// 빌드(vite-react-ssg) 결과 dist 를 스캔해 sitemap.xml 을 생성한다.
// 프리렌더된 경로 = sitemap 이므로 항상 실제 페이지와 일치한다.
// build 스크립트 마지막에 실행: node scripts/gen-sitemap.mjs
import {
  readdirSync,
  writeFileSync,
  existsSync,
  statSync,
  copyFileSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const distDir = resolve(root, 'dist');
const BASE_URL = 'https://goldluckwine.com';
// 색인 대상에서 제외할 경로 (있어도 sitemap 에는 넣지 않음)
const EXCLUDE = new Set(['/404', '/not-found']);

if (!existsSync(distDir)) {
  console.warn('[gen-sitemap] dist 가 없어 건너뜁니다. 먼저 빌드하세요.');
  process.exit(0);
}

/** dist 하위의 모든 index.html 을 찾아 사이트 경로로 변환 */
function collectPaths(dir) {
  const paths = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      paths.push(...collectPaths(full));
    } else if (entry.name === 'index.html') {
      const rel = relative(distDir, dir).replace(/\\/g, '/');
      paths.push(rel === '' ? '/' : `/${rel}`);
    }
  }
  return paths;
}

const today = new Date().toISOString().slice(0, 10);
const paths = collectPaths(distDir)
  .filter((p) => !EXCLUDE.has(p))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (p) => `  <url>
    <loc>${BASE_URL}${p === '/' ? '/' : p}</loc>
    <lastmod>${today}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const outFile = resolve(distDir, 'sitemap.xml');
writeFileSync(outFile, xml);
// 참고용으로 소스(public)도 갱신해 두면 git diff 로 변화가 보인다
const publicFile = resolve(root, 'public/sitemap.xml');
if (existsSync(dirname(publicFile))) writeFileSync(publicFile, xml);

console.log(`[gen-sitemap] ${paths.length}개 URL로 sitemap.xml 생성 완료`);

// 프리렌더된 /not-found 를 Vercel 정적 404 페이지로 복사 —
// 알 수 없는 URL이 200(홈 HTML)이 아니라 진짜 404 로 응답하게 한다
const notFoundHtml = resolve(distDir, 'not-found/index.html');
if (existsSync(notFoundHtml)) {
  copyFileSync(notFoundHtml, resolve(distDir, '404.html'));
  console.log('[gen-sitemap] dist/404.html 생성 완료');
} else {
  console.warn('[gen-sitemap] dist/not-found/index.html 이 없어 404.html 을 건너뜁니다.');
}
