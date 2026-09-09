import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { aiApi } from '../../lib/api/ai';

const allowedElements = ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'em', 'blockquote', 'a', 'hr', 'br', 'code'];

export const plainTextFromRichText = (value: string) => value
  .replace(/<[^>]*>/g, ' ')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/^\s{0,3}(#{1,6}|>|[-+*]|\d+[.)])\s+/gm, '')
  .replace(/[*_~`]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

export function RichTextContent({ value, className = '' }: { value?: string | null; className?: string }) {
  if (!value) return null;
  return (
    <div className={`rich-text-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        allowedElements={allowedElements}
        unwrapDisallowed
        components={{ a: ({ children, ...props }) => <a {...props} target="_blank" rel="noreferrer">{children}</a> }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
}

type Format = 'bold' | 'italic' | 'heading' | 'bullet' | 'ordered' | 'quote' | 'link';

interface RichTextEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  minHeight?: number;
  className?: string;
  label?: string;
}

const formats: Array<{ name: Format; icon: string; fr: string; en: string }> = [
  { name: 'bold', icon: 'ri-bold', fr: 'Gras', en: 'Bold' },
  { name: 'italic', icon: 'ri-italic', fr: 'Italique', en: 'Italic' },
  { name: 'heading', icon: 'ri-heading', fr: 'Intertitre', en: 'Heading' },
  { name: 'bullet', icon: 'ri-list-unordered', fr: 'Liste à puces', en: 'Bulleted list' },
  { name: 'ordered', icon: 'ri-list-ordered-2', fr: 'Liste numérotée', en: 'Numbered list' },
  { name: 'quote', icon: 'ri-double-quotes-l', fr: 'Citation', en: 'Quote' },
  { name: 'link', icon: 'ri-link', fr: 'Lien', en: 'Link' },
];

export function RichTextEditor({ id, value, onChange, placeholder, required, maxLength, minHeight = 240, className = '', label }: RichTextEditorProps) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiAction, setAiAction] = useState(value.trim() ? 'improve' : 'draft');
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiAccepted, setAiAccepted] = useState(() => localStorage.getItem('hcbe_admin_ai_notice_accepted') === 'true');
  const french = document.documentElement.lang !== 'en';

  useEffect(() => {
    if (!window.location.pathname.startsWith('/admin')) return;
    aiApi.status().then((response) => setAiAvailable(Boolean(response.data?.features?.writingCopilot))).catch(() => undefined);
  }, []);

  const generateDraft = async () => {
    const source = value.trim() || aiInstruction.trim();
    if (!source || !aiAccepted) return;
    setAiBusy(true); setAiError(''); setAiResult('');
    try {
      const response = await aiApi.write(source, aiAction, french ? 'fr' : 'en', label || 'content', aiInstruction, aiAccepted);
      if (!response.data) throw new Error(response.message);
      setAiResult(response.data.body);
    } catch (error) { setAiError(error instanceof Error ? error.message : (french ? 'Impossible de générer le brouillon.' : 'Unable to generate the draft.')); }
    finally { setAiBusy(false); }
  };

  const format = (kind: Format) => {
    const element = textarea.current;
    if (!element) return;
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const selection = value.slice(start, end);
    let before = '';
    let after = '';
    let replacement = selection;

    if (kind === 'bold') { before = '**'; after = '**'; replacement ||= french ? 'texte important' : 'important text'; }
    if (kind === 'italic') { before = '_'; after = '_'; replacement ||= french ? 'texte' : 'text'; }
    if (kind === 'link') { before = '['; after = '](https://)'; replacement ||= french ? 'texte du lien' : 'link text'; }
    if (kind === 'heading') { before = '## '; replacement ||= french ? 'Intertitre' : 'Heading'; }
    if (kind === 'quote') { before = '> '; replacement ||= french ? 'Citation' : 'Quote'; }
    if (kind === 'bullet') { before = '- '; replacement = (selection || (french ? 'Élément de liste' : 'List item')).replace(/\n/g, '\n- '); }
    if (kind === 'ordered') { before = '1. '; replacement = (selection || (french ? 'Élément de liste' : 'List item')).split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n'); }

    const next = `${value.slice(0, start)}${before}${replacement}${after}${value.slice(end)}`;
    if (maxLength && next.length > maxLength) return;
    onChange(next);
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(start + before.length, start + before.length + replacement.length);
    });
  };

  return (
    <div className={`rich-text-editor overflow-hidden rounded-[16px] border border-outline bg-surface shadow-[0_8px_24px_rgba(0,59,27,.045)] transition focus-within:border-green focus-within:ring-2 focus-within:ring-green/15 ${className}`}>
      <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-line/70 bg-surface-container/70 px-2.5 py-2">
        <div className="flex flex-wrap items-center gap-1" role="toolbar" aria-label={french ? 'Mise en forme du texte' : 'Text formatting'}>
          {formats.map((item) => (
            <button key={item.name} type="button" title={french ? item.fr : item.en} aria-label={french ? item.fr : item.en} onClick={() => format(item.name)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm text-ink-variant transition hover:bg-surface hover:text-green focus-visible:outline-offset-1">
              <i className={item.icon} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border border-line bg-surface p-0.5 text-[9px] font-bold uppercase tracking-[.1em]">
          {aiAvailable && <button type="button" onClick={() => setAiOpen((current) => !current)} className={`mr-1 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${aiOpen ? 'bg-gold text-green-deep' : 'text-green'}`}><i className="ri-sparkling-2-fill" />IA</button>}
          <button type="button" onClick={() => setPreview(false)} className={`rounded-md px-2.5 py-1.5 transition ${!preview ? 'bg-green text-white' : 'text-ink-variant'}`}>{french ? 'Écrire' : 'Write'}</button>
          <button type="button" onClick={() => setPreview(true)} className={`rounded-md px-2.5 py-1.5 transition ${preview ? 'bg-green text-white' : 'text-ink-variant'}`}>{french ? 'Aperçu' : 'Preview'}</button>
        </div>
      </div>
      {aiOpen && <div className="border-b border-line bg-green-deep px-4 py-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-gold">{french ? 'Copilote éditorial' : 'Editorial copilot'}</p><p className="mt-1 text-xs text-white/65">{french ? 'Le texte ne change qu’après votre validation.' : 'Your text changes only after you approve it.'}</p></div><select value={aiAction} onChange={(event) => setAiAction(event.target.value)} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white outline-none">{[['draft', french ? 'Rédiger' : 'Draft'], ['improve', french ? 'Améliorer' : 'Improve'], ['rewrite', french ? 'Réécrire' : 'Rewrite'], ['shorten', french ? 'Raccourcir' : 'Shorten'], ['translate', french ? 'Traduire' : 'Translate']].map(([key, text]) => <option className="text-ink" key={key} value={key}>{text}</option>)}</select></div>
        <textarea rows={2} value={aiInstruction} onChange={(event) => setAiInstruction(event.target.value)} className="mt-3 block w-full resize-y rounded-xl border border-white/15 bg-white/[.08] px-3 py-2 text-xs text-white outline-none placeholder:text-white/45" placeholder={french ? 'Consigne ou contexte (sans données sensibles)…' : 'Instruction or context (no sensitive data)…'} />
        <label className="mt-3 flex items-start gap-2 text-[11px] leading-4 text-white/65"><input type="checkbox" checked={aiAccepted} onChange={(event) => { setAiAccepted(event.target.checked); if (event.target.checked) localStorage.setItem('hcbe_admin_ai_notice_accepted', 'true'); }} className="mt-0.5 accent-gold" /><span>{french ? 'J’ai retiré les données sensibles et je vérifierai le résultat.' : 'I removed sensitive data and will review the result.'}</span></label>
        <button type="button" disabled={aiBusy || !aiAccepted || (!value.trim() && !aiInstruction.trim())} onClick={() => void generateDraft()} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-green-deep disabled:opacity-40">{aiBusy ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-sparkling-2-line" />}{french ? 'Générer un brouillon' : 'Generate draft'}</button>
        {aiError && <p className="mt-3 text-xs text-red-200">{aiError}</p>}
        {aiResult && <div className="mt-4 rounded-2xl bg-white p-4 text-ink"><p className="mb-2 text-[9px] font-bold uppercase tracking-[.15em] text-green">{french ? 'Proposition à vérifier' : 'Draft to review'}</p><div className="max-h-56 overflow-y-auto"><RichTextContent value={aiResult} /></div><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => { if (!maxLength || aiResult.length <= maxLength) { onChange(aiResult); setAiOpen(false); setPreview(false); } }} className="rounded-lg bg-green px-3 py-2 text-[10px] font-bold uppercase tracking-[.1em] text-white">{french ? 'Remplacer le texte' : 'Replace text'}</button><button type="button" onClick={() => { const next = `${value}${value ? '\n\n' : ''}${aiResult}`; if (!maxLength || next.length <= maxLength) { onChange(next); setAiOpen(false); } }} className="rounded-lg border border-green/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[.1em] text-green">{french ? 'Ajouter à la suite' : 'Append'}</button></div></div>}
      </div>}
      {preview ? (
        <div className="overflow-y-auto px-5 py-4" style={{ minHeight }} aria-label={french ? `Aperçu ${label || ''}` : `${label || ''} preview`}>
          {value ? <RichTextContent value={value} /> : <p className="text-sm italic text-ink-variant/70">{french ? 'Commencez à écrire pour afficher l’aperçu.' : 'Start writing to see a preview.'}</p>}
        </div>
      ) : (
        <textarea data-rich-text-input ref={textarea} id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} maxLength={maxLength} className="block w-full resize-y bg-transparent px-5 py-4 text-[15px] leading-7 text-ink outline-none placeholder:text-ink-variant/55" style={{ minHeight }} aria-label={label} />
      )}
      <div className="flex min-h-9 items-center justify-between gap-3 border-t border-line/60 bg-surface-container/45 px-4 py-2 text-[10px] text-ink-variant">
        <span className="inline-flex items-center gap-1.5"><i className="ri-markdown-line text-green" aria-hidden="true" />{french ? 'Mise en forme sécurisée' : 'Safe formatting'}</span>
        {maxLength && <span className="tabular-nums">{value.length}/{maxLength}</span>}
      </div>
    </div>
  );
}
