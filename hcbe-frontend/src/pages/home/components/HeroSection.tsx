import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, ArrowLink, PageHeader, StatBar, Reveal } from '../../../components/ui';
import { HeroCarousel } from '../../../components/feature/HeroCarousel';
import heroPhoto from '../../../assets/hero/hero-1.jpg';
import heroAssemblee from '../../../assets/hero/hero-2-assemblee.jpg';
import heroChambre from '../../../assets/hero/hero-3-chambre.jpg';
import heroHautCommissariat from '../../../assets/hero/hero-4-haut-commissariat.jpg';
import { siteContentApi } from '../../../lib/api/site-content';
import type { StatisticDto } from '../../../lib/api/types';
import { useCmsContent } from '../../../contexts/CmsContentContext';
import { resolveMediaUrl } from '../../../lib/api/media-url';

// Photographies décoratives du carrousel du hero (rendues aria-hidden par HeroCarousel).
const HeroSection = () => {
  const { t } = useTranslation();
  const { getValue } = useCmsContent();
  const [statistics, setStatistics] = useState<StatisticDto[]>([]);

  useEffect(() => {
    const loadStatistics = () => siteContentApi.getStatistics().then((response) => {
      if (response.success && response.data) setStatistics(response.data);
    }).catch(() => undefined);
    void loadStatistics();
    window.addEventListener('hcbe:content-published', loadStatistics);
    return () => window.removeEventListener('hcbe:content-published', loadStatistics);
  }, []);

  const statisticValue = (keys: string[], fallback: string) =>
    statistics.find((item) => keys.includes(item.key))?.value || fallback;
  const cmsImage = (key: string, fallback: string) => {
    const value = getValue(key, fallback);
    return value === fallback ? fallback : resolveMediaUrl(value);
  };
  const heroSlides: { src: string; alt: string }[] = [
    { src: cmsImage('media.home.hero.slide1', heroPhoto), alt: '' },
    { src: cmsImage('media.home.hero.slide2', heroAssemblee), alt: '' },
    { src: cmsImage('media.home.hero.slide3', heroChambre), alt: '' },
    { src: cmsImage('media.home.hero.slide4', heroHautCommissariat), alt: '' },
  ];
  const quickActions = [
    { to: '/services', icon: 'ri-customer-service-2-line', label: t('public.home.hero.quick.services') },
    { to: '/actualites/evenements', icon: 'ri-calendar-event-line', label: t('public.home.hero.quick.events') },
    { to: '/emplois', icon: 'ri-briefcase-4-line', label: t('public.home.hero.quick.jobs') },
    { to: '/espace-membre', icon: 'ri-user-community-line', label: t('public.home.hero.quick.member') },
  ];

  return (
    <>
      <HeroCarousel slides={heroSlides}>
        <PageHeader
          bare
          variant="hero"
          immersive
          align="left"
          title={t('public.home.hero.title')}
          description={t('public.home.hero.subtitle')}
          actions={
            <>
              <Button to="/services" variant="primary">
                {t('public.home.hero.cta.services')}
              </Button>
              <ArrowLink to="/espace-membre" tone="gold">
                {t('public.home.hero.cta.member')}
              </ArrowLink>
            </>
          }
          aside={
            <aside className="rounded-[26px] border border-white/15 bg-[#052f1d]/80 p-4 shadow-[0_24px_70px_rgba(0,0,0,.25)] backdrop-blur-xl sm:p-5" aria-label={t('public.home.hero.quick.title')}>
              <div className="flex items-center justify-between gap-4 px-2 pb-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[.2em] text-gold">{t('public.home.hero.quick.eyebrow')}</p>
                  <h2 className="mt-2 font-display text-[22px] font-bold leading-tight text-white">{t('public.home.hero.quick.title')}</h2>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-xl text-gold" aria-hidden="true">
                  <i className="ri-compass-3-line" />
                </span>
              </div>
              <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" aria-label={t('public.home.hero.quick.title')}>
                {quickActions.map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="group flex min-h-[68px] items-center gap-3 rounded-[16px] border border-white/10 bg-white/[.075] px-4 py-3 text-left text-[12px] font-semibold leading-4 text-white transition duration-200 hover:border-gold/55 hover:bg-white/[.13] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg text-gold transition group-hover:bg-gold group-hover:text-green-deep" aria-hidden="true">
                      <i className={action.icon} />
                    </span>
                    <span>{action.label}</span>
                    <i className="ri-arrow-right-up-line ml-auto text-base text-white/45 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold" aria-hidden="true" />
                  </Link>
                ))}
              </nav>
            </aside>
          }
        />
      </HeroCarousel>
      <Reveal>
        <StatBar
          items={[
            { value: statisticValue(['provinces', 'provinces_covered'], '11'), label: t('public.home.stats.provinces') },
            { value: statisticValue(['zones', 'zones_covered'], '2'), label: t('public.home.stats.zones') },
            { value: statisticValue(['associations'], '15'), label: t('public.home.stats.associations') },
            {
              value: <i className="ri-verified-badge-line text-gold-ink" aria-hidden="true"></i>,
              label: t('public.home.stats.freeMembership'),
            },
          ]}
        />
      </Reveal>
    </>
  );
};

export default HeroSection;
