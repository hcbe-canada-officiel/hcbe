import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { inputClasses, plainTextFromRichText, RichTextContent } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { opportunitiesApi } from '../../lib/api/opportunities';
import type { Opportunity } from '../../lib/api/types';
import { localized } from '../../lib/i18n/localized';

type WorkMode = 'all' | 'remote' | 'onsite';

export default function JobsPage() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const en = i18n.language.startsWith('en');
  const locale = en ? 'en-CA' : 'fr-CA';
  const copy = en ? {
    eyebrow: 'Careers · Community',
    title: 'Find your next opportunity within the community.',
    intro: 'Explore jobs shared by trusted organizations and employers serving the Burkinabè community in Canada.',
    publicBadge: 'Open directory', memberBadge: 'Membership required to apply',
    search: 'Search by job, organization, location, or skill', all: 'All work modes', remote: 'Remote', onsite: 'On-site or hybrid',
    results: 'published jobs', result: 'published job', deadline: 'Apply by', location: 'Location', commitment: 'Commitment',
    requirements: 'What we are looking for', benefits: 'What you gain', details: 'View full details', hide: 'Hide details',
    apply: user?.memberId ? 'Apply in my member space' : 'Sign in as a member to apply',
    noteTitle: 'Why is membership required?', note: 'A free HCBE membership lets you apply securely, upload your résumé, and track the status of your application.',
    join: 'Create my free member account', empty: 'No published job matches these filters yet.', reset: 'Reset filters', loading: 'Loading published jobs…', error: 'Jobs could not be loaded. Please try again.', retry: 'Try again',
  } : {
    eyebrow: 'Carrières · Communauté',
    title: 'Trouvez votre prochaine occasion dans la communauté.',
    intro: 'Explorez les emplois partagés par des organisations et employeurs de confiance au service de la communauté burkinabè au Canada.',
    publicBadge: 'Répertoire public', memberBadge: 'Adhésion requise pour postuler',
    search: 'Rechercher par poste, organisation, lieu ou compétence', all: 'Tous les modes de travail', remote: 'À distance', onsite: 'Sur place ou hybride',
    results: 'emplois publiés', result: 'emploi publié', deadline: 'Postuler avant le', location: 'Lieu', commitment: 'Engagement',
    requirements: 'Profil recherché', benefits: 'Ce que vous y gagnez', details: 'Voir tous les détails', hide: 'Masquer les détails',
    apply: user?.memberId ? 'Postuler dans mon espace membre' : 'Se connecter comme membre pour postuler',
    noteTitle: 'Pourquoi faut-il être membre?', note: 'L’adhésion gratuite au HCBE vous permet de postuler de façon sécurisée, de joindre votre CV et de suivre votre candidature.',
    join: 'Créer mon compte membre gratuit', empty: 'Aucun emploi publié ne correspond encore à ces filtres.', reset: 'Réinitialiser les filtres', loading: 'Chargement des emplois publiés…', error: 'Impossible de charger les emplois. Veuillez réessayer.', retry: 'Réessayer',
  };
  const [jobs, setJobs] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<WorkMode>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await opportunitiesApi.getPublished('Job');
      setJobs(response.data ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(locale);
    return jobs.filter((job) => {
      if (mode === 'remote' && !job.isRemote) return false;
      if (mode === 'onsite' && job.isRemote) return false;
      if (!query) return true;
      return [job.title, job.titleEn, job.organization, job.location, job.region, job.skills]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase(locale).includes(query));
    });
  }, [jobs, locale, mode, search]);

  const memberDestination = (id: string) => `/espace-membre?section=opportunities&opportunity=${encodeURIComponent(id)}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="public-grid-pattern relative overflow-hidden bg-green-deep text-white">
          <div className="pointer-events-none absolute -right-24 -top-36 h-[430px] w-[430px] rounded-full border-[72px] border-gold/[.07]" aria-hidden="true" />
          <div className="container-page relative py-16 sm:py-20 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_310px] lg:items-end">
              <div className="max-w-4xl">
                <p className="text-[10px] font-bold uppercase tracking-[.24em] text-gold">{copy.eyebrow}</p>
                <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.02] text-white sm:text-6xl lg:text-7xl">{copy.title}</h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-green-dim sm:text-lg">{copy.intro}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/15 bg-white/[.06] px-5 py-4 backdrop-blur-sm"><i className="ri-eye-line mr-3 text-gold" aria-hidden="true" /><span className="text-xs font-bold uppercase tracking-[.12em]">{copy.publicBadge}</span></div>
                <div className="rounded-2xl border border-gold/35 bg-gold px-5 py-4 text-green-deep"><i className="ri-shield-user-line mr-3" aria-hidden="true" /><span className="text-xs font-bold uppercase tracking-[.1em]">{copy.memberBadge}</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-page py-10 sm:py-14 lg:py-16">
          <div className="relative z-10 -mt-16 grid gap-3 rounded-[24px] border border-line bg-surface p-4 shadow-[0_20px_55px_rgba(0,59,27,.12)] md:grid-cols-[minmax(0,1fr)_260px]">
            <label className="relative block">
              <span className="sr-only">{copy.search}</span>
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-lg text-green" aria-hidden="true" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} className={`${inputClasses} pl-12`} placeholder={copy.search} />
            </label>
            <label>
              <span className="sr-only">{copy.all}</span>
              <select value={mode} onChange={(event) => setMode(event.target.value as WorkMode)} className={inputClasses}>
                <option value="all">{copy.all}</option><option value="remote">{copy.remote}</option><option value="onsite">{copy.onsite}</option>
              </select>
            </label>
          </div>

          <div className="mt-10 flex items-end justify-between gap-5 border-b border-line pb-4">
            <div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-red-link">{en ? 'Current openings' : 'Postes ouverts'}</p><h2 className="mt-2 font-display text-3xl font-bold text-green-deep">{visible.length} {visible.length === 1 ? copy.result : copy.results}</h2></div>
            <span className="hidden text-xs text-ink-muted sm:block">{en ? 'Updated from HCBE publications' : 'Mis à jour depuis les publications HCBE'}</span>
          </div>

          {loading && <div role="status" className="mt-8 rounded-[24px] border border-line bg-surface p-10 text-center text-sm text-ink-variant"><i className="ri-loader-4-line mr-2 animate-spin text-green" aria-hidden="true" />{copy.loading}</div>}
          {!loading && error && <div role="alert" className="mt-8 rounded-[24px] border border-error/25 bg-error/[.04] p-8 text-center"><p className="text-sm text-error">{copy.error}</p><button type="button" onClick={() => void load()} className="mt-4 min-h-11 rounded-xl bg-green px-5 text-[10px] font-bold uppercase tracking-wider text-white">{copy.retry}</button></div>}
          {!loading && !error && visible.length === 0 && <div className="mt-8 rounded-[24px] border border-dashed border-line bg-surface p-10 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-green/10 text-2xl text-green"><i className="ri-briefcase-4-line" aria-hidden="true" /></span><p className="mt-4 font-display text-2xl font-bold text-green-deep">{copy.empty}</p>{(search || mode !== 'all') && <button type="button" onClick={() => { setSearch(''); setMode('all'); }} className="mt-5 text-[10px] font-bold uppercase tracking-wider text-red-link underline underline-offset-4">{copy.reset}</button>}</div>}

          {!loading && !error && visible.length > 0 && <div className="mt-7 grid gap-5 lg:grid-cols-2">
            {visible.map((job, index) => {
              const title = localized(job.title, job.titleEn, i18n.language);
              const location = job.isRemote ? copy.remote : job.location || job.region || 'Canada';
              return <article key={job.id} className="group flex min-w-0 flex-col overflow-hidden rounded-[26px] border border-line bg-surface shadow-[0_14px_42px_rgba(0,59,27,.055)] transition hover:-translate-y-1 hover:border-green/30 hover:shadow-[0_22px_55px_rgba(0,59,27,.1)]">
                <header className="relative overflow-hidden border-b border-line bg-canvas/45 p-6 sm:p-7">
                  <span className="absolute right-5 top-3 font-display text-6xl font-bold text-green/[.045]" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <div className="relative flex flex-wrap items-center gap-2"><span className="rounded-full bg-gold px-3 py-1 text-[9px] font-bold uppercase tracking-[.13em] text-green-deep">{en ? 'Job' : 'Emploi'}</span>{job.isRemote && <span className="rounded-full border border-green/15 bg-surface px-3 py-1 text-[9px] font-bold uppercase tracking-[.13em] text-green">{copy.remote}</span>}</div>
                  <h3 className="relative mt-5 max-w-xl font-display text-2xl font-bold leading-tight text-green-deep sm:text-3xl">{title}</h3>
                  <p className="relative mt-2 text-xs font-bold uppercase tracking-[.1em] text-red-link">{job.organization}</p>
                </header>
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <p className="line-clamp-4 text-sm leading-6 text-ink-variant">{plainTextFromRichText(localized(job.description, job.descriptionEn, i18n.language))}</p>
                  <dl className="mt-6 grid gap-4 border-y border-line py-5 sm:grid-cols-2">
                    <div><dt className="text-[9px] font-bold uppercase tracking-[.14em] text-ink-muted"><i className="ri-map-pin-line mr-2 text-green" aria-hidden="true" />{copy.location}</dt><dd className="mt-2 text-sm font-semibold text-green-deep">{location}</dd></div>
                    {job.deadlineUtc && <div><dt className="text-[9px] font-bold uppercase tracking-[.14em] text-ink-muted"><i className="ri-calendar-check-line mr-2 text-green" aria-hidden="true" />{copy.deadline}</dt><dd className="mt-2 text-sm font-semibold text-green-deep">{new Date(job.deadlineUtc).toLocaleDateString(locale, { dateStyle: 'long' })}</dd></div>}
                    {job.commitment && <div><dt className="text-[9px] font-bold uppercase tracking-[.14em] text-ink-muted"><i className="ri-time-line mr-2 text-green" aria-hidden="true" />{copy.commitment}</dt><dd className="mt-2 text-sm font-semibold text-green-deep">{job.commitment}</dd></div>}
                  </dl>
                  {(job.requirements || job.benefits) && <details className="group/details mt-5 rounded-2xl bg-canvas/55 p-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-green-deep"><span><i className="ri-file-list-3-line mr-2 text-gold-dark" aria-hidden="true" />{copy.details}</span><i className="ri-add-line text-xl transition group-open/details:rotate-45" aria-hidden="true" /></summary>{job.requirements && <div className="mt-4 border-t border-line pt-4"><p className="text-[9px] font-bold uppercase tracking-[.14em] text-red-link">{copy.requirements}</p><RichTextContent value={localized(job.requirements, job.requirementsEn, i18n.language)} className="mt-2 !text-sm !leading-6" /></div>}{job.benefits && <div className="mt-4"><p className="text-[9px] font-bold uppercase tracking-[.14em] text-red-link">{copy.benefits}</p><RichTextContent value={localized(job.benefits, job.benefitsEn, i18n.language)} className="mt-2 !text-sm !leading-6" /></div>}</details>}
                  <Link to={memberDestination(job.id)} className="mt-6 inline-flex min-h-12 items-center justify-between rounded-xl bg-green-deep px-5 text-[10px] font-bold uppercase tracking-[.11em] text-white transition hover:bg-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"><span>{copy.apply}</span><i className="ri-arrow-right-line text-lg text-gold" aria-hidden="true" /></Link>
                </div>
              </article>;
            })}
          </div>}

          <aside className="public-grid-pattern mt-12 overflow-hidden rounded-[26px] bg-green-deep p-7 text-white sm:p-9 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-gold">{copy.noteTitle}</p><p className="mt-3 text-sm leading-6 text-green-dim sm:text-base">{copy.note}</p></div>
            {!user?.memberId && <Link to="/espace-membre" className="mt-6 inline-flex min-h-12 shrink-0 items-center rounded-xl bg-gold px-5 text-[10px] font-bold uppercase tracking-[.11em] text-green-deep lg:mt-0">{copy.join}<i className="ri-arrow-right-line ml-2 text-lg" aria-hidden="true" /></Link>}
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
