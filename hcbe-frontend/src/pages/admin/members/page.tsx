import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { membersApi } from '../../../lib/api/members';
import type { MemberDto } from '../../../lib/api/types';
import { AdminListPage } from '../../../components/admin/AdminListPage';
import { Field, Td, inputClasses } from '../../../components/ui';
import { MemberDataTools } from '../../../components/admin/MemberDataTools';

const MemberMetric = ({ value, label, icon, tone = 'green' }: { value: number; label: string; icon: string; tone?: 'green' | 'gold' | 'red' }) => {
  const tones = { green: 'bg-green/9 text-green', gold: 'bg-gold/18 text-gold-ink', red: 'bg-red-link/8 text-red-link' };
  return <article className="rounded-[18px] border border-line/65 bg-surface p-4 shadow-[0_8px_24px_rgba(0,59,27,.045)]"><div className="flex items-center justify-between gap-4"><div><strong className="block font-display text-[30px] leading-none tabular-nums text-green-deep">{value.toLocaleString()}</strong><span className="mt-2 block text-[9px] font-bold uppercase tracking-[.14em] text-ink-variant">{label}</span></div><span className={`flex h-11 w-11 items-center justify-center rounded-[13px] ${tones[tone]}`}><i className={`${icon} text-lg`} aria-hidden="true" /></span></div></article>;
};

const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<MemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { t, i18n } = useTranslation();

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await membersApi.searchMembers({ page, search, sort });
      if (response.success && response.data) {
        setMembers(response.data.items);
        setTotalItems(response.data.totalItems);
        setTotalPages(response.data.totalPages);
      } else {
        setError(t('admin.members.errorLoad'));
      }
    } catch (err) {
      console.error('Error loading members:', err);
      setError(t('admin.members.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [page, search, sort]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(t('admin.common.confirmDelete', { name }))) {
      return;
    }

    try {
      const response = await membersApi.deleteMember(id);
      if (response.success) {
        loadMembers();
      }
    } catch (err) {
      console.error('Error deleting member:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin border-2 border-line border-t-green" />
      </div>
    );
  }

  const representedProvinces = new Set(members.map((member) => member.province).filter(Boolean)).size;
  const profiledMembers = members.filter((member) => Boolean(member.profession || member.expertise)).length;
  const locale = i18n.language.startsWith('fr') ? 'fr-CA' : 'en-CA';

  return (
    <div className="space-y-5">
    <AdminListPage
      title={t('admin.members.title')}
      count={error ? undefined : totalItems}
      createLabel={t('admin.members.create')}
      createPath="/admin/members/create"
      summary={<section className="grid gap-3 sm:grid-cols-3" aria-label={t('admin.members.summaryLabel')}><MemberMetric value={totalItems} label={t('admin.members.statsTotal')} icon="ri-group-line" /><MemberMetric value={representedProvinces} label={t('admin.members.statsProvinces')} icon="ri-map-2-line" tone="gold" /><MemberMetric value={profiledMembers} label={t('admin.members.statsProfiles')} icon="ri-briefcase-4-line" tone="red" /></section>}
      toolbar={(
        <>
          <Field label={t('admin.list.search')} htmlFor="member-search">
            <div className="relative"><i className="ri-search-line pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-variant" aria-hidden="true" /><input id="member-search" className={`${inputClasses} pl-11`} value={search} placeholder={t('admin.members.searchPlaceholder')} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div>
          </Field>
          <Field label={t('admin.common.sort')} htmlFor="member-sort">
            <select id="member-sort" className={inputClasses} value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}>
              <option value="newest">{t('admin.common.newest')}</option>
              <option value="oldest">{t('admin.common.oldest')}</option>
              <option value="name">{t('admin.common.name')}</option>
            </select>
          </Field>
        </>
      )}
      columns={[
        { key: 'member', label: t('admin.members.colMember') },
        { key: 'location', label: t('admin.common.location') },
        { key: 'profession', label: t('admin.members.colProfession') },
        { key: 'date', label: t('admin.common.date') },
        { key: 'actions', label: t('admin.common.actions'), align: 'right' },
      ]}
      isEmpty={members.length === 0}
      emptyTitle={t('admin.members.emptyTitle')}
      emptyDescription={search ? t('admin.members.emptySearch') : t('admin.members.emptyAll')}
      error={error ?? undefined}
      onRetry={loadMembers}
      pagination={{ page, totalPages, totalItems, onPageChange: setPage }}
    >
      {members.map((member) => (
        <tr key={member.id} className="transition-colors hover:bg-surface-container">
          <Td className="text-ink">
            <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green text-[11px] font-bold uppercase text-white">{`${member.firstName?.[0] ?? ''}${member.lastName?.[0] ?? ''}` || 'HC'}</span><div className="min-w-0"><div className="font-semibold">{member.firstName} {member.lastName}</div><div className="mt-0.5 max-w-[260px] truncate text-xs text-ink-variant">{member.email}</div></div></div>
          </Td>
          <Td><span className="inline-flex items-center gap-1.5"><i className="ri-map-pin-line text-green" aria-hidden="true" />{[member.city, member.province].filter(Boolean).join(', ') || t('admin.common.na')}</span></Td>
          <Td>{member.profession ? <span className="inline-flex rounded-full border border-green/20 bg-green/5 px-3 py-1 text-xs text-green">{member.profession}</span> : t('admin.common.na')}</Td>
          <Td><time dateTime={member.createdAt}>{new Date(member.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}</time></Td>
          <Td align="right">
            <div className="inline-flex items-center justify-end gap-1">
              <Link
                to={`/admin/members/${member.id}`}
                aria-label={t('admin.common.view')}
                title={t('admin.common.view')}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-green transition-colors hover:text-green-deep"
              >
                <i className="ri-eye-line text-lg" aria-hidden="true" />
              </Link>
              <Link
                to={`/admin/members/${member.id}/edit`}
                aria-label={t('admin.common.edit')}
                title={t('admin.common.edit')}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-green transition-colors hover:text-green-deep"
              >
                <i className="ri-edit-line text-lg" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(member.id, `${member.firstName} ${member.lastName}`)}
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
    <MemberDataTools onChanged={loadMembers} />
    </div>
  );
};

export default MembersPage;
