import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLink, Reveal, SectionHeading } from '../../../components/ui';

// Les clés i18n restent écrites en toutes lettres : elles doivent rester
// trouvables au grep, la règle anti-doublon de `src/i18n/local/` en dépend.
const domains = [
  {
    id: 'membership',
    icon: 'ri-id-card-line',
    to: '/espace-membre',
    accent: 'red',
    titleKey: 'public.home.features.membership.title',
    descriptionKey: 'public.home.features.membership.description',
  },
  {
    id: 'services',
    icon: 'ri-customer-service-2-line',
    to: '/services',
    accent: 'gold',
    titleKey: 'public.home.features.services.title',
    descriptionKey: 'public.home.features.services.description',
  },
  {
    id: 'events',
    icon: 'ri-ticket-2-line',
    to: '/actualites/evenements',
    accent: 'green',
    titleKey: 'public.home.features.events.title',
    descriptionKey: 'public.home.features.events.description',
  },
  {
    id: 'jobs',
    icon: 'ri-briefcase-4-line',
    to: '/emplois',
    accent: 'red',
    titleKey: 'public.home.features.jobs.title',
    descriptionKey: 'public.home.features.jobs.description',
  },
  {
    id: 'resources',
    icon: 'ri-store-2-line',
    to: '/communaute/ressources',
    accent: 'gold',
    titleKey: 'public.home.features.resources.title',
    descriptionKey: 'public.home.features.resources.description',
  },
  {
    id: 'associations',
    icon: 'ri-community-line',
    to: '/engagement/annuaire',
    accent: 'green',
    titleKey: 'public.home.features.associations.title',
    descriptionKey: 'public.home.features.associations.description',
  },
  {
    id: 'grants',
    icon: 'ri-graduation-cap-line',
    to: '/services/bourses',
    accent: 'red',
    titleKey: 'public.home.features.grants.title',
    descriptionKey: 'public.home.features.grants.description',
  },
  {
    id: 'consultations',
    icon: 'ri-survey-line',
    to: '/engagement/consultations',
    accent: 'gold',
    titleKey: 'public.home.features.consultations.title',
    descriptionKey: 'public.home.features.consultations.description',
  },
] as const;

const accents: Record<(typeof domains)[number]['accent'], string> = {
  red: 'border-red/25 bg-red/[.065] text-red-link group-hover:border-red/50',
  gold: 'border-gold/35 bg-gold/[.11] text-gold-ink group-hover:border-gold/65',
  green: 'border-green/20 bg-green/[.07] text-green group-hover:border-green/45',
};

const MissionVisionSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-28">
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-gold/[0.09] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-green/[0.055] blur-3xl" aria-hidden="true" />
      <div className="container-page">
        <SectionHeading
          title={t('public.home.features.title')}
          description={t('public.home.features.description')}
          action={<ArrowLink to="/services" tone="red">{t('public.home.features.all')}</ArrowLink>}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {domains.map((domain, index) => (
            <Reveal key={domain.id} delay={index * 80} className="h-full">
              <Link
                to={domain.to}
                className="group relative flex h-full min-h-[250px] flex-col overflow-hidden rounded-[24px] border border-green/10 bg-surface p-6 shadow-[0_14px_40px_rgba(0,59,27,.06)] transition duration-300 hover:-translate-y-1 hover:border-green/25 hover:shadow-[0_22px_55px_rgba(0,59,27,.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
              >
                <span className="absolute right-5 top-4 font-display text-[52px] font-bold leading-none text-green/[.035]" aria-hidden="true">0{index + 1}</span>
                <span
                  className={`mb-8 flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] border text-xl transition duration-300 group-hover:scale-105 ${accents[domain.accent]}`}
                >
                  <i className={domain.icon} aria-hidden="true"></i>
                </span>
                <h3 className="max-w-[220px] font-display text-[23px] font-bold leading-[1.08] text-green-deep">{t(domain.titleKey)}</h3>
                <p className="mt-3 text-sm leading-6 text-ink-variant">{t(domain.descriptionKey)}</p>
                <span className="mt-auto flex items-center justify-between pt-7 text-[9px] font-bold uppercase tracking-[.15em] text-red-link">
                  {t('public.home.features.open')}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-green/10 text-base text-green transition group-hover:border-green group-hover:bg-green group-hover:text-white" aria-hidden="true">
                    <i className="ri-arrow-right-up-line" />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionVisionSection;
