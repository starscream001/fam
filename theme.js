// Apply the saved theme before the first paint. Storage can be unavailable in private browsing.
(() => {
  const names = ['light', 'mixed', 'dark'];
  const root = document.documentElement;
  const url = new URL(location.href);
  let saved;
  try { saved = localStorage.getItem('fam-theme'); } catch {}
  const requested = url.searchParams.get('palette');
  function apply(name) {
    root.dataset.palette = name;
    document.querySelector('meta[name="theme-color"]').content = name === 'light' ? '#f0eae1' : '#201c1b';
  }
  apply(names.includes(requested) ? requested : names.includes(saved) ? saved : 'light');
  document.addEventListener('DOMContentLoaded', () => {
    const picker = document.querySelector('#theme');
    picker.value = root.dataset.palette;
    picker.parentElement.hidden = false;
    picker.addEventListener('change', () => {
      apply(picker.value);
      try { localStorage.setItem('fam-theme', picker.value); } catch {}
      const current = new URL(location.href);
      if (current.searchParams.has('palette')) {
        current.searchParams.delete('palette');
        history.replaceState(history.state, '', current);
      }
    });
  });
})();
