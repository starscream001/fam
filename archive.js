const track = document.querySelector('.archive-track');
const controls = document.querySelector('.archive-controls');
const [previous, next] = controls.querySelectorAll('button');
const slides = [...track.children];

function updateControls() {
  controls.hidden = track.scrollWidth <= track.clientWidth + 2;
  previous.disabled = track.scrollLeft < 2;
  next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
}

function step(direction) {
  const start = track.getBoundingClientRect().left;
  const candidates = direction > 0 ? slides : [...slides].reverse();
  const target = candidates.find(card => direction * (card.getBoundingClientRect().left - start) > 3);
  if (!target) return;
  const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  track.scrollBy({left: target.getBoundingClientRect().left - start, behavior});
}
previous.addEventListener('click', () => step(-1));
next.addEventListener('click', () => step(1));
track.addEventListener('scroll', updateControls, {passive:true});
window.addEventListener('resize', updateControls);
updateControls();
