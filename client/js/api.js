// API utility for NewsSite

export async function apiGet(url) {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('API error');
  return res.json();
}

export async function apiPost(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('API error');
  return res.json();
}
