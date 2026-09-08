import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui';
import { CommunityAdSlot } from '../../../components/feature/CommunityAdSlot';

const CommunitySpotlightSection = () => {
  const { t } = useTranslation();

  return (
    <section className="public-grid-pattern relative isolate overflow-hidden bg-green-deep py-20 md:py-24" aria-labelledby="community-advertising-title">
      <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border-[58px] border-white/[.035]" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red via-gold to-green" aria-hidden="true" />
      <div className="container-page relative">
        <div className="mb-10 grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-[9px] font-bold uppercase tracking-[.2em] text-gold">
                <i className="ri-megaphone-line text-sm" aria-hidden="true" />
                {t('public.home.advertising.badge')}
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[.16em] text-white/50">{t('public.home.advertising.disclosure')}</span>
            </div>
            <h2 id="community-advertising-title" className="font-display text-[34px] font-bold leading-[1.06] tracking-[-.02em] text-white md:text-[48px]">
              {t('public.home.advertising.title')}
            </h2>
            <p className="mt-5 max-w-2xl text-[16px] leading-7 text-white/70">{t('public.home.advertising.description')}</p>
          </div>
          <Button to="/contact?subject=advertising" variant="inverse" className="w-full lg:w-auto">
            <i className="ri-advertisement-line text-base" aria-hidden="true" />
            {t('public.home.advertising.cta')}
          </Button>
        </div>

        <CommunityAdSlot
          placement="Homepage"
          className="border-white/15 bg-white/[.97] shadow-[0_28px_80px_rgba(0,0,0,.22)]"
          emptyFallback={
            <div className="grid items-center gap-6 rounded-[26px] border border-dashed border-white/25 bg-white/[.07] p-6 text-white backdrop-blur-sm sm:p-8 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
              <span className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-gold/30 bg-gold/10 text-2xl text-gold" aria-hidden="true"><i className="ri-advertisement-line" /></span>
              <div>
                <h3 className="font-display text-2xl font-bold text-white">{t('public.home.advertising.empty.title')}</h3>
                <p className="mt-2 text-sm leading-6 text-white/80">{t('public.home.advertising.empty.description')}</p>
              </div>
              <Button to="/contact?subject=advertising" variant="primary" className="w-full lg:w-auto">{t('public.home.advertising.empty.cta')}</Button>
            </div>
          }
        />

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[9px] font-semibold uppercase tracking-[.13em] text-white/50">
          <span className="inline-flex items-center gap-2"><i className="ri-shield-check-line text-gold" aria-hidden="true" />{t('public.home.advertising.reviewed')}</span>
          <span className="inline-flex items-center gap-2"><i className="ri-eye-line text-gold" aria-hidden="true" />{t('public.home.advertising.labeled')}</span>
          <span className="inline-flex items-center gap-2"><i className="ri-community-line text-gold" aria-hidden="true" />{t('public.home.advertising.community')}</span>
        </div>
      </div>
    </section>
  );
};

export default CommunitySpotlightSection;
