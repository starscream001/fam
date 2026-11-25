// Set the real counter number here to enable Metrica on both pages.
const metricaId = null;
if (Number.isSafeInteger(metricaId) && metricaId > 0) {
  window.ym = window.ym || function () { (window.ym.a ||= []).push(arguments); };
  window.ym.l = Date.now();
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://mc.yandex.ru/metrika/tag.js';
  document.head.append(tag);
  window.ym(metricaId, 'init', { trackLinks: true, accurateTrackBounce: true });
  const goals = new Map([
    ['https://t.me/f20fam', 'club_chat'], ['https://t.me/famcrsclub', 'announcements'],
    ['https://t.me/fam_feed', 'photos'], ['https://t.me/fameetstock', 'market'],
    ['https://t.me/famdrops', 'shop'], ['https://t.me/stordanya', 'partnership'],
    ['https://www.instagram.com/famcrsclub/', 'instagram'], ['https://www.threads.com/@famcrsclub', 'threads']
  ]);
  const meeting = document.querySelector('.meeting');
  if (meeting && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        window.ym(metricaId, 'reachGoal', 'meeting_view');
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(meeting);
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    const goal = link && (goals.get(link.href) || (link.closest('.meeting') && 'announcements'));
    if (goal) window.ym(metricaId, 'reachGoal', goal);
  });
}
