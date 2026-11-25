const backdrop = document.querySelector('.backdrop');
const video = document.querySelector('.background-video');
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isMobile = isIOS || matchMedia('(max-width: 767px), (hover: none) and (pointer: coarse)').matches;
let motionImage;

function tryInlineImage() {
  if (!isIOS || motionImage || document.hidden) return;

  // WebKit can display the same H.264 file as a looping image.
  motionImage = new Image();
  motionImage.className = 'background-motion';
  motionImage.alt = '';
  motionImage.addEventListener('load', () => {
    if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return;
    video.autoplay = false;
    video.hidden = true;
    video.pause();
    backdrop.append(motionImage);
  }, { once: true });
  motionImage.src = video.dataset.mobileSrc;
}

function syncPlayback() {
  if (video.hidden) return;
  video.autoplay = !document.hidden;
  if (document.hidden) {
    video.pause();
    return;
  }

  video.play().catch(error => {
    if (error.name !== 'AbortError') tryInlineImage();
  });
}

video.muted = true;
video.addEventListener('error', tryInlineImage);
const mp4 = document.createElement('source');
mp4.src = isMobile ? video.dataset.mobileSrc : video.dataset.desktopSrc;
mp4.type = 'video/mp4';

const webm = document.createElement('source');
webm.src = 'assets/background-compatible.webm';
webm.type = 'video/webm';
webm.addEventListener('error', tryInlineImage);
video.append(mp4, webm);
document.addEventListener('visibilitychange', syncPlayback);
window.addEventListener('pageshow', syncPlayback);
syncPlayback();

if (isIOS) {
  setTimeout(() => {
    if (video.currentTime === 0) tryInlineImage();
  }, 5000);
}
