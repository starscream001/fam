const backdrop = document.querySelector('.backdrop');
const video = document.querySelector('.background-video');
let frameRequest;

function hideVideo() {
  backdrop.classList.remove('has-video');
  if (frameRequest !== undefined) {
    video.cancelVideoFrameCallback(frameRequest);
    frameRequest = undefined;
  }
}

function showVideo() {
  if (!video.paused && !document.hidden) {
    backdrop.classList.add('has-video');
  }
}

function waitForVideoFrame() {
  if (frameRequest !== undefined || backdrop.classList.contains('has-video')) return;
  if ('requestVideoFrameCallback' in video) {
    frameRequest = video.requestVideoFrameCallback(() => {
      frameRequest = undefined;
      showVideo();
    });
  } else if (video.currentTime > 0 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    showVideo();
  }
}

function syncPlayback() {
  const shouldPlay = !document.hidden;
  video.autoplay = shouldPlay;
  if (!shouldPlay) {
    video.pause();
    return;
  }

  video.play().then(waitForVideoFrame).catch(error => {
    if (error.name !== 'AbortError') hideVideo();
  });
}

video.muted = true;
video.addEventListener('playing', waitForVideoFrame);
video.addEventListener('timeupdate', waitForVideoFrame);
video.addEventListener('error', hideVideo);
video.addEventListener('pause', () => {
  if (!document.hidden) hideVideo();
});
document.addEventListener('visibilitychange', syncPlayback);
window.addEventListener('pageshow', syncPlayback);
syncPlayback();
