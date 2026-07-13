const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('ds_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const api = {
  analyzeGitHub: (username: string) =>
    request('/api/analyze/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    }),

  analyzeResume: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request('/api/analyze/resume', { method: 'POST', body: form });
  },

  analyzePortfolio: (url: string) =>
    request('/api/analyze/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    }),

  downloadReport: async (payload: { github?: unknown; resume?: unknown; portfolio?: unknown }) => {
    const token = localStorage.getItem('ds_token');
    const res = await fetch(`${BASE_URL}/api/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Report generation failed' }));
      throw new Error(err.detail || 'Report generation failed');
    }
    return res.blob();
  },

  health: () => request('/health'),
};
