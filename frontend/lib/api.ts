export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('talon_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const start = performance.now();
  const res = await fetch(endpoint, {
    ...options,
    headers,
  });
  const duration = Math.round(performance.now() - start);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('talon-latency', { detail: duration }));
  }

  if (res.status === 401 && typeof window !== 'undefined' && !endpoint.includes('/auth/login')) {
    localStorage.clear();
    window.location.href = '/login';
  }

  return res;
}