import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCmsContent } from '../contexts/CmsContentContext';

type Locale = 'fr' | 'en';
type SeoPageType = 'WebPage' | 'CollectionPage' | 'ContactPage' | 'AboutPage';
type LocalizedText = Record<Locale, string>;

interface RouteSeo {
  match: (pathname: string) => boolean;
  key: string;
  title: LocalizedText;
  description: LocalizedText;
  type?: SeoPageType;
  noIndex?: boolean;
}

const exact = (path: string) => (pathname: string) => pathname === path;
const starts = (path: string) => (pathname: string) => pathname.startsWith(path);
const routes: RouteSeo[] = [
  { match: starts('/admin'), key: 'admin', noIndex: true, title: { fr: 'Administration', en: 'Administration' }, description: { fr: 'Espace administratif sécurisé du HCBE Canada.', en: 'Secure HCBE Canada administration workspace.' } },
  { match: exact('/espace-membre'), key: 'member', noIndex: true, title: { fr: 'Espace membre', en: 'Member portal' }, description: { fr: 'Espace personnel sécurisé des membres du HCBE Canada.', en: 'Secure personal portal for HCBE Canada members.' } },
  { match: starts('/paiement/'), key: 'payment', noIndex: true, title: { fr: 'Confirmation de paiement', en: 'Payment confirmation' }, description: { fr: 'Confirmation sécurisée de votre transaction.', en: 'Secure confirmation of your transaction.' } },
  { match: starts('/adhesion/verifier/'), key: 'membership-verification', noIndex: true, title: { fr: 'Vérification d’adhésion', en: 'Membership verification' }, description: { fr: 'Vérification sécurisée d’une adhésion au HCBE Canada.', en: 'Secure verification of an HCBE Canada membership.' } },
  { match: starts('/billets/commande/'), key: 'ticket-order', noIndex: true, title: { fr: 'Commande de billets', en: 'Ticket order' }, description: { fr: 'Commande sécurisée de billets.', en: 'Secure ticket order.' } },
  { match: starts('/actualites/evenements/'), key: 'event-detail', title: { fr: 'Événement communautaire', en: 'Community event' }, description: { fr: 'Détails, horaire et inscription à un événement du HCBE Canada.', en: 'Details, schedule, and registration for an HCBE Canada event.' } },
  { match: exact('/actualites/evenements'), key: 'events', type: 'CollectionPage', title: { fr: 'Événements communautaires', en: 'Community events' }, description: { fr: 'Rencontres, formations, festivals et activités de la communauté burkinabè au Canada.', en: 'Meetings, training, festivals, and activities for the Burkinabè community in Canada.' } },
  { match: starts('/actualites/annonces/'), key: 'announcement-detail', title: { fr: 'Actualité communautaire', en: 'Community news' }, description: { fr: 'Actualité et information officielle du HCBE Canada.', en: 'News and official information from HCBE Canada.' } },
  { match: exact('/actualites/annonces'), key: 'announcements', type: 'CollectionPage', title: { fr: 'Annonces et actualités', en: 'Announcements and news' }, description: { fr: 'Consultez les dernières annonces et nouvelles du HCBE Canada.', en: 'Read the latest HCBE Canada announcements and news.' } },
  { match: exact('/actualites/souvenirs'), key: 'memories', type: 'CollectionPage', title: { fr: 'Souvenirs de la communauté', en: 'Community memories' }, description: { fr: 'Photos et moments marquants des activités du HCBE Canada.', en: 'Photos and highlights from HCBE Canada activities.' } },
  { match: exact('/actualites'), key: 'news', type: 'CollectionPage', title: { fr: 'Actualités du HCBE Canada', en: 'HCBE Canada news' }, description: { fr: 'Actualités, annonces, événements et initiatives de la communauté burkinabè au Canada.', en: 'News, announcements, events, and initiatives from the Burkinabè community in Canada.' } },
  { match: exact('/services/documents-officiels'), key: 'documents', type: 'CollectionPage', title: { fr: 'Documents officiels', en: 'Official documents' }, description: { fr: 'Téléchargez les formulaires, rapports et documents officiels publiés par le HCBE Canada.', en: 'Download official forms, reports, and documents published by HCBE Canada.' } },
  { match: exact('/services/comites'), key: 'committees', type: 'CollectionPage', title: { fr: 'Comités spécialisés', en: 'Specialized committees' }, description: { fr: 'Découvrez les comités du HCBE Canada et les services qu’ils offrent à la communauté.', en: 'Discover HCBE Canada committees and the services they provide to the community.' } },
  { match: exact('/services/bourses'), key: 'grants', type: 'CollectionPage', title: { fr: 'Bourses et subventions', en: 'Grants and scholarships' }, description: { fr: 'Trouvez des possibilités de financement pour les membres et organismes de la communauté.', en: 'Find funding opportunities for community members and organizations.' } },
  { match: exact('/services'), key: 'services', type: 'CollectionPage', title: { fr: 'Services aux Burkinabè du Canada', en: 'Services for Burkinabè people in Canada' }, description: { fr: 'Accompagnement, ressources et services communautaires offerts par le HCBE Canada.', en: 'Support, resources, and community services provided by HCBE Canada.' } },
  { match: exact('/engagement/annuaire'), key: 'associations', type: 'CollectionPage', title: { fr: 'Annuaire des associations', en: 'Association directory' }, description: { fr: 'Découvrez les associations burkinabè et communautaires présentes partout au Canada.', en: 'Discover Burkinabè and community associations across Canada.' } },
  { match: exact('/engagement/projets'), key: 'projects', type: 'CollectionPage', title: { fr: 'Projets communautaires', en: 'Community projects' }, description: { fr: 'Suivez les projets du HCBE Canada et découvrez comment y contribuer.', en: 'Follow HCBE Canada projects and discover how to contribute.' } },
  { match: starts('/projet/'), key: 'project-detail', title: { fr: 'Projet communautaire', en: 'Community project' }, description: { fr: 'Découvrez un projet porté par la communauté du HCBE Canada.', en: 'Discover a project led by the HCBE Canada community.' } },
  { match: starts('/engagement/consultations/'), key: 'consultation-detail', title: { fr: 'Consultation communautaire', en: 'Community consultation' }, description: { fr: 'Participez à une consultation du HCBE Canada.', en: 'Take part in an HCBE Canada community consultation.' } },
  { match: exact('/engagement/consultations'), key: 'consultations', type: 'CollectionPage', title: { fr: 'Consultations communautaires', en: 'Community consultations' }, description: { fr: 'Consultez les propositions ouvertes et participez aux décisions communautaires.', en: 'Review open proposals and take part in community decisions.' } },
  { match: exact('/engagement'), key: 'engagement', type: 'CollectionPage', title: { fr: 'Engagement communautaire', en: 'Community engagement' }, description: { fr: 'Associations, projets, emplois et consultations pour agir dans la communauté burkinabè au Canada.', en: 'Associations, projects, jobs, and consultations for getting involved in Canada’s Burkinabè community.' } },
  { match: exact('/emplois'), key: 'jobs', type: 'CollectionPage', title: { fr: 'Emplois communautaires', en: 'Community jobs' }, description: { fr: 'Consultez les offres d’emploi destinées à la communauté burkinabè au Canada et postulez comme membre.', en: 'Browse jobs for the Burkinabè community in Canada and apply as an HCBE member.' } },
  { match: exact('/communaute/ressources'), key: 'resources', type: 'CollectionPage', title: { fr: 'Ressources et entreprises communautaires', en: 'Community resources and businesses' }, description: { fr: 'Trouvez des entreprises, professionnels et ressources de confiance dans la communauté.', en: 'Find trusted businesses, professionals, and resources in the community.' } },
  { match: exact('/contribuer'), key: 'contribute', title: { fr: 'Contribuer au HCBE Canada', en: 'Support HCBE Canada' }, description: { fr: 'Soutenez les activités et projets communautaires du HCBE Canada par une contribution sécurisée.', en: 'Support HCBE Canada community activities and projects with a secure contribution.' } },
  { match: exact('/confidentialite'), key: 'privacy', type: 'AboutPage', title: { fr: 'Confidentialité et Loi 25', en: 'Privacy and Law 25' }, description: { fr: 'Découvrez comment le HCBE Canada protège vos renseignements personnels et exercez vos droits.', en: 'Learn how HCBE Canada protects your personal information and how to exercise your rights.' } },
  { match: exact('/contact'), key: 'contact', type: 'ContactPage', title: { fr: 'Contacter le HCBE Canada', en: 'Contact HCBE Canada' }, description: { fr: 'Communiquez avec le HCBE Canada pour obtenir de l’aide, proposer une initiative ou poser une question.', en: 'Contact HCBE Canada for support, to propose an initiative, or to ask a question.' } },
  { match: exact('/'), key: 'home', title: { fr: 'HCBE Canada — Au service de la communauté burkinabè', en: 'HCBE Canada — Serving the Burkinabè community' }, description: { fr: 'Le HCBE Canada représente, accompagne et mobilise la diaspora burkinabè partout au Canada.', en: 'HCBE Canada represents, supports, and connects the Burkinabè diaspora across Canada.' } },
];

const fallback: RouteSeo = {
  match: () => true,
  key: 'global',
  noIndex: true,
  title: { fr: 'Page introuvable', en: 'Page not found' },
  description: { fr: 'Cette page n’est pas disponible.', en: 'This page is not available.' },
};

const origin = 'https://hcbe.ca';
const defaultImage = `${origin}/hcbe-app-icon-512.png`;

const upsertMeta = (attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
};

const upsertLink = (rel: string, href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
};

type StructuredData = Record<string, unknown>;

const setStructuredData = (title: string, description: string, url: string, type: SeoPageType, mainEntity?: StructuredData) => {
  let script = document.head.querySelector<HTMLScriptElement>('#hcbe-structured-data');
  if (!script) {
    script = document.createElement('script');
    script.id = 'hcbe-structured-data';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.text = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${origin}/#organization`, name: 'HCBE Canada', alternateName: "Haut Conseil des Burkinabè de l'Extérieur au Canada", url: `${origin}/`, logo: { '@type': 'ImageObject', url: defaultImage, width: 512, height: 512 }, email: 'contact@hcbe.ca', areaServed: 'CA', sameAs: ['https://www.facebook.com/profile.php?id=61574642099104'] },
      { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: 'HCBE Canada', publisher: { '@id': `${origin}/#organization` }, inLanguage: ['fr-CA', 'en-CA'] },
      { '@type': type, '@id': `${url}#webpage`, url, name: title, description, isPartOf: { '@id': `${origin}/#website` }, about: { '@id': `${origin}/#organization` }, ...(mainEntity ? { mainEntity: { '@id': `${url}#main-entity` } } : {}) },
      ...(mainEntity ? [{ '@id': `${url}#main-entity`, url, ...mainEntity }] : []),
    ],
  });
};

export const applySeo = ({ title, description, pathname, locale, type = 'WebPage', noIndex = false, image, mainEntity }: { title: string; description: string; pathname: string; locale: Locale; type?: SeoPageType; noIndex?: boolean; image?: string; mainEntity?: StructuredData }) => {
  const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const canonical = `${origin}${cleanPath}`;
  const fullTitle = title.includes('HCBE Canada') ? title : `${title} | HCBE Canada`;
  const socialImage = image ? new URL(image, origin).href : defaultImage;
  document.title = fullTitle;
  upsertMeta('name', 'description', description);
  upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow, noarchive' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  upsertMeta('name', 'author', 'HCBE Canada');
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:site_name', 'HCBE Canada');
  upsertMeta('property', 'og:url', canonical);
  upsertMeta('property', 'og:title', fullTitle);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:image', socialImage);
  if (image) {
    document.head.querySelector('meta[property="og:image:width"]')?.remove();
    document.head.querySelector('meta[property="og:image:height"]')?.remove();
  } else {
    upsertMeta('property', 'og:image:width', '512');
    upsertMeta('property', 'og:image:height', '512');
  }
  upsertMeta('property', 'og:image:alt', 'HCBE Canada');
  upsertMeta('property', 'og:locale', locale === 'fr' ? 'fr_CA' : 'en_CA');
  upsertMeta('property', 'og:locale:alternate', locale === 'fr' ? 'en_CA' : 'fr_CA');
  upsertMeta('name', 'twitter:card', 'summary');
  upsertMeta('name', 'twitter:title', fullTitle);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', socialImage);
  upsertLink('canonical', canonical);
  setStructuredData(fullTitle, description, canonical, type, mainEntity);
};

export const usePageSeo = ({ enabled = true, title, description, image, mainEntity }: { enabled?: boolean; title: string; description: string; image?: string; mainEntity?: StructuredData }) => {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const locale: Locale = i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'fr';
  useEffect(() => {
    if (!enabled || !title || !description) return;
    document.documentElement.dataset.hcbeDynamicSeo = pathname;
    applySeo({ title, description, pathname, locale, image, mainEntity });
    return () => {
      if (document.documentElement.dataset.hcbeDynamicSeo === pathname) delete document.documentElement.dataset.hcbeDynamicSeo;
    };
  }, [description, enabled, image, locale, mainEntity, pathname, title]);
};

export default function SeoManager() {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const { getValue } = useCmsContent();
  const locale: Locale = i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'fr';
  const route = routes.find((candidate) => candidate.match(pathname)) ?? fallback;

  useEffect(() => {
    if (document.documentElement.dataset.hcbeDynamicSeo === pathname) return;
    const title = getValue(`seo.${route.key}.title`, route.title[locale]);
    const description = getValue(`seo.${route.key}.description`, route.description[locale]);
    applySeo({ title, description, pathname, locale, type: route.type, noIndex: route.noIndex });
  }, [getValue, locale, pathname, route]);

  return null;
}
