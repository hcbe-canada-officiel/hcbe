import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const CmsPreviewBanner = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  if (params.get('cmsPreview') !== '1') return null;

  const english = i18n.language.startsWith('en');
  const leavePreview = () => {
    params.delete('cmsPreview');
    params.delete('cmsPreviewRefresh');
    navigate(`${location.pathname}${params.size ? `?${params.toString()}` : ''}${location.hash}`, { replace: true });
  };

  return (
    <aside className="fixed bottom-4 left-1/2 z-[120] flex w-[min(calc(100%-2rem),620px)] -translate-x-1/2 items-center justify-between gap-4 rounded-2xl border border-gold/40 bg-green-deep/95 px-4 py-3 text-white shadow-2xl backdrop-blur" role="status">
      <span className="flex min-w-0 items-center gap-3 text-xs sm:text-sm">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-green-deep"><i className="ri-eye-line" aria-hidden="true" /></span>
        <span><strong className="block font-semibold">{english ? 'Draft preview' : 'Aperçu du brouillon'}</strong><span className="text-white/65">{english ? 'Only authenticated administrators can see these changes.' : 'Seuls les administrateurs authentifiés voient ces changements.'}</span></span>
      </span>
      <button type="button" onClick={leavePreview} className="shrink-0 rounded-full border border-white/20 px-3 py-2 text-[9px] font-bold uppercase tracking-[.1em] transition hover:bg-white hover:text-green-deep">
        {english ? 'Exit' : 'Quitter'}
      </button>
    </aside>
  );
};

export default CmsPreviewBanner;
