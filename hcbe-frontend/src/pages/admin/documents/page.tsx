import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AdminPageHeader } from '../../../components/admin/AdminPageHeader';
import { Button, Field, StatusChip, inputClasses, plainTextFromRichText } from '../../../components/ui';
import { buildApiUrl } from '../../../lib/api/base-url';

interface Document {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  type?: string;
  size?: string;
  pages?: string;
  category?: string;
  url?: string;
  downloads: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

const documentSummary = (value?: string) => plainTextFromRichText((value ?? '').replace(/<[^>]+>/g, ' '));

const MetricCard = ({ icon, value, label, tone = 'green' }: { icon: string; value: number; label: string; tone?: 'green' | 'gold' | 'red' }) => {
  const tones = {
    green: 'bg-green/9 text-green dark:bg-green-dim/10 dark:text-green-dim',
    gold: 'bg-gold/16 text-gold-ink dark:text-gold',
    red: 'bg-red-link/8 text-red-link dark:bg-red-link/14 dark:text-red-light',
  };

  return (
    <article className="group relative overflow-hidden rounded-[18px] border border-line/65 bg-surface p-4 shadow-[0_8px_24px_rgba(0,59,27,.045)] sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-[30px] font-bold leading-none tabular-nums text-green-deep sm:text-[34px]">{value.toLocaleString()}</p>
          <p className="mt-2 text-[9px] font-bold uppercase tracking-[.14em] text-ink-variant">{label}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] ${tones[tone]}`} aria-hidden="true">
          <i className={`${icon} text-xl`} />
        </span>
      </div>
      <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none" aria-hidden="true" />
    </article>
  );
};

export const AdminDocumentsList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { t, i18n } = useTranslation();

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('hcbe_token');
      const response = await fetch(buildApiUrl('/api/documents/admin'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.data) {
        setDocuments(data.data);
      } else {
        setError(t('admin.documents.errorLoad'));
      }
    } catch (err) {
      console.error('Error loading documents:', err);
      setError(err instanceof Error ? err.message : t('admin.documents.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDocuments();
  }, []);

  const handleDeleteDocument = async (id: string, name: string) => {
    if (!window.confirm(t('admin.documents.confirmDelete', { name }))) return;

    try {
      const token = localStorage.getItem('hcbe_token');
      const response = await fetch(buildApiUrl(`/api/documents/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) setDocuments((current) => current.filter((doc) => doc.id !== id));
    } catch (deleteError) {
      console.error('Error deleting document:', deleteError);
      alert(t('admin.documents.errorDelete'));
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('hcbe_token');
      const formData = new FormData();
      formData.append('isActive', (!currentStatus).toString());

      const response = await fetch(buildApiUrl(`/api/documents/${id}`), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        setDocuments((current) => current.map((doc) => doc.id === id ? { ...doc, isActive: !currentStatus } : doc));
      }
    } catch (updateError) {
      console.error('Error updating document:', updateError);
    }
  };

  const categories = useMemo(
    () => [...new Set(documents.map((doc) => doc.category).filter((category): category is string => Boolean(category)))].sort(),
    [documents],
  );

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(i18n.language);
    return documents
      .filter((doc) => {
        const matchesFilter = filter === 'all'
          || (filter === 'active' && doc.isActive)
          || (filter === 'inactive' && !doc.isActive)
          || doc.category === filter;
        if (!matchesFilter) return false;
        if (!query) return true;
        return [doc.name, documentSummary(doc.description), doc.category, doc.type]
          .some((value) => value?.toLocaleLowerCase(i18n.language).includes(query));
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [documents, filter, i18n.language, search]);

  const activeCount = documents.filter((document) => document.isActive).length;
  const downloadCount = documents.reduce((sum, document) => sum + document.downloads, 0);
  const hasFilters = filter !== 'all' || search.trim().length > 0;
  const resetFilters = () => {
    setFilter('all');
    setSearch('');
  };
  const formatDate = (date: string) => new Intl.DateTimeFormat(i18n.language, {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date));

  if (isLoading) {
    return (
      <section className="space-y-5" aria-label={t('admin.common.loading')} aria-busy="true">
        <div className="h-36 animate-pulse rounded-[18px] border border-line/60 bg-surface" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-[18px] border border-line/60 bg-surface" />)}
        </div>
        <div className="h-72 animate-pulse rounded-[20px] border border-line/60 bg-surface" />
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <AdminPageHeader
        title={t('admin.documents.title')}
        subtitle={t('admin.documents.subtitle')}
        icon="ri-file-text-line"
        count={documents.length}
        actions={(
          <Button to="/admin/documents/create" variant="primary" className="rounded-xl">
            <i className="ri-add-line text-base" aria-hidden="true" />
            {t('admin.documents.create')}
          </Button>
        )}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label={t('admin.documents.statsLabel')}>
        <MetricCard icon="ri-file-list-3-line" value={documents.length} label={t('admin.documents.statsTotal')} />
        <MetricCard icon="ri-checkbox-circle-line" value={activeCount} label={t('admin.documents.statsActive')} tone="gold" />
        <MetricCard icon="ri-download-cloud-2-line" value={downloadCount} label={t('admin.documents.statsDownloads')} tone="red" />
      </div>

      <section className="overflow-hidden rounded-[20px] border border-line/65 bg-surface shadow-[0_14px_40px_rgba(0,59,27,.055)]" aria-labelledby="document-library-title">
        <header className="relative overflow-hidden border-b border-line/55 bg-green px-5 py-5 text-white sm:px-6">
          <div className="pointer-events-none absolute -right-8 -top-20 h-44 w-44 rounded-full border-[28px] border-gold/10" aria-hidden="true" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-gold" aria-hidden="true">
                <i className="ri-archive-drawer-line text-lg" />
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.18em] text-gold">{t('admin.documents.libraryEyebrow')}</p>
                <h2 id="document-library-title" className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">{t('admin.documents.libraryTitle')}</h2>
              </div>
            </div>
            <p className="max-w-sm text-xs leading-5 text-white/70 sm:text-right">{t('admin.documents.libraryHint')}</p>
          </div>
        </header>

        <div className="border-b border-line/55 bg-surface-container/45 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_260px_auto] lg:items-end">
            <Field label={t('admin.common.search')} htmlFor="document-search">
              <div className="relative">
                <i className="ri-search-line pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-variant" aria-hidden="true" />
                <input id="document-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} className={`${inputClasses} pl-11`} placeholder={t('admin.documents.searchPlaceholder')} />
              </div>
            </Field>
            <Field label={t('admin.common.filterBy')} htmlFor="document-filter">
              <select id="document-filter" value={filter} onChange={(event) => setFilter(event.target.value)} className={inputClasses}>
                <option value="all">{t('admin.documents.filterAll')}</option>
                <option value="active">{t('admin.documents.filterActive')}</option>
                <option value="inactive">{t('admin.documents.filterInactive')}</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </Field>
            <button type="button" onClick={resetFilters} disabled={!hasFilters} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[14px] border border-line bg-surface px-4 text-[10px] font-bold uppercase tracking-[.12em] text-green transition-colors hover:border-green hover:bg-green hover:text-white disabled:pointer-events-none disabled:opacity-40">
              <i className="ri-refresh-line text-base" aria-hidden="true" />
              {t('admin.documents.resetFilters')}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-variant">
            <p aria-live="polite">{t('admin.documents.results', { count: filteredDocuments.length })}</p>
            {hasFilters && <p className="text-green">{t('admin.documents.filtersActive')}</p>}
          </div>
        </div>

        {error ? (
          <div className="m-4 flex flex-col items-start gap-4 rounded-[16px] border border-error/45 bg-error/5 p-5 sm:m-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <i className="ri-error-warning-line mt-0.5 text-xl text-error" aria-hidden="true" />
              <div><p className="font-semibold text-error">{error}</p><p className="mt-1 text-xs text-ink-variant">{t('admin.documents.errorHint')}</p></div>
            </div>
            <Button variant="secondary" onClick={() => void loadDocuments()}>{t('admin.common.tryAgain')}</Button>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="m-4 grid min-h-[240px] place-items-center rounded-[18px] border border-dashed border-green/25 bg-[radial-gradient(circle_at_top_right,rgba(255,205,0,.08),transparent_32%),linear-gradient(135deg,rgba(0,59,27,.025),transparent)] p-6 text-center sm:m-5">
            <div className="max-w-lg">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[16px] bg-green text-2xl text-gold shadow-[0_12px_26px_rgba(0,59,27,.14)]" aria-hidden="true"><i className={hasFilters ? 'ri-search-eye-line' : 'ri-file-add-line'} /></span>
              <h3 className="mt-5 font-display text-2xl font-bold text-green-deep">{t('admin.documents.emptyTitle')}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-variant">{hasFilters ? t('admin.documents.emptyFilter') : t('admin.documents.emptyAll')}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {hasFilters ? <Button variant="secondary" onClick={resetFilters}><i className="ri-refresh-line" aria-hidden="true" />{t('admin.documents.resetFilters')}</Button> : <Button to="/admin/documents/create" variant="secondary"><i className="ri-add-line" aria-hidden="true" />{t('admin.documents.create')}</Button>}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line/55 bg-surface-container/55">
                    {[t('admin.documents.colDocument'), t('admin.documents.colCategory'), t('admin.documents.colUpdated'), t('admin.documents.colDownloads'), t('admin.common.status'), t('admin.common.actions')].map((label, index) => <th key={label} scope="col" className={`px-5 py-3 text-[9px] font-bold uppercase tracking-[.14em] text-green-deep ${index === 5 ? 'text-right' : ''}`}>{label}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/50">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="group transition-colors hover:bg-surface-container/45">
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green/8 text-lg text-green transition-colors group-hover:bg-green group-hover:text-gold" aria-hidden="true"><i className={doc.icon || 'ri-file-line'} /></span><div className="min-w-0"><p className="font-semibold text-ink">{doc.name}</p>{doc.description && <p className="mt-1 max-w-md truncate text-xs text-ink-variant">{documentSummary(doc.description)}</p>}<p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-ink-muted">{doc.type || t('admin.common.na')} · {doc.size || t('admin.common.na')}</p></div></div></td>
                      <td className="px-5 py-4 text-sm text-ink-variant">{doc.category || t('admin.documents.uncategorized')}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-ink-variant">{formatDate(doc.createdAt)}</td>
                      <td className="px-5 py-4"><span className="inline-flex items-center gap-2 text-sm font-semibold tabular-nums text-ink"><i className="ri-download-line text-green" aria-hidden="true" />{doc.downloads}</span></td>
                      <td className="px-5 py-4"><button type="button" aria-pressed={doc.isActive} onClick={() => void handleToggleActive(doc.id, doc.isActive)} className="rounded-control focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"><StatusChip status={doc.isActive ? 'published' : 'draft'} label={doc.isActive ? t('admin.common.active') : t('admin.common.inactive')} /></button></td>
                      <td className="px-5 py-4 text-right"><DocumentActions document={doc} onDelete={handleDeleteDocument} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 bg-surface-container/35 p-3 md:hidden">
              {filteredDocuments.map((doc) => (
                <article key={doc.id} className="rounded-[16px] border border-line/65 bg-surface p-4 shadow-[0_6px_18px_rgba(0,59,27,.04)]">
                  <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green/9 text-lg text-green" aria-hidden="true"><i className={doc.icon || 'ri-file-line'} /></span><div className="min-w-0 flex-1"><h3 className="break-words font-semibold text-ink">{doc.name}</h3><p className="mt-1 text-xs text-ink-variant">{doc.category || t('admin.documents.uncategorized')}</p></div><button type="button" aria-pressed={doc.isActive} onClick={() => void handleToggleActive(doc.id, doc.isActive)} className="shrink-0 rounded-control focus-visible:outline focus-visible:outline-2 focus-visible:outline-green"><StatusChip status={doc.isActive ? 'published' : 'draft'} label={doc.isActive ? t('admin.common.active') : t('admin.common.inactive')} /></button></div>
                  {doc.description && <p className="mt-3 line-clamp-2 text-sm leading-5 text-ink-variant">{documentSummary(doc.description)}</p>}
                  <dl className="mt-4 grid grid-cols-3 gap-2 border-y border-line/50 py-3 text-xs"><div><dt className="text-[8px] font-bold uppercase tracking-wide text-ink-muted">{t('admin.documents.colUpdated')}</dt><dd className="mt-1 text-ink">{formatDate(doc.createdAt)}</dd></div><div><dt className="text-[8px] font-bold uppercase tracking-wide text-ink-muted">{t('admin.documents.colSize')}</dt><dd className="mt-1 text-ink">{doc.size || t('admin.common.na')}</dd></div><div><dt className="text-[8px] font-bold uppercase tracking-wide text-ink-muted">{t('admin.documents.colDownloads')}</dt><dd className="mt-1 text-ink">{doc.downloads}</dd></div></dl>
                  <div className="mt-3 flex justify-end"><DocumentActions document={doc} onDelete={handleDeleteDocument} /></div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </section>
  );
};

const DocumentActions = ({ document, onDelete }: { document: Document; onDelete: (id: string, name: string) => Promise<void> }) => {
  const { t } = useTranslation();
  const actionClasses = 'inline-flex h-10 w-10 items-center justify-center rounded-[11px] border border-line/65 bg-surface text-green transition-colors hover:border-green hover:bg-green hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green';
  return (
    <div className="inline-flex items-center gap-1.5">
      <Link to={`/admin/documents/${document.id}`} aria-label={`${t('admin.common.view')} — ${document.name}`} title={t('admin.common.view')} className={actionClasses}><i className="ri-eye-line text-base" aria-hidden="true" /></Link>
      <Link to={`/admin/documents/${document.id}/edit`} aria-label={`${t('admin.common.edit')} — ${document.name}`} title={t('admin.common.edit')} className={actionClasses}><i className="ri-edit-line text-base" aria-hidden="true" /></Link>
      <button type="button" onClick={() => void onDelete(document.id, document.name)} aria-label={`${t('admin.common.delete')} — ${document.name}`} title={t('admin.common.delete')} className={`${actionClasses} text-error hover:border-error hover:bg-error`}><i className="ri-delete-bin-line text-base" aria-hidden="true" /></button>
    </div>
  );
};

export default AdminDocumentsList;
