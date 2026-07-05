export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export const requestApi = async (path, options = {}) => {
  const response = await fetch(apiUrl(path), {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(body?.error || 'Request failed.');
  }

  return body;
};
