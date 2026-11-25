const video = document.querySelector('.background-video');
const animation = document.querySelector('.background-animation');
const videoToggle = document.querySelector('.video-toggle');

let pausedByVisitor = false;
let usingAnimation = false;
let startupTimer;

function clearStartupTimer() {
  clearTimeout(startupTimer);
  startupTimer = undefined;
}

function showAnimation() {
  clearStartupTimer();
  if (usingAnimation || pausedByVisitor || document.hidden) return;

  usingAnimation = true;
  video.autoplay = false;
  video.pause();
  video.hidden = true;
  video.replaceChildren();
  video.load();
  animation.src = animation.dataset.src;
  animation.hidden = false;
}

function watchForPlayback() {
  if (!startupTimer && !usingAnimation && !pausedByVisitor && !document.hidden) {
    startupTimer = setTimeout(showAnimation, 2200);
  }
}

function syncPlayback() {
  const shouldPlay = !pausedByVisitor && !document.hidden;
  if (usingAnimation) {
    animation.hidden = !shouldPlay || (animation.complete && !animation.naturalWidth);
    return;
  }

  video.autoplay = shouldPlay;
  if (!shouldPlay) {
    clearStartupTimer();
    video.pause();
    return;
  }

  if (video.paused || video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
    watchForPlayback();
  } else {
    videoToggle.hidden = false;
  }
  video.play().catch(error => {
    if (error.name !== 'AbortError') showAnimation();
  });
}

video.muted = true;
videoToggle.dataset.playing = 'true';
videoToggle.addEventListener('click', () => {
  pausedByVisitor = !pausedByVisitor;
  videoToggle.dataset.playing = String(!pausedByVisitor);
  videoToggle.setAttribute('aria-label', pausedByVisitor ? 'Продолжить фоновое видео' : 'Поставить фоновое видео на паузу');
  syncPlayback();
});
video.addEventListener('playing', () => {
  clearStartupTimer();
  if (!usingAnimation && !pausedByVisitor) videoToggle.hidden = false;
});
video.addEventListener('waiting', watchForPlayback);
video.addEventListener('pause', watchForPlayback);
video.addEventListener('error', showAnimation);
video.querySelector('source:last-child').addEventListener('error', showAnimation);
animation.addEventListener('load', () => {
  if (usingAnimation) videoToggle.hidden = false;
});
animation.addEventListener('error', () => {
  animation.hidden = true;
  if (usingAnimation) videoToggle.hidden = true;
});
document.addEventListener('visibilitychange', syncPlayback);
syncPlayback();
