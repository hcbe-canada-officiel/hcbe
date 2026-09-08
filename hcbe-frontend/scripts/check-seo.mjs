import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const output = resolve(process.cwd(), 'out');
const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const read = (path) => {
  const absolute = join(output, path);
  expect(existsSync(absolute), `Missing generated file: ${path}`);
  return existsSync(absolute) ? readFileSync(absolute, 'utf8') : '';
};

const inspectPage = (path, expectedCanonical, expectedTitle) => {
  const document = read(path);
  expect(document.includes(`<title>${expectedTitle}</title>`), `${path}: incorrect title`);
  expect(document.includes(`<link rel="canonical" href="${expectedCanonical}"`), `${path}: incorrect canonical URL`);
  expect(document.includes('name="description" content="'), `${path}: missing description`);
  expect(document.includes('name="robots" content="index, follow'), `${path}: missing public robots policy`);
  expect(document.includes('name="viewport" content="width=device-width, initial-scale=1.0"'), `${path}: viewport was modified`);
  expect(document.includes(`property="og:url" content="${expectedCanonical}"`), `${path}: incorrect Open Graph URL`);
  expect(document.includes('id="hcbe-structured-data"'), `${path}: missing structured data`);
  const structuredData = document.match(/<script id="hcbe-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  try {
    const graph = JSON.parse(structuredData ?? '');
    expect(graph['@context'] === 'https://schema.org', `${path}: invalid Schema.org context`);
    expect(Array.isArray(graph['@graph']), `${path}: structured data graph is missing`);
  } catch {
    failures.push(`${path}: structured data is not valid JSON`);
  }
};

inspectPage('index.html', 'https://hcbe.ca/', 'HCBE Canada — Au service de la communauté burkinabè');
inspectPage(join('emplois', 'index.html'), 'https://hcbe.ca/emplois', 'Emplois communautaires | HCBE Canada');
inspectPage(join('actualites', 'evenements', 'index.html'), 'https://hcbe.ca/actualites/evenements', 'Événements communautaires | HCBE Canada');

const sitemap = read('sitemap.xml');
expect(sitemap.includes('<loc>https://hcbe.ca/emplois</loc>'), 'Sitemap is missing the jobs page');
expect(!sitemap.includes('/admin'), 'Sitemap exposes an admin page');
expect(!sitemap.includes('/espace-membre'), 'Sitemap exposes the member portal');

const robots = read('robots.txt');
expect(robots.includes('Disallow: /admin/'), 'robots.txt does not protect admin routes');
expect(robots.includes('Sitemap: https://hcbe.ca/sitemap.xml'), 'robots.txt does not advertise the sitemap');

if (failures.length) {
  console.error(`SEO validation failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('SEO validation passed for generated pages, metadata, structured data, robots and sitemap.');
