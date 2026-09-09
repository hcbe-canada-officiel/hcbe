import { eventsApi } from '../../../lib/api/events';
import type { Event } from '../../../lib/api/types';
import { getPublicationLabel, translateEventLifecycle } from '../../../lib/i18n/adminStatus';
import { getEventLifecycle } from '../../../lib/events/lifecycle';
import { AdminListPage } from '../../../components/admin/AdminListPage';
import { Button, Field, StatusChip, Td, inputClasses, plainTextFromRichText } from '../../../components/ui';
import { getEventCategoryLabel, useEventCategories } from '../../../lib/events/categories';
import { formatEventDateTime } from '../../../lib/events/timezone';

const eventLifecycleChipStatus = (event: Event): 'published' | 'draft' | 'past' | 'rejected' => {
  const lifecycle = getEventLifecycle(event);
  if (lifecycle === 'past') return 'past';
  if (lifecycle === 'draft') return 'draft';
  if (lifecycle === 'cancelled') return 'rejected';
  return 'published';
};

const EventMetric = ({ value, label, icon, accent = 'green' }: { value: number; label: string; icon: string; accent?: 'green' | 'gold' | 'red' }) => {
  const accents = {
    green: 'bg-green/9 text-green',
    gold: 'bg-gold/18 text-gold-ink',
    red: 'bg-red-link/8 text-red-link',
  };
  return <article className="relative overflow-hidden rounded-[18px] border border-line/65 bg-surface p-4 shadow-[0_8px_24px_rgba(0,59,27,.045)]"><div className="flex items-center justify-between gap-4"><div><strong className="block font-display text-[30px] leading-none tabular-nums text-green-deep">{value.toLocaleString()}</strong><span className="mt-2 block text-[9px] font-bold uppercase tracking-[.14em] text-ink-variant">{label}</span></div><span className={`flex h-11 w-11 items-center justify-center rounded-[13px] ${accents[accent]}`}><i className={`${icon} text-lg`} aria-hidden="true" /></span></div></article>;
};

export const AdminEventsList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [search, setSearch] = useState('');
  const { t, i18n } = useTranslation();
  const categories = useEventCategories(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventsApi.getEventsForAdmin();
      if (response.success && response.data) {
        setEvents(response.data);
      } else {
        setError(response.message || t('admin.events.errorLoadList'));
      }
    } catch (err) {
      console.error('Error loading events:', err);
      setError(err instanceof Error ? err.message : t('admin.events.errorLoadList'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(t('admin.common.confirmDelete', { name: title }))) {
      return;
    }

    try {
      const response = await eventsApi.deleteEvent(id);
      if (response.success) {
        setEvents(events.filter((event) => event.id !== id));
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      alert(t('admin.events.errorDelete'));
    }
  };

  const filterOptions = [
    { value: 'all', label: t('admin.events.filterAll') },
    { value: 'upcoming', label: t('admin.eventLifecycle.upcoming') },
    { value: 'ongoing', label: t('admin.eventLifecycle.ongoing') },
    { value: 'past', label: t('admin.eventLifecycle.past') },
    { value: 'draft', label: t('admin.eventLifecycle.draft') },
    { value: 'cancelled', label: t('admin.eventLifecycle.cancelled') },
  ];

  const filteredEvents = events.filter((event) => {
    if (filter !== 'all' && getEventLifecycle(event) !== filter) return false;
    const query = search.trim().toLocaleLowerCase(i18n.language);
    if (!query) return true;
    return [event.title, event.titleEn, event.location, event.locationEn, event.type]
      .some((value) => value?.toLocaleLowerCase(i18n.language).includes(query));
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'created') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const sortOptions = [
    { value: 'date', label: t('admin.events.sortDate') },
    { value: 'title', label: t('admin.events.sortTitle') },
    { value: 'created', label: t('admin.events.sortCreated') },
  ];

  const currentFilterLabel =
    filterOptions.find((option) => option.value === filter)?.label ?? filter;

  const locale = i18n.language.startsWith('fr') ? 'fr-CA' : 'en-CA';
  const formatListDate = (event: Event) =>
    formatEventDateTime(event.date, locale, event.timeZone, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const localizedTitle = (event: Event) => i18n.language.startsWith('en') && event.titleEn ? event.titleEn : event.title;
  const localizedDescription = (event: Event) => i18n.language.startsWith('en') && event.descriptionEn ? event.descriptionEn : event.description;
  const activeEvents = events.filter((event) => ['upcoming', 'ongoing'].includes(getEventLifecycle(event))).length;
  const registrations = events.reduce((sum, event) => sum + event.confirmedRegistrationCount, 0);
  const waitlisted = events.reduce((sum, event) => sum + event.waitlistCount, 0);

  const toolbar = (
    <>
      <Button to="/admin/events/categories" variant="secondary">
        <i className="ri-price-tag-3-line" aria-hidden="true" />
        {t('admin.events.categories.manage')}
      </Button>
      <Field label={t('admin.common.search')} htmlFor="event-search">
        <div className="relative"><i className="ri-search-line pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-variant" aria-hidden="true" /><input id="event-search" value={search} onChange={(event) => setSearch(event.target.value)} className={`${inputClasses} pl-11`} placeholder={t('admin.events.searchPlaceholder')} /></div>
      </Field>
      <Field label={t('admin.common.filterBy')} htmlFor="event-filter">
        <select
          id="event-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={inputClasses}
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t('admin.common.sortBy')} htmlFor="event-sort">
        <select
          id="event-sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={inputClasses}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
    </>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin border-2 border-line border-t-green" />
      </div>
    );
  }

  return (
    <AdminListPage
      title={t('admin.events.title')}
      count={error ? undefined : sortedEvents.length}
      createLabel={t('admin.events.create')}
      createPath="/admin/events/create"
      summary={<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label={t('admin.events.summaryLabel')}><EventMetric value={events.length} label={t('admin.events.statsTotal')} icon="ri-calendar-2-line" /><EventMetric value={activeEvents} label={t('admin.events.statsActive')} icon="ri-calendar-check-line" accent="gold" /><EventMetric value={registrations} label={t('admin.events.statsRegistrations')} icon="ri-group-line" /><EventMetric value={waitlisted} label={t('admin.events.statsWaitlist')} icon="ri-time-line" accent="red" /></section>}
      toolbar={toolbar}
      columns={[
        { key: 'event', label: t('admin.events.colEvent') },
        { key: 'dateLocation', label: t('admin.events.colDateLocation') },
        { key: 'lifecycle', label: t('admin.events.colLifecycle') },
        { key: 'details', label: t('admin.events.colDetails') },
        { key: 'actions', label: t('admin.common.actions'), align: 'right' },
      ]}
      isEmpty={sortedEvents.length === 0}
      emptyTitle={t('admin.events.emptyTitle')}
      emptyDescription={
        filter === 'all'
          ? t('admin.events.emptyAll')
          : t('admin.events.emptyFilter', { filter: currentFilterLabel })
      }
      error={error ?? undefined}
      onRetry={loadEvents}
    >
      {sortedEvents.map((event) => (
        <tr key={event.id} className="transition-colors hover:bg-surface-container">
          <Td className="text-ink">
            <div className="flex items-start gap-3"><span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-green text-center text-white"><strong className="text-base leading-none">{new Intl.DateTimeFormat(locale, { day: '2-digit', timeZone: event.timeZone }).format(new Date(event.date))}</strong><span className="mt-1 text-[8px] font-bold uppercase tracking-wide text-gold">{new Intl.DateTimeFormat(locale, { month: 'short', timeZone: event.timeZone }).format(new Date(event.date))}</span></span><div className="min-w-0"><div className="font-semibold">{localizedTitle(event)}</div>
            {localizedDescription(event) && (
              <div className="mt-1 max-w-xs truncate text-body-md text-ink-variant">
                {plainTextFromRichText(localizedDescription(event) ?? '')}
              </div>
            )}</div></div>
          </Td>
          <Td>
            <div>{formatListDate(event)}</div>
            {event.location && <div className="mt-1 flex items-center gap-1 text-ink-variant"><i className="ri-map-pin-line" aria-hidden="true" />{i18n.language.startsWith('en') && event.locationEn ? event.locationEn : event.location}</div>}
          </Td>
          <Td>
            <div className="space-y-1">
              <StatusChip
                status={eventLifecycleChipStatus(event)}
                label={translateEventLifecycle(event, t)}
              />
              <div className="text-body-md text-ink-variant">{getPublicationLabel(event.status, t)}</div>
            </div>
          </Td>
          <Td>
            {event.type && (
              <div>
                {t('admin.common.type')}: {getEventCategoryLabel(event.type, categories, i18n.language)}
              </div>
            )}
            <div>{t(`admin.events.format.${event.format || 'InPerson'}`)}</div>
            {event.zone && (
              <div>
                {t('admin.common.zone')}: {event.zone}
              </div>
            )}
            {event.capacity && <div>{t('admin.common.capacity')}: {event.confirmedRegistrationCount}/{event.capacity}</div>}
          </Td>
          <Td align="right">
            <div className="inline-flex items-center justify-end gap-1">
              <Link
                to={`/admin/events/${event.id}`}
                aria-label={t('admin.common.view')}
                title={t('admin.common.view')}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-green transition-colors hover:text-green-deep"
              >
                <i className="ri-eye-line text-lg" aria-hidden="true" />
              </Link>
              <Link
                to={`/admin/events/${event.id}/edit`}
                aria-label={t('admin.common.edit')}
                title={t('admin.common.edit')}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-green transition-colors hover:text-green-deep"
              >
                <i className="ri-edit-line text-lg" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => handleDeleteEvent(event.id, event.title)}
                aria-label={t('admin.common.delete')}
                title={t('admin.common.delete')}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-control text-error transition-colors hover:text-error-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
              >
                <i className="ri-delete-bin-line text-lg" aria-hidden="true" />
              </button>
            </div>
          </Td>
        </tr>
      ))}
    </AdminListPage>
  );
};
