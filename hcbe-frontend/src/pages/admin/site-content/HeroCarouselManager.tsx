import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import heroPhoto from '../../../assets/hero/hero-1.jpg';
import heroAssemblee from '../../../assets/hero/hero-2-assemblee.jpg';
import heroChambre from '../../../assets/hero/hero-3-chambre.jpg';
import heroHautCommissariat from '../../../assets/hero/hero-4-haut-commissariat.jpg';
import { resolveMediaUrl } from '../../../lib/api/media-url';
import { siteContentApi } from '../../../lib/api/site-content';
import type { CmsContentItemDto } from '../../../lib/api/types';

const slides = [
  { key: 'media.home.hero.slide1', fallback: heroPhoto },
  { key: 'media.home.hero.slide2', fallback: heroAssemblee },
  { key: 'media.home.hero.slide3', fallback: heroChambre },
  { key: 'media.home.hero.slide4', fallback: heroHautCommissariat },
] as const;

const acceptedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const maxFileSize = 10 * 1024 * 1024;

export const HeroCarouselManager = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<CmsContentItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState('');
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await siteContentApi.getCmsItems('home');
      if (response.success && response.data) setItems(response.data);
    } catch {
      setNotice({ tone: 'error', text: t('admin.siteContent.carousel.error') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const byKey = useMemo(() => Object.fromEntries(items.map((item) => [item.key, item])), [items]);

  const replace = async (key: string, file?: File) => {
    if (!file) return;
    setNotice(null);
    if (!acceptedImageTypes.has(file.type)) {
      setNotice({ tone: 'error', text: t('admin.siteContent.carousel.invalidType') });
      return;
    }
    if (file.size > maxFileSize) {
      setNotice({ tone: 'error', text: t('admin.siteContent.carousel.tooLarge') });
      return;
    }

    setBusyKey(key);
    try {
      const upload = await siteContentApi.uploadCmsMedia(file);
      if (!upload.success || !upload.data) throw new Error(upload.message);
      const slideNumber = slides.findIndex((slide) => slide.key === key) + 1;
      const saved = await siteContentApi.upsertCmsItem({
        key,
        page: 'home',
        section: 'hero',
        contentType: 'image',
        label: t('admin.siteContent.carousel.slideLabel', { number: slideNumber }),
        valueFr: upload.data.url,
        valueEn: upload.data.url,
        publish: true,
      });
      if (!saved.success || !saved.data) throw new Error(saved.message);
      setItems((current) => [...current.filter((item) => item.key !== key), saved.data!]);
      setNotice({ tone: 'success', text: t('admin.siteContent.carousel.replaced') });
      window.dispatchEvent(new CustomEvent('hcbe:content-published'));
    } catch {
      setNotice({ tone: 'error', text: t('admin.siteContent.carousel.error') });
    } finally {
      setBusyKey('');
    }
  };

  const restore = async (key: string) => {
    const stored = byKey[key];
    if (!stored || !window.confirm(t('admin.siteContent.carousel.restoreConfirm'))) return;
    setBusyKey(key);
    setNotice(null);
    try {
      const response = await siteContentApi.deleteCmsItem(stored.id);
      if (!response.success) throw new Error(response.message);
      setItems((current) => current.filter((item) => item.key !== key));
      setNotice({ tone: 'success', text: t('admin.siteContent.carousel.restored') });
      window.dispatchEvent(new CustomEvent('hcbe:content-published'));
    } catch {
      setNotice({ tone: 'error', text: t('admin.siteContent.carousel.error') });
    } finally {
      setBusyKey('');
    }
  };

  return (
    <section className="admin-panel overflow-hidden" aria-labelledby="homepage-carousel-title">
      <header className="public-grid-pattern relative overflow-hidden bg-green-deep px-5 py-6 text-white sm:px-7">
        <div className="pointer-events-none absolute -right-12 -top-24 h-60 w-60 rounded-full border-[42px] border-white/[.04]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[9px] font-bold uppercase tracking-[.2em] text-gold">{t('admin.siteContent.carousel.eyebrow')}</p>
            <h2 id="homepage-carousel-title" className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{t('admin.siteContent.carousel.title')}</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">{t('admin.siteContent.carousel.description')}</p>
          </div>
          <a href="/" target="_blank" rel="noreferrer" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 text-[10px] font-bold uppercase tracking-[.12em] text-white transition hover:border-gold/60 hover:bg-gold hover:text-green-deep">
            {t('admin.siteContent.carousel.preview')}<i className="ri-external-link-line" aria-hidden="true" />
          </a>
        </div>
      </header>

      {notice && (
        <p role="status" className={`border-b px-5 py-3 text-sm font-medium ${notice.tone === 'success' ? 'border-green/15 bg-green/[.07] text-green-deep' : 'border-error/20 bg-error/[.07] text-error'}`}>
          <i className={`${notice.tone === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'} mr-2`} aria-hidden="true" />{notice.text}
        </p>
      )}

      <div className="p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-xs leading-5 text-ink-variant"><i className="ri-information-line mr-2 text-green" aria-hidden="true" />{t('admin.siteContent.carousel.hint')}</p>
          <span className="rounded-full border border-line bg-surface-container px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-ink-variant">JPG · PNG · WEBP · GIF · 10 MB</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" data-testid="hero-carousel-manager">
          {slides.map((slide, index) => {
            const stored = byKey[slide.key];
            const image = stored?.publishedValueFr || stored?.publishedValueEn || slide.fallback;
            const isBusy = busyKey === slide.key;
            return (
              <article key={slide.key} className="group overflow-hidden rounded-[18px] border border-line bg-surface shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-green/35 hover:shadow-lg">
                <div className="relative aspect-[16/10] overflow-hidden bg-green-deep">
                  <img src={resolveMediaUrl(image)} alt={t('admin.siteContent.carousel.slideAlt', { number: index + 1 })} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-deep/80 via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-green-deep/75 font-display text-lg font-bold text-white backdrop-blur">{String(index + 1).padStart(2, '0')}</span>
                  <span className={`absolute bottom-3 left-3 rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.12em] backdrop-blur ${stored?.isPublished ? 'border-emerald-200/25 bg-emerald-300/15 text-emerald-50' : 'border-white/20 bg-black/25 text-white'}`}>
                    {stored?.isPublished ? t('admin.siteContent.carousel.custom') : t('admin.siteContent.carousel.builtIn')}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-bold text-green-deep">{t('admin.siteContent.carousel.slideLabel', { number: index + 1 })}</h3>
                  <p className="mt-1 text-xs leading-5 text-ink-variant">{t('admin.siteContent.carousel.position', { number: index + 1 })}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line/70 pt-4">
                    <label className={`inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-green px-3 text-[9px] font-bold uppercase tracking-[.1em] text-white transition hover:bg-green-deep ${isBusy ? 'pointer-events-none opacity-55' : ''}`}>
                      <i className={isBusy ? 'ri-loader-4-line animate-spin' : 'ri-image-edit-line'} aria-hidden="true" />
                      {isBusy ? t('admin.siteContent.carousel.uploading') : t('admin.siteContent.carousel.replace')}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        disabled={Boolean(busyKey)}
                        aria-label={t('admin.siteContent.carousel.replaceSlide', { number: index + 1 })}
                        onChange={(event) => {
                          void replace(slide.key, event.target.files?.[0]);
                          event.target.value = '';
                        }}
                      />
                    </label>
                    {stored && (
                      <button type="button" disabled={Boolean(busyKey)} onClick={() => void restore(slide.key)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-variant transition hover:border-error/35 hover:bg-error/[.06] hover:text-error disabled:opacity-40" aria-label={t('admin.siteContent.carousel.restoreSlide', { number: index + 1 })} title={t('admin.siteContent.carousel.restore')}>
                        <i className="ri-reset-left-line" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {loading && <div className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-variant"><i className="ri-loader-4-line animate-spin text-green" />{t('admin.common.loading')}</div>}
      </div>
    </section>
  );
};
