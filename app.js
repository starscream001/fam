const backdrop = document.querySelector('.backdrop');
const video = document.querySelector('.background-video');

function hideVideo() {
  backdrop.classList.remove('has-video');
}

function showVideo() {
  if (!video.paused && !document.hidden && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    backdrop.classList.add('has-video');
  }
}

function syncPlayback() {
  video.autoplay = !document.hidden;
  if (document.hidden) {
    video.pause();
    return;
  }

  video.play().then(showVideo).catch(error => {
    if (error.name !== 'AbortError') hideVideo();
  });
}

video.muted = true;
video.addEventListener('playing', showVideo);
video.addEventListener('timeupdate', showVideo);
video.addEventListener('error', hideVideo);
video.addEventListener('pause', () => {
  if (!document.hidden) hideVideo();
});
document.addEventListener('visibilitychange', syncPlayback);
window.addEventListener('pageshow', syncPlayback);
syncPlayback();
