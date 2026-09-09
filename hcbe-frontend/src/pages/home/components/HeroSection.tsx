import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, ArrowLink, StatBar, Reveal } from '../../../components/ui';
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
        <div className="container-page flex w-full flex-col justify-center py-16 sm:py-20 md:py-24">
          <div className="max-w-[760px]">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
              HCBE Canada
            </span>
            <h1 className="hero-title max-w-4xl font-display text-[40px] font-bold leading-[1.02] tracking-[-0.035em] text-white sm:text-[48px] md:text-[64px] lg:text-[72px]">
              {t('public.home.hero.title')}
            </h1>
            <p className="hero-standfirst mt-6 max-w-2xl border-l-2 border-gold pl-5 text-[16px] leading-7 text-white/85 sm:text-[18px]">
              {t('public.home.hero.subtitle')}
            </p>
            <div className="hero-actions mt-8 flex flex-wrap items-center gap-5">
              <Button to="/services" variant="primary">
                {t('public.home.hero.cta.services')}
              </Button>
              <ArrowLink to="/espace-membre" tone="gold">
                {t('public.home.hero.cta.member')}
              </ArrowLink>
            </div>
          </div>
        </div>
      </HeroCarousel>

      <div className="container-page relative z-20 -mt-7 sm:-mt-9" data-testid="home-quick-actions">
        <aside
          className="grid overflow-hidden rounded-[26px] border border-line/80 bg-surface shadow-[0_24px_65px_rgba(0,59,27,.14)] lg:grid-cols-[250px_1fr]"
          aria-label={t('public.home.hero.quick.title')}
        >
          <div className="flex items-center gap-3 border-b border-line/70 px-5 py-4 lg:border-b-0 lg:border-r lg:px-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-deep text-xl text-gold shadow-[0_8px_22px_rgba(0,59,27,.18)]" aria-hidden="true">
              <i className="ri-compass-3-line" />
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[.2em] text-gold-ink">{t('public.home.hero.quick.eyebrow')}</p>
              <h2 className="mt-1 font-display text-[17px] font-bold leading-tight text-green-deep">{t('public.home.hero.quick.title')}</h2>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-px bg-line/70 sm:grid-cols-4" aria-label={t('public.home.hero.quick.title')}>
            {quickActions.map((action, index) => (
              <Link
                key={action.to}
                to={action.to}
                className="group relative flex min-h-[92px] items-center gap-3 overflow-hidden bg-surface px-4 py-4 text-left transition-colors hover:bg-green/[.055] focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-green sm:min-h-[104px] sm:px-5"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] text-lg transition-transform duration-200 group-hover:-translate-y-0.5 ${index === 1 ? 'bg-gold text-green-deep' : 'bg-green/[.09] text-green'}`} aria-hidden="true">
                  <i className={action.icon} />
                </span>
                <span className="min-w-0 text-[11px] font-bold leading-4 text-ink sm:text-[12px]">{action.label}</span>
                <i className="ri-arrow-right-up-line ml-auto shrink-0 text-base text-ink-variant/50 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-green" aria-hidden="true" />
                <span className="absolute right-3 top-2 font-mono text-[9px] text-ink-variant/35" aria-hidden="true">0{index + 1}</span>
              </Link>
            ))}
          </nav>
        </aside>
      </div>

      <Reveal className="pt-8 sm:pt-10">
        <StatBar
          overlap={false}
          testId="home-statistics"
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
