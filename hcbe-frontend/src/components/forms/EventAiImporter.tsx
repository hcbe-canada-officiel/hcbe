import { useEffect, useRef, useState } from 'react';
import { aiApi, type AiEventDraft } from '../../lib/api/ai';
import { Button } from '../ui';

export function EventAiImporter({ french, onApply }: { french: boolean; onApply: (draft: AiEventDraft) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File>();
  const [accepted, setAccepted] = useState(false);
  const [draft, setDraft] = useState<AiEventDraft>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { aiApi.status().then((response) => setAvailable(Boolean(response.data?.features?.eventExtraction))).catch(() => undefined); }, []);
  if (!available) return null;
  const extract = async () => {
    if ((!text.trim() && !file) || !accepted) return;
    setBusy(true); setError(''); setDraft(undefined);
    try { const response = await aiApi.extractEvent(text, french ? 'fr' : 'en', accepted, file); if (response.data) setDraft(response.data); else throw new Error(response.message); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Error'); }
    finally { setBusy(false); }
  };
  return <>
    <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-green hover:text-red-link"><i className="ri-scan-2-line text-base" />{french ? 'Importer avec l’IA' : 'Import with AI'}</button>
    {open && <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-green-deep/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <section className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/20 bg-surface shadow-2xl">
        <header className="relative overflow-hidden bg-green-deep px-6 py-6 text-white"><div className="absolute -right-12 -top-16 h-44 w-44 rounded-full border-[30px] border-gold/10"/><div className="relative flex justify-between gap-5"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-gold">HCBE · IA</p><h2 className="mt-2 font-display text-3xl font-bold">{french ? 'Transformer une annonce en événement' : 'Turn an announcement into an event'}</h2><p className="mt-2 max-w-lg text-sm text-white/65">{french ? 'Collez un message WhatsApp ou joignez une affiche/PDF. Vous vérifierez le brouillon avant de l’appliquer.' : 'Paste a WhatsApp message or attach a flyer/PDF. You will review the draft before applying it.'}</p></div><button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15"><i className="ri-close-line text-lg"/></button></div></header>
        <div className="max-h-[65vh] overflow-y-auto p-6">
          <textarea rows={6} value={text} onChange={(event) => setText(event.target.value)} className="block w-full resize-y rounded-2xl border border-outline bg-canvas px-4 py-3 text-sm leading-6 outline-none focus:border-green" placeholder={french ? 'Collez ici le texte de l’annonce…' : 'Paste the announcement text here…'} />
          <input ref={input} type="file" className="hidden" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0])}/>
          <button type="button" onClick={() => input.current?.click()} className="mt-3 flex w-full items-center justify-between rounded-2xl border border-dashed border-green/25 bg-green/[.04] px-4 py-4 text-left text-sm text-green"><span><i className="ri-attachment-2 mr-2"/>{file?.name || (french ? 'Ajouter une affiche ou un PDF' : 'Add a flyer or PDF')}</span><span className="text-[9px] font-bold uppercase tracking-[.12em]">10 MB max</span></button>
          <label className="mt-4 flex gap-3 rounded-2xl bg-gold/[.08] p-4 text-xs leading-5 text-ink-variant"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 accent-green"/><span>{french ? 'Je confirme avoir l’autorisation d’utiliser ce contenu, avoir retiré les données sensibles et je vérifierai toutes les informations.' : 'I confirm I may use this content, removed sensitive data, and will review every detail.'}</span></label>
          {error && <p className="mt-4 rounded-xl border border-red-300/40 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {draft && <div className="mt-5 rounded-2xl border border-green/15 bg-canvas p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-red-link">{french ? 'Brouillon extrait' : 'Extracted draft'}</p><h3 className="mt-1 font-display text-2xl font-bold text-green-deep">{draft.title || draft.titleEn}</h3></div><span className="rounded-full bg-green px-3 py-1 text-[10px] font-bold text-white">{Math.round(draft.confidence * 100)}%</span></div><dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2"><div><dt className="font-bold uppercase tracking-wider text-ink-variant">{french ? 'Début' : 'Start'}</dt><dd className="mt-1">{draft.startsAt ? new Date(draft.startsAt).toLocaleString() : '—'}</dd></div><div><dt className="font-bold uppercase tracking-wider text-ink-variant">{french ? 'Lieu' : 'Location'}</dt><dd className="mt-1">{draft.location || '—'}</dd></div></dl>{draft.warnings.length > 0 && <ul className="mt-4 space-y-1 border-t border-line pt-3 text-xs text-red-link">{draft.warnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul>}<Button type="button" className="mt-5" onClick={() => { onApply(draft); setOpen(false); }}>{french ? 'Appliquer au formulaire' : 'Apply to form'}</Button></div>}
        </div>
        {!draft && <footer className="border-t border-line p-4 text-right"><Button type="button" disabled={busy || !accepted || (!text.trim() && !file)} onClick={() => void extract()}>{busy ? (french ? 'Analyse…' : 'Analyzing…') : (french ? 'Créer le brouillon' : 'Create draft')}</Button></footer>}
      </section>
    </div>}
  </>;
}
