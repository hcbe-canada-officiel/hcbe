import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { communityMarketplaceApi } from '../../lib/api/community-marketplace';
import type { AdvertisingCampaign } from '../../lib/api/types';
import { getApiBaseUrl } from '../../lib/api/base-url';
import { localized, localizedOptional } from '../../lib/i18n/localized';

type CommunityAdSlotProps = {
  placement: string;
  className?: string;
  emptyFallback?: ReactNode;
};

export function CommunityAdSlot({ placement, className = '', emptyFallback }: CommunityAdSlotProps) {
  const { i18n } = useTranslation();
  const french = i18n.language.startsWith('fr');
  const [ads, setAds] = useState<AdvertisingCampaign[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    setIsReady(false);
    setAds([]);
    void communityMarketplaceApi.getAds(placement, french ? 'fr' : 'en')
      .then((response) => {
        if (active && response.data) setAds(response.data);
      })
      .catch(() => undefined)
      .finally(() => { if (active) setIsReady(true); });
    return () => { active = false; };
  }, [placement, french]);

  if (!isReady) return null;
  if (!ads.length) return emptyFallback ? <>{emptyFallback}</> : null;
  const single = ads.length === 1;

  return (
    <aside
      className={`relative overflow-hidden rounded-[28px] border border-green/10 bg-surface p-3 shadow-[0_18px_55px_rgba(0,59,27,.08)] sm:p-4 ${className}`}
      aria-label={french ? 'Publicité communautaire' : 'Community advertising'}
      data-testid="community-ad-slot"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 px-2 pb-4 pt-1 sm:px-3 sm:pb-5 sm:pt-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-lg text-gold-ink" aria-hidden="true">
            <i className="ri-megaphone-line" />
          </span>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.2em] text-red-link">
              {french ? 'Visibilité communautaire' : 'Community spotlight'}
            </p>
            <p className="mt-0.5 text-xs text-ink-variant">
              {french ? 'Contenu commandité, vérifié par le HCBE' : 'Sponsored content, reviewed by HCBE'}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-green/10 bg-green/[.045] px-3 py-2 text-[8px] font-bold uppercase tracking-[.16em] text-green">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
          {french ? 'Publicité' : 'Advertisement'}
        </span>
      </header>

      <div className={single ? 'grid' : 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'}>
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} french={french} featured={single} language={i18n.language} />
        ))}
      </div>
    </aside>
  );
}

function AdCard({ ad, french, featured, language }: {
  ad: AdvertisingCampaign;
  french: boolean;
  featured: boolean;
  language: string;
}) {
  const title = localized(ad.title, ad.titleEn, language);
  const body = localizedOptional(ad.body, ad.bodyEn, language);

  return (
    <a
      href={`${getApiBaseUrl()}/api/community-marketplace/ads/${ad.id}/click`}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={`group relative overflow-hidden rounded-[22px] border border-green/10 bg-background shadow-[0_10px_30px_rgba(0,59,27,.07)] transition duration-300 hover:-translate-y-1 hover:border-gold/70 hover:shadow-[0_20px_45px_rgba(0,59,27,.13)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green ${featured ? 'grid md:grid-cols-[minmax(240px,.82fr)_minmax(0,1.18fr)]' : 'flex flex-col'}`}
      data-testid="community-ad-card"
    >
      <AdMedia ad={ad} french={french} featured={featured} />
      <AdCopy ad={ad} title={title} body={body} french={french} featured={featured} />
    </a>
  );
}

function AdMedia({ ad, french, featured }: { ad: AdvertisingCampaign; french: boolean; featured: boolean }) {
  return (
    <span className={`relative isolate block overflow-hidden bg-green-deep ${featured ? 'min-h-[210px] sm:min-h-[250px] md:min-h-full' : 'aspect-[16/9]'}`}>
      <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,205,0,.10),transparent_48%),radial-gradient(circle_at_86%_18%,rgba(255,255,255,.13),transparent_28%)]" aria-hidden="true" />
      {ad.imageUrl ? (
        <img
          src={ad.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/[.07] text-3xl text-gold backdrop-blur-sm">
            <i className="ri-megaphone-line" />
          </span>
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-green-deep/65 to-transparent" aria-hidden="true" />
      <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-green-deep/75 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.16em] text-white backdrop-blur-md sm:left-5 sm:top-5">
        {french ? 'Commandité' : 'Sponsored'}
      </span>
    </span>
  );
}

function AdCopy({ ad, title, body, french, featured }: {
  ad: AdvertisingCampaign;
  title: string;
  body?: string;
  french: boolean;
  featured: boolean;
}) {
  const initial = ad.advertiserName.trim().charAt(0).toLocaleUpperCase() || 'H';
  return (
    <span className={`flex min-w-0 flex-1 flex-col ${featured ? 'p-6 sm:p-8 lg:p-10' : 'p-5 sm:p-6'}`}>
      <span className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green text-xs font-bold text-white" aria-hidden="true">{initial}</span>
        <span className="min-w-0">
          <span className="block truncate text-[9px] font-bold uppercase tracking-[.15em] text-green">{ad.advertiserName}</span>
          <span className="mt-0.5 flex items-center gap-1 text-[9px] text-ink-variant">
            <i className="ri-shield-check-line text-green" aria-hidden="true" />
            {french ? 'Annonceur vérifié' : 'Verified advertiser'}
          </span>
        </span>
      </span>

      <span className={`mt-5 block font-display font-bold leading-[1.08] text-green-deep ${featured ? 'text-[28px] sm:text-[34px]' : 'text-2xl'}`}>{title}</span>
      {body && <span className={`mt-4 block text-sm leading-6 text-ink-variant ${featured ? 'line-clamp-4' : 'line-clamp-3'}`}>{body}</span>}

      <span className="mt-auto flex items-end justify-between gap-4 pt-7">
        <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-5 py-3 text-[9px] font-bold uppercase tracking-[.14em] text-green-deep shadow-[0_8px_20px_rgba(255,205,0,.18)] transition group-hover:bg-gold-light">
          {french ? 'En savoir plus' : 'Learn more'}
          <i className="ri-arrow-right-up-line text-base transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
        <span className="hidden items-center gap-1 text-[8px] font-bold uppercase tracking-[.13em] text-ink-variant sm:inline-flex">
          {french ? 'Lien externe' : 'External link'}
          <i className="ri-external-link-line" aria-hidden="true" />
        </span>
      </span>
    </span>
  );
}
