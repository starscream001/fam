const video = document.querySelector('.background-video');
const videoToggle = document.querySelector('.video-toggle');
const videoFile = document.querySelector('.video-file');
const videoStatus = document.querySelector('.video-status');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

let userPlayback;
let playing = !video.paused && video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;
let loadingTimer;

function updateControls() {
  videoToggle.setAttribute('aria-label', playing ? 'Поставить фоновое видео на паузу' : 'Включить фоновое видео');
  videoToggle.dataset.playing = String(playing);
  if (playing) videoFile.hidden = true;
}

function stopLoading(message = '') {
  clearTimeout(loadingTimer);
  videoStatus.textContent = message;
}

function showFallback(message) {
  stopLoading(message);
  videoFile.hidden = false;
}

function syncPlayback(fromTap = false) {
  const shouldPlay = !document.hidden && (userPlayback ?? !reducedMotion.matches);
  video.autoplay = shouldPlay && userPlayback === undefined;
  video.classList.toggle('motion-allowed', userPlayback === true);
  if (!shouldPlay) {
    video.pause();
    stopLoading();
    return;
  }

  if (fromTap) {
    if (video.error || video.classList.contains('is-unavailable')) {
      video.classList.remove('is-unavailable');
      video.load();
    }
    stopLoading('Загружаем видео…');
    loadingTimer = setTimeout(() => showFallback('Видео пока не загрузилось.'), 8000);
  }

  // WebKit may require play() in the same event handler as the tap.
  video.play().catch(error => {
    if (fromTap && error.name !== 'AbortError') {
      showFallback('Не удалось запустить фон.');
    }
  });
}

video.muted = true;
updateControls();
videoToggle.hidden = false;
videoToggle.addEventListener('click', () => {
  userPlayback = !playing;
  syncPlayback(userPlayback);
});
video.addEventListener('playing', () => {
  playing = true;
  updateControls();
  stopLoading();
});
video.addEventListener('pause', () => {
  playing = false;
  updateControls();
  stopLoading();
});
function showVideoError() {
  playing = false;
  video.classList.add('is-unavailable');
  updateControls();
  showFallback('Фоновое видео недоступно.');
}
video.addEventListener('error', showVideoError);
video.querySelector('source:last-child').addEventListener('error', showVideoError);
document.addEventListener('visibilitychange', () => syncPlayback());
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches && userPlayback) userPlayback = undefined;
  syncPlayback();
});
syncPlayback();
