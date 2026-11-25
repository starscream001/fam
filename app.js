const video = document.querySelector('.background-video');
const original = video.src;
const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

let started = false;
let usedDownload = false;
let download;
let localURL;
let image;
let playError = '';
let transfer = 'поток MP4';
let startupTimer;

function showInlineImage() {
  if (!isiOS || image || document.hidden) return;
  image = new Image();
  image.alt = '';
  image.className = 'background-motion';
  image.onload = () => {
    if (!started) video.after(image);
  };
  image.src = localURL || original;
}

function play() {
  if (document.hidden) return;
  video.play().catch(error => {
    if (error.name === 'AbortError') return;
    playError = error.name;
    if (error.name === 'NotAllowedError') {
      showInlineImage();
    } else {
      recoverDownload();
    }
  });
}

async function recoverDownload() {
  if (started || usedDownload || document.hidden || playError === 'NotAllowedError') return;
  usedDownload = true;
  download = new AbortController();
  transfer = 'запрос полного MP4';
  try {
    const response = await fetch(original, { signal: download.signal, cache: 'no-store' });
    if (response.status !== 200) throw new Error('HTTP ' + response.status);
    transfer = 'получен HTTP 200, загружается MP4';
    const blob = await response.blob();
    if (!blob.size) throw new Error('пустой файл');
    if (started) return;
    transfer = 'загружено ' + blob.size + ' байт';
    localURL = URL.createObjectURL(blob);
    video.src = localURL;
    video.load();
    play();
  } catch (error) {
    if (error.name !== 'AbortError') transfer = 'ошибка загрузки: ' + error.message;
  } finally {
    download = undefined;
  }
}

function onProgress() {
  if (started || video.paused || video.currentTime <= 0) return;
  started = true;
  playError = '';
  clearTimeout(startupTimer);
  if (!localURL && download) download.abort();
  if (image) image.remove();
}

function start() {
  clearTimeout(startupTimer);
  if (document.hidden) {
    video.pause();
    return;
  }
  play();
  if (!started) startupTimer = setTimeout(recoverDownload, 6000);
}

video.muted = true;
video.addEventListener('timeupdate', onProgress);
video.addEventListener('error', () => {
  if (localURL) showInlineImage();
  else recoverDownload();
});
if (!video.canPlayType('video/mp4') && video.canPlayType('video/webm')) {
  video.src = 'assets/fam-night.webm';
}
document.addEventListener('visibilitychange', start);
window.addEventListener('pageshow', start);
// Safari can grant playback from a real touch even after rejecting autoplay.
function retryOnGesture() {
  if (video.paused && !document.hidden) play();
}
document.addEventListener('touchend', retryOnGesture, { passive: true, capture: true });
document.addEventListener('click', retryOnGesture, true);
window.addEventListener('pagehide', event => {
  clearTimeout(startupTimer);
  if (!event.persisted) {
    download?.abort();
    if (localURL) URL.revokeObjectURL(localURL);
  }
});

if (new URLSearchParams(location.search).has('video-check')) {
  const panel = document.createElement('output');
  panel.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:100;background:#111;color:white;padding:12px;font:14px/1.5 monospace;pointer-events:none';
  document.body.append(panel);
  function updateStatus() {
    panel.textContent = [transfer, 'кадр ' + video.videoWidth + '×' + video.videoHeight,
      'время ' + video.currentTime.toFixed(1) + ' с', 'готовность ' + video.readyState,
      playError, video.error && 'MediaError ' + video.error.code,
      image?.isConnected && 'MP4 в режиме изображения'].filter(Boolean).join(' · ');
  }
  updateStatus();
  setInterval(updateStatus, 1000);
}

start();
