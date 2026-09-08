import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const output = resolve(process.cwd(), 'out');
const template = readFileSync(join(output, 'index.html'), 'utf8');
const origin = 'https://hcbe.ca';

const pages = [
  ['/', 'HCBE Canada — Au service de la communauté burkinabè', 'Le HCBE Canada représente, accompagne et mobilise la diaspora burkinabè partout au Canada.', 'weekly', '1.0'],
  ['/services', 'Services aux Burkinabè du Canada | HCBE Canada', 'Accompagnement, ressources et services communautaires offerts par le HCBE Canada.', 'monthly', '0.9'],
  ['/services/documents-officiels', 'Documents officiels | HCBE Canada', 'Téléchargez les formulaires, rapports et documents officiels publiés par le HCBE Canada.', 'monthly', '0.7'],
  ['/services/comites', 'Comités spécialisés | HCBE Canada', 'Découvrez les comités du HCBE Canada et les services qu’ils offrent à la communauté.', 'monthly', '0.7'],
  ['/services/bourses', 'Bourses et subventions | HCBE Canada', 'Trouvez des possibilités de financement pour les membres et organismes de la communauté.', 'weekly', '0.8'],
  ['/actualites', 'Actualités du HCBE Canada', 'Actualités, annonces, événements et initiatives de la communauté burkinabè au Canada.', 'daily', '0.9'],
  ['/actualites/evenements', 'Événements communautaires | HCBE Canada', 'Rencontres, formations, festivals et activités de la communauté burkinabè au Canada.', 'daily', '0.9'],
  ['/actualites/annonces', 'Annonces et actualités | HCBE Canada', 'Consultez les dernières annonces et nouvelles du HCBE Canada.', 'daily', '0.8'],
  ['/actualites/souvenirs', 'Souvenirs de la communauté | HCBE Canada', 'Photos et moments marquants des activités du HCBE Canada.', 'monthly', '0.6'],
  ['/engagement', 'Engagement communautaire | HCBE Canada', 'Associations, projets, emplois et consultations pour agir dans la communauté burkinabè au Canada.', 'weekly', '0.9'],
  ['/engagement/annuaire', 'Annuaire des associations | HCBE Canada', 'Découvrez les associations burkinabè et communautaires présentes partout au Canada.', 'weekly', '0.8'],
  ['/engagement/projets', 'Projets communautaires | HCBE Canada', 'Suivez les projets du HCBE Canada et découvrez comment y contribuer.', 'weekly', '0.8'],
  ['/engagement/consultations', 'Consultations communautaires | HCBE Canada', 'Consultez les propositions ouvertes et participez aux décisions communautaires.', 'weekly', '0.8'],
  ['/emplois', 'Emplois communautaires | HCBE Canada', 'Consultez les offres d’emploi destinées à la communauté burkinabè au Canada et postulez comme membre.', 'daily', '0.9'],
  ['/communaute/ressources', 'Ressources et entreprises communautaires | HCBE Canada', 'Trouvez des entreprises, professionnels et ressources de confiance dans la communauté.', 'weekly', '0.8'],
  ['/contribuer', 'Contribuer au HCBE Canada', 'Soutenez les activités et projets communautaires du HCBE Canada par une contribution sécurisée.', 'monthly', '0.7'],
  ['/contact', 'Contacter le HCBE Canada', 'Communiquez avec le HCBE Canada pour obtenir de l’aide, proposer une initiative ou poser une question.', 'yearly', '0.7'],
  ['/confidentialite', 'Confidentialité et Loi 25 | HCBE Canada', 'Découvrez comment le HCBE Canada protège vos renseignements personnels et exercez vos droits.', 'yearly', '0.4'],
];

const html = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

for (const [path, title, description] of pages) {
  const canonical = `${origin}${path}`;
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${origin}/#organization`, name: 'HCBE Canada', alternateName: "Haut Conseil des Burkinabè de l'Extérieur au Canada", url: `${origin}/`, logo: { '@type': 'ImageObject', url: `${origin}/hcbe-app-icon-512.png`, width: 512, height: 512 }, email: 'contact@hcbe.ca', areaServed: 'CA', sameAs: ['https://www.facebook.com/profile.php?id=61574642099104'] },
      { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: 'HCBE Canada', publisher: { '@id': `${origin}/#organization` }, inLanguage: ['fr-CA', 'en-CA'] },
      { '@type': path === '/contact' ? 'ContactPage' : path === '/confidentialite' ? 'AboutPage' : 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: title, description, isPartOf: { '@id': `${origin}/#website` } },
    ],
  };
  let document = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${html(title)}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*("\s*\/?>)/, `$1${canonical}$2`);
  document = document.replace(/(<meta name="description" content=")[^"]*("\s*\/?>)/, `$1${html(description)}$2`);
  for (const property of ['og:title', 'twitter:title']) document = document.replace(new RegExp(`(<meta (?:property|name)="${property}" content=")[^"]*("\\s*\\/?>)`), `$1${html(title)}$2`);
  for (const property of ['og:description', 'twitter:description']) document = document.replace(new RegExp(`(<meta (?:property|name)="${property}" content=")[^"]*("\\s*\\/?>)`), `$1${html(description)}$2`);
  document = document.replace(/(<meta property="og:url" content=")[^"]*("\s*\/?>)/, `$1${canonical}$2`);
  document = document.replace(/<script id="hcbe-structured-data" type="application\/ld\+json">[\s\S]*?<\/script>/, `<script id="hcbe-structured-data" type="application/ld+json">${JSON.stringify(graph).replaceAll('<', '\\u003c')}</script>`);
  const destination = path === '/' ? join(output, 'index.html') : join(output, path.slice(1), 'index.html');
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, document);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(([path, , , changefreq, priority]) => `  <url><loc>${origin}${path}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`).join('\n')}\n</urlset>\n`;
writeFileSync(join(output, 'sitemap.xml'), sitemap);
console.log(`Generated SEO entry documents for ${pages.length} public routes.`);
