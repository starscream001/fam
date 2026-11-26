const track = document.querySelector('.archive-track');
const controls = document.querySelector('.archive-controls');
if (track && controls) {
  const [previous, next] = controls.querySelectorAll('button');

  function updateControls() {
    const remaining = track.scrollWidth - track.clientWidth - track.scrollLeft;
    controls.hidden = !track.clientWidth || track.scrollWidth <= track.clientWidth + 2;
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = remaining <= 2;
  }

  function step(direction) {
    const start = track.getBoundingClientRect().left;
    const cards = Array.from(track.children);
    if (direction < 0) cards.reverse();
    const target = cards.find(card => direction * (card.getBoundingClientRect().left - start) > 3);
    if (!target) return;
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    track.scrollBy({left: target.getBoundingClientRect().left - start, behavior});
  }

  previous.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  track.addEventListener('keydown', event => {
    if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    step(event.key === 'ArrowRight' ? 1 : -1);
  });
  track.addEventListener('scroll', updateControls, { passive:true });
  if ('ResizeObserver' in window) new ResizeObserver(updateControls).observe(track);
  else window.addEventListener('resize', updateControls);
  updateControls();
}
