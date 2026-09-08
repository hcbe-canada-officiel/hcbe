import { getApiBaseUrl } from './base-url';
import { apiClient } from './client';
import type { ApiResponse } from './types';

export interface AiStatus {
  enabled: boolean;
  configured: boolean;
  provider: string;
  model: string;
  features: Record<string, boolean>;
}

export interface AiSource { id: string; title: string; url: string; type: string; excerpt?: string; }
export interface AiAssistantAnswer { answer: string; suggestedAction?: string; sources: AiSource[]; requiresHumanHelp: boolean; }
export interface AiWritingResult { title: string; body: string; excerpt?: string; language: string; reviewNotes: string[]; }
export interface AiEventDraft {
  title: string; titleEn?: string; description?: string; descriptionEn?: string;
  startsAt?: string; endsAt?: string; timeZone?: string; location?: string; locationEn?: string;
  type?: string; format?: string; zone?: string; capacity?: number; registrationDeadline?: string;
  meetingLink?: string; registrationUrl?: string; speakers: string[]; organizers: string[];
  confidence: number; warnings: string[];
}
export interface AiRoutingSuggestion {
  category: string; priority: string; associationId?: string; associationName?: string;
  rationale: string; confidence: number; reviewFlags: string[];
}

export const aiApi = {
  status: () => apiClient.get<AiStatus>('/api/ai/status'),
  ask: (question: string, language: string, privacyAccepted: boolean, currentPath?: string) =>
    apiClient.post<AiAssistantAnswer>('/api/ai/assistant', { question, language, privacyAccepted, currentPath }, false),
  write: (sourceText: string, action: string, language: string, purpose: string, context: string, privacyAccepted: boolean) =>
    apiClient.post<AiWritingResult>('/api/admin/ai/writing', { sourceText, action, language, purpose, context, privacyAccepted }),
  routeCase: (id: string, language: string, privacyAccepted: boolean) =>
    apiClient.post<AiRoutingSuggestion>(`/api/admin/ai/service-cases/${id}/route`, { language, privacyAccepted }),
  extractEvent: async (sourceText: string, language: string, privacyAccepted: boolean, file?: File): Promise<ApiResponse<AiEventDraft>> => {
    const body = new FormData();
    body.append('sourceText', sourceText);
    body.append('language', language);
    body.append('privacyAccepted', String(privacyAccepted));
    if (file) body.append('file', file);
    const response = await fetch(`${getApiBaseUrl()}/api/admin/ai/events/extract`, {
      method: 'POST', credentials: 'include', body,
      headers: localStorage.getItem('hcbe_token') ? { Authorization: `Bearer ${localStorage.getItem('hcbe_token')}` } : undefined,
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || 'Unable to extract event');
    return payload;
  },
};
