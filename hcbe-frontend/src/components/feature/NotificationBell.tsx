import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { notificationsApi } from '../../lib/api/notifications';
import type { AppNotification } from '../../lib/api/types';

type NotificationScope = 'member' | 'admin';

interface NotificationBellProps {
  scope: NotificationScope;
  className?: string;
}

const iconByType: Record<string, string> = {
  'association-membership': 'ri-community-line',
  'service-case': 'ri-customer-service-2-line',
  event: 'ri-calendar-event-line',
  message: 'ri-chat-3-line',
  membership: 'ri-vip-crown-2-line',
  opportunity: 'ri-briefcase-4-line',
};

const NotificationBell = ({ scope, className = '' }: NotificationBellProps) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const french = !i18n.language.startsWith('en');
  const memberScope = scope === 'member';
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadCount = async () => {
    try {
      const response = await notificationsApi.unreadCount(memberScope);
      if (response.success) setUnread(response.data ?? 0);
    } catch {
      // Keep the last reliable count when a background refresh fails.
    }
  };

  const loadItems = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await notificationsApi.getAll(8, memberScope);
      if (!response.success) throw new Error(response.message);
      const next = response.data ?? [];
      setItems(next);
      await loadCount();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCount();
    const interval = window.setInterval(() => void loadCount(), 60_000);
    const refresh = () => void loadCount();
    const sync = (event: Event) => setUnread((event as CustomEvent<number>).detail);
    window.addEventListener('focus', refresh);
    window.addEventListener('hcbe:notifications-updated', sync);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('hcbe:notifications-updated', sync);
    };
  }, [memberScope]);

  useEffect(() => setOpen(false), [location.pathname, location.search]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    setOpen((current) => {
      const next = !current;
      if (next) void loadItems();
      return next;
    });
  };

  const markRead = async (item: AppNotification) => {
    if (!item.isRead) {
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, isRead: true } : entry));
      const nextUnread = Math.max(0, unread - 1);
      setUnread(nextUnread);
      window.dispatchEvent(new CustomEvent('hcbe:notifications-updated', { detail: nextUnread }));
      try {
        await notificationsApi.markRead(item.id, memberScope);
      } catch {
        void loadItems();
      }
    }
    setOpen(false);
  };

  const markAllRead = async () => {
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnread(0);
    window.dispatchEvent(new CustomEvent('hcbe:notifications-updated', { detail: 0 }));
    try {
      await notificationsApi.markAllRead(memberScope);
    } catch {
      void loadItems();
    }
  };

  const label = french ? 'Notifications' : 'Notifications';
  const unreadLabel = french ? `${unread} notification${unread > 1 ? 's' : ''} non lue${unread > 1 ? 's' : ''}` : `${unread} unread notification${unread === 1 ? '' : 's'}`;

  return (
    <div ref={containerRef} className={`relative ${className}`} data-testid="notification-bell">
      <button
        type="button"
        onClick={toggle}
        aria-label={unread ? `${label} — ${unreadLabel}` : label}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green ${open ? 'border-green bg-green text-white shadow-[0_10px_24px_rgba(0,59,27,.18)]' : 'border-line bg-surface text-green-deep shadow-[0_5px_18px_rgba(0,59,27,.07)] hover:-translate-y-0.5 hover:border-green/35 hover:bg-green/[.045]'}`}
      >
        <i className={open ? 'ri-notification-3-fill text-xl' : 'ri-notification-3-line text-xl'} aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-surface bg-red-link px-1 text-[9px] font-bold leading-none text-white" aria-hidden="true">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <section
          role="dialog"
          aria-label={label}
          className="fixed left-3 right-3 top-[82px] z-[110] max-h-[min(620px,calc(100dvh-96px))] overflow-hidden rounded-[24px] border border-line/80 bg-surface shadow-[0_26px_80px_rgba(0,45,22,.22)] xl:absolute xl:left-auto xl:right-0 xl:top-[calc(100%+12px)] xl:w-[390px]"
        >
          <header className="public-grid-pattern relative overflow-hidden bg-green-deep px-5 py-5 text-white">
            <span className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full border-[24px] border-gold/[.09]" aria-hidden="true" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.18em] text-gold">{french ? 'Votre fil personnel' : 'Your personal feed'}</p>
                <h2 className="mt-1 font-display text-2xl font-bold">{label}</h2>
                <p className="mt-1 text-xs text-green-dim" aria-live="polite">{unread ? unreadLabel : (french ? 'Vous êtes à jour.' : 'You are all caught up.')}</p>
              </div>
              {unread > 0 && (
                <button type="button" onClick={() => void markAllRead()} className="min-h-10 rounded-full border border-white/15 px-3 text-[9px] font-bold uppercase tracking-[.1em] text-white transition hover:border-gold/50 hover:text-gold">
                  {french ? 'Tout lire' : 'Read all'}
                </button>
              )}
            </div>
          </header>

          <div className="max-h-[420px] overflow-y-auto overscroll-contain">
            {loading ? (
              <div className="flex min-h-36 items-center justify-center text-green" role="status"><i className="ri-loader-4-line animate-spin text-2xl" aria-hidden="true" /><span className="sr-only">{french ? 'Chargement' : 'Loading'}</span></div>
            ) : error ? (
              <div className="p-7 text-center"><i className="ri-wifi-off-line text-2xl text-red-link" aria-hidden="true" /><p className="mt-2 text-sm text-ink-variant">{french ? 'Impossible de charger les notifications.' : 'Unable to load notifications.'}</p><button type="button" onClick={() => void loadItems()} className="mt-3 text-[10px] font-bold uppercase tracking-[.1em] text-green underline decoration-gold decoration-2 underline-offset-4">{french ? 'Réessayer' : 'Try again'}</button></div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green/[.07] text-2xl text-green"><i className="ri-notification-off-line" aria-hidden="true" /></span><p className="mt-3 font-display text-lg font-bold text-green-deep">{french ? 'Aucune nouvelle notification' : 'No new notifications'}</p><p className="mt-1 text-xs leading-5 text-ink-variant">{french ? 'Les mises à jour importantes apparaîtront ici.' : 'Important updates will appear here.'}</p></div>
            ) : (
              <div className="divide-y divide-line">
                {items.map((item) => {
                  const content = (
                    <>
                      <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.isRead ? 'bg-canvas text-ink-variant' : 'bg-gold/20 text-green'}`}><i className={`${iconByType[item.type] || 'ri-notification-3-line'} text-lg`} aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1"><strong className="block text-sm leading-5 text-green-deep">{item.title}</strong><span className="mt-1 line-clamp-2 block text-xs leading-5 text-ink-variant">{item.message}</span><time className="mt-2 block text-[9px] font-semibold uppercase tracking-[.08em] text-ink-variant/75">{new Date(item.createdAt).toLocaleString(french ? 'fr-CA' : 'en-CA', { dateStyle: 'medium', timeStyle: 'short' })}</time></span>
                      {!item.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-link" aria-label={french ? 'Non lue' : 'Unread'} />}
                    </>
                  );
                  const classes = `flex w-full gap-3 p-4 text-left transition hover:bg-green/[.035] ${item.isRead ? '' : 'bg-gold/[.035]'}`;
                  return item.link ? <Link key={item.id} to={item.link} onClick={() => void markRead(item)} className={classes}>{content}</Link> : <button key={item.id} type="button" onClick={() => void markRead(item)} className={classes}>{content}</button>;
                })}
              </div>
            )}
          </div>

          {memberScope && (
            <footer className="border-t border-line bg-canvas/55 p-3">
              <Link to="/espace-membre?section=notifications" onClick={() => setOpen(false)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl text-[10px] font-bold uppercase tracking-[.11em] text-green transition hover:bg-green/[.06]">
                {french ? 'Voir toutes les notifications' : 'View all notifications'}
                <i className="ri-arrow-right-line text-base" aria-hidden="true" />
              </Link>
            </footer>
          )}
        </section>
      )}
    </div>
  );
};

export default NotificationBell;
