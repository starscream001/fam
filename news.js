// The link opens the complete local news page when JavaScript is unavailable.
const newsLink = document.getElementById('news-toggle');
const newsUrl = newsLink.href;
const newsButton = document.createElement('button');
newsButton.type = 'button';
newsButton.className = newsLink.className;
newsButton.id = newsLink.id;
newsButton.append(...newsLink.childNodes);
newsButton.setAttribute('aria-controls', 'events');
newsButton.setAttribute('aria-expanded', 'false');
newsLink.replaceWith(newsButton);

const newsPanel = document.getElementById('events');
const latest = document.getElementById('latest');
const archive = newsPanel.querySelector('.archive-link');
let pending;

async function loadNews() {
  latest.textContent = 'Загружаем новости…';
  latest.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch(newsUrl, { cache: 'no-cache' });
    if (!response.ok) throw new Error('News unavailable');
    const page = new DOMParser().parseFromString(await response.text(), 'text/html');
    const articles = [...page.querySelectorAll('.stories > article')];
    if (!articles.length) throw new Error('No published articles');
    latest.replaceChildren(...articles.slice(0, 4));
    const archiveLink = page.querySelector('.archive-link');
    archive.hidden = !archiveLink;
    if (archiveLink) archive.href = archiveLink.getAttribute('href');
  } catch {
    const fallback = document.createElement('a');
    fallback.href = newsUrl;
    fallback.textContent = 'Открыть страницу новостей';
    latest.replaceChildren('Не удалось загрузить ленту. ', fallback);
  } finally {
    latest.removeAttribute('aria-busy');
    pending = undefined;
  }
}

async function toggleNews() {
  const opening = newsPanel.hidden;
  newsPanel.hidden = !opening;
  newsButton.setAttribute('aria-expanded', String(opening));
  if (!opening) {
    newsPanel.querySelectorAll('video, audio').forEach(media => media.pause());
    return;
  }
  if (!latest.querySelector('article') && !pending) pending = loadNews();
  await pending;
  if (newsPanel.hidden) return;
  document.getElementById('news-title').focus({ preventScroll: true });
  const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  newsPanel.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
}

newsButton.addEventListener('click', toggleNews);
if (location.hash === '#events') toggleNews();
