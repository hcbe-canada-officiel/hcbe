import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { messages } from '../i18n/local';
import { siteContentApi } from '../lib/api/site-content';
import type { CmsPublishedContentDto } from '../lib/api/types';
import { createCmsHubConnection } from '../lib/realtime/cms-hub';

interface CmsContentContextValue {
  loading: boolean;
  version: number;
  getValue: (key: string, fallback?: string) => string;
  refresh: () => Promise<void>;
}

const CmsContentContext = createContext<CmsContentContextValue | undefined>(undefined);

export const CmsContentProvider = ({ children }: { children: ReactNode }) => {
  const { i18n: activeI18n } = useTranslation();
  const [items, setItems] = useState<Record<string, CmsPublishedContentDto>>({});
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const appliedTranslationKeys = useRef<Set<string>>(new Set());

  const applyBundle = useCallback((nextItems: CmsPublishedContentDto[]) => {
    const byKey = Object.fromEntries(nextItems.map((item) => [item.key, item]));

    for (const key of appliedTranslationKeys.current) {
      const next = byKey[key];
      if (!next || (next.contentType !== 'text' && next.contentType !== 'richtext')) {
        const fallbackFr = messages.fr?.translation[key];
        const fallbackEn = messages.en?.translation[key];
        if (fallbackFr !== undefined) i18n.addResource('fr', 'translation', key, fallbackFr);
        if (fallbackEn !== undefined) i18n.addResource('en', 'translation', key, fallbackEn);
      }
    }

    const applied = new Set<string>();
    for (const item of nextItems) {
      if (item.contentType !== 'text' && item.contentType !== 'richtext') continue;
      if (item.valueFr !== undefined) i18n.addResource('fr', 'translation', item.key, item.valueFr);
      if (item.valueEn !== undefined) i18n.addResource('en', 'translation', item.key, item.valueEn);
      applied.add(item.key);
    }
    appliedTranslationKeys.current = applied;
    setItems(byKey);
    void i18n.changeLanguage(i18n.language);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const preview = new URLSearchParams(window.location.search).get('cmsPreview') === '1';
      if (preview) {
        const draftResponse = await siteContentApi.getCmsItems();
        if (draftResponse.success && draftResponse.data) {
          applyBundle(draftResponse.data.map((item) => ({
            key: item.key,
            contentType: item.contentType,
            valueFr: item.draftValueFr ?? item.publishedValueFr,
            valueEn: item.draftValueEn ?? item.publishedValueEn,
            version: item.version,
          })));
          setVersion(Math.max(0, ...draftResponse.data.map((item) => item.version)));
          return;
        }
      }
      const response = await siteContentApi.getPublishedCms();
      if (response.success && response.data) {
        applyBundle(response.data.items);
        setVersion(response.data.version);
      }
    } catch {
      // The compiled bilingual content remains a resilient fallback when the API is unavailable.
    } finally {
      setLoading(false);
    }
  }, [applyBundle]);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    const connection = createCmsHubConnection();
    connection.on('ContentPublished', () => {
      void refresh().then(() => window.dispatchEvent(new Event('hcbe:content-published')));
    });
    void connection.start().catch(() => undefined);
    return () => { void connection.stop(); };
  }, [refresh]);

  const getValue = useCallback((key: string, fallback = '') => {
    const item = items[key];
    if (!item) return fallback;
    const english = activeI18n.language.startsWith('en');
    return (english ? item.valueEn || item.valueFr : item.valueFr || item.valueEn) || fallback;
  }, [activeI18n.language, items]);

  const value = useMemo(() => ({ loading, version, getValue, refresh }), [getValue, loading, refresh, version]);
  return <CmsContentContext.Provider value={value}>{children}</CmsContentContext.Provider>;
};

export const useCmsContent = () => {
  const context = useContext(CmsContentContext);
  if (!context) throw new Error('useCmsContent must be used within CmsContentProvider');
  return context;
};
