import { FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { aiApi, type AiAssistantAnswer } from '../../lib/api/ai';

export default function CommunityAiAssistant() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const fr = i18n.language.startsWith('fr');
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(() => localStorage.getItem('hcbe_ai_notice_accepted') === 'true');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<AiAssistantAnswer | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    aiApi.status().then((response) => setAvailable(Boolean(response.data?.enabled && response.data.features?.assistant))).catch(() => setAvailable(false));
  }, []);
  useEffect(() => { if (open) window.setTimeout(() => input.current?.focus(), 100); }, [open]);

  if (!available || location.pathname.startsWith('/admin')) return null;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!accepted || question.trim().length < 3) return;
    setBusy(true); setError(''); setAnswer(null);
    try {
      const response = await aiApi.ask(question.trim(), fr ? 'fr' : 'en', accepted, location.pathname);
      if (response.data) setAnswer(response.data);
      else throw new Error(response.message);
    } catch (reason) { setError(reason instanceof Error ? reason.message : (fr ? 'Une erreur est survenue.' : 'Something went wrong.')); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed bottom-24 right-4 z-[70] sm:bottom-7 sm:right-7">
      {open && <section role="dialog" aria-label={fr ? 'Assistant HCBE' : 'HCBE assistant'} className="mb-3 flex max-h-[min(640px,72vh)] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[28px] border border-white/15 bg-green-deep text-white shadow-[0_28px_90px_rgba(0,32,15,.35)]">
        <header className="relative overflow-hidden border-b border-white/10 px-5 py-5">
          <div className="absolute -right-9 -top-12 h-36 w-36 rounded-full border-[24px] border-gold/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-gold">HCBE · IA</p><h2 className="mt-1 font-display text-2xl font-bold">{fr ? 'Votre guide communautaire' : 'Your community guide'}</h2><p className="mt-1 text-xs leading-5 text-white/65">{fr ? 'Réponses fondées sur les contenus approuvés du HCBE.' : 'Answers grounded in approved HCBE content.'}</p></div>
            <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 hover:bg-white/10" aria-label={fr ? 'Fermer' : 'Close'}><i className="ri-close-line text-lg" /></button>
          </div>
        </header>
        <div className="overflow-y-auto px-5 py-4">
          {!accepted && <label className="block rounded-2xl border border-gold/25 bg-white/[.06] p-4 text-xs leading-5 text-white/75"><span className="flex gap-3"><input type="checkbox" className="mt-1 h-4 w-4 accent-gold" checked={accepted} onChange={(event) => { setAccepted(event.target.checked); if (event.target.checked) localStorage.setItem('hcbe_ai_notice_accepted', 'true'); }} /><span>{fr ? 'J’accepte que ma question soit traitée par notre fournisseur IA. Je n’y inscris aucun renseignement sensible. Les réponses peuvent contenir des erreurs.' : 'I agree that my question may be processed by our AI provider. I will not include sensitive information. Answers can contain errors.'}</span></span></label>}
          {answer && <article className="space-y-4 text-sm leading-6"><p className="whitespace-pre-wrap text-white/90">{answer.answer}</p>{answer.sources.length > 0 && <div className="border-t border-white/10 pt-3"><p className="mb-2 text-[9px] font-bold uppercase tracking-[.16em] text-gold">{fr ? 'Sources HCBE' : 'HCBE sources'}</p><div className="flex flex-wrap gap-2">{answer.sources.map((source) => <a key={`${source.type}-${source.url}`} href={source.url} className="rounded-full border border-white/15 px-3 py-1 text-[11px] hover:border-gold hover:text-gold">{source.title}</a>)}</div></div>}{answer.requiresHumanHelp && <a href="/contact" className="inline-flex items-center gap-2 font-bold text-gold">{fr ? 'Parler à l’équipe HCBE' : 'Contact the HCBE team'} <i className="ri-arrow-right-up-line" /></a>}</article>}
          {error && <p role="alert" className="rounded-xl border border-red-300/30 bg-red-300/10 p-3 text-xs text-red-100">{error}</p>}
          {!answer && accepted && !error && <div className="py-2 text-sm text-white/65"><i className="ri-sparkling-2-line mr-2 text-gold" />{fr ? 'Posez une question sur les services, événements, associations ou documents du HCBE.' : 'Ask about HCBE services, events, associations or documents.'}</div>}
        </div>
        <form onSubmit={submit} className="mt-auto border-t border-white/10 bg-black/10 p-3">
          <div className="flex items-center gap-2 rounded-2xl bg-white p-2 pl-4 text-ink"><input ref={input} value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={600} disabled={!accepted || busy} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder={fr ? 'Comment le HCBE peut-il m’aider ?' : 'How can HCBE help me?'} /><button disabled={!accepted || busy || question.trim().length < 3} className="grid h-10 w-10 place-items-center rounded-xl bg-gold text-green-deep disabled:opacity-40" aria-label={fr ? 'Envoyer' : 'Send'}>{busy ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-arrow-up-line" />}</button></div>
        </form>
      </section>}
      <button type="button" onClick={() => setOpen((value) => !value)} className="ml-auto flex h-14 items-center gap-3 rounded-full bg-gold px-4 font-bold text-green-deep shadow-[0_12px_35px_rgba(0,59,27,.28)] transition hover:-translate-y-0.5" aria-expanded={open}><i className="ri-sparkling-2-fill text-xl" /><span className="hidden pr-1 text-xs uppercase tracking-[.12em] sm:block">{fr ? 'Assistant HCBE' : 'HCBE assistant'}</span></button>
    </div>
  );
}
