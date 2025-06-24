// Utility to load a component into a selector
export async function loadComponent(url, selector) {
  // If the url starts with '/', replace with '../' for relative loading
  if (url.startsWith('/client/')) {
    url = url.replace('/client/', '../');
  }
  const res = await fetch(url);
  const html = await res.text();
  document.querySelector(selector).innerHTML = html;
}
