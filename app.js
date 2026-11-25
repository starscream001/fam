const video = document.querySelector('.background-video');
const videoToggle = document.querySelector('.video-toggle');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let userPlayback;

function updateVideoToggle() {
  videoToggle.textContent = video.error
    ? 'Повторить запуск видео'
    : video.paused ? 'Включить фоновое видео' : 'Поставить фоновое видео на паузу';
}

function syncPlayback() {
  if (document.hidden || !(userPlayback ?? !reducedMotion.matches)) {
    video.pause();
    return;
  }

  // Some mobile browsers require this call directly from a tap.
  video.play().catch(updateVideoToggle);
}

video.muted = true;
videoToggle.hidden = false;
videoToggle.addEventListener('click', () => {
  userPlayback = Boolean(video.error) || video.paused;
  if (video.error) {
    video.load();
  }
  syncPlayback();
});
video.addEventListener('play', updateVideoToggle);
video.addEventListener('pause', updateVideoToggle);
video.addEventListener('error', () => {
  video.classList.add('is-unavailable');
  updateVideoToggle();
});
video.addEventListener('loadeddata', () => {
  video.classList.remove('is-unavailable');
});
document.addEventListener('visibilitychange', syncPlayback);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches && userPlayback) {
    userPlayback = undefined;
  }
  syncPlayback();
});
syncPlayback();
