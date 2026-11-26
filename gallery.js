const photos = [...document.querySelectorAll('.photos a')];
const viewer = document.querySelector('.photo-viewer');
const viewerImage = viewer.querySelector('.viewer-image');
const counter = viewer.querySelector('.viewer-count');
let active = 0;
let opener;
let touchStart;

function showPhoto(index) {
  active = (index + photos.length) % photos.length;
  viewerImage.src = photos[active].href;
  viewerImage.alt = photos[active].querySelector('img').alt;
  counter.textContent = (active + 1) + ' / ' + photos.length;
}

photos.forEach((link, index) => link.addEventListener('click', event => {
  if (!viewer.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  opener = link;
  showPhoto(index);
  viewer.showModal();
}));

viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
viewer.addEventListener('close', () => {
  viewerImage.removeAttribute('src');
  opener?.focus({ preventScroll: true });
});
viewer.addEventListener('click', event => {
  const step = event.target.closest('[data-step]');
  if (step) showPhoto(active + Number(step.dataset.step));
  if (event.target === viewer) viewer.close();
});
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showPhoto(active + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
viewerImage.addEventListener('touchstart', event => {
  touchStart = event.touches.length === 1 ? event.touches[0] : null;
}, { passive: true });
viewerImage.addEventListener('touchend', event => {
  if (!touchStart || event.touches.length) return;
  const dx = event.changedTouches[0].clientX - touchStart.clientX;
  const dy = event.changedTouches[0].clientY - touchStart.clientY;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(active + (dx < 0 ? 1 : -1));
  touchStart = null;
}, { passive: true });
viewerImage.addEventListener('touchcancel', () => { touchStart = null; });
