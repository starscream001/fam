const sections = document.getElementById('club-sections');
const end = document.getElementById('club-end');
const links = [...document.querySelectorAll('.widgets a')];
const destinations = new Map(links.map(link => [link.hash, link.href]));
const status = document.getElementById('section-status');
let loading;

async function loadSections() {
  const response = await fetch('news.html', { cache: 'no-cache' });
  if (!response.ok) throw new Error('Club page unavailable');
  const page = new DOMParser().parseFromString(await response.text(), 'text/html');
  const content = page.getElementById('club-sections');
  if (!content || [...destinations.keys()].some(hash => !content.querySelector(hash))) {
    throw new Error('Incomplete club page');
  }

  content.prepend(content.querySelector('#about'));
  const headline = content.querySelector('#news-title');
  const heading = document.createElement('h2');
  heading.id = headline.id;
  heading.textContent = headline.textContent;
  headline.replaceWith(heading);
  sections.replaceChildren(...content.children);
  end.replaceChildren(page.querySelector('footer'), page.querySelector('.photo-viewer'));
  for (const src of ['gallery.js?v=1', 'archive.js?v=2']) {
    const script = document.createElement('script');
    script.src = src;
    document.body.append(script);
  }
  document.dispatchEvent(new Event('club-ready'));
}

async function navigate() {
  const hash = location.hash;
  const url = destinations.get(hash);
  if (!url) {
    sections.hidden = end.hidden = true;
    sections.querySelectorAll('video,audio').forEach(media => media.pause());
    status.hidden = true;
    return;
  }

  if (!sections.childElementCount) {
    status.textContent = 'Открываем раздел…';
    status.hidden = false;
    try {
      loading ??= loadSections().finally(() => { loading = undefined; });
      await loading;
    } catch {
      if (location.hash === hash) {
        const fallback = document.createElement('a');
        fallback.href = url;
        fallback.textContent = 'Открыть раздел отдельной страницей';
        status.replaceChildren('Не удалось загрузить. ', fallback);
      }
      return;
    }
  }
  if (location.hash !== hash) return;
  status.hidden = true;
  sections.hidden = end.hidden = false;
  const target = document.getElementById(hash.slice(1));
  if (hash === '#join') target.querySelector('details').open = true;
  target.tabIndex = -1;
  target.focus({ preventScroll: true });
  const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'start' });
}

for (const link of links) {
  link.setAttribute('href', link.hash);
  link.addEventListener('click', event => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.hash === location.hash) {
      event.preventDefault();
      navigate();
    }
  });
}
window.addEventListener('hashchange', navigate);
navigate();
