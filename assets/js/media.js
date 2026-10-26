// Podgląd karty jak w portfolio osobistym: 1 s zdjęcia maszyny, potem 15 s filmu producenta, w pętli.
// Film ładuje się dopiero przy zbliżeniu karty do widoku. Ukryta karta i karta przeglądarki w tle wstrzymują film.
const PHOTO_MS = 1000;
const VIDEO_MS = 15000;
const GALLERY_MS = 4000;

let youtube;
export function loadYouTube() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  return youtube ||= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const fail = () => { youtube = undefined; script.remove(); reject(new Error('YouTube niedostępny')); };
    const timeout = setTimeout(fail, 15000);
    window.onYouTubeIframeAPIReady = () => { clearTimeout(timeout); resolve(window.YT); };
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => { clearTimeout(timeout); fail(); };
    document.head.append(script);
  });
}

function videoPreview(media, toggle, reduced) {
  const { id, start } = JSON.parse(media.dataset.video);
  let player, loading = false, near = false, visible = false, paused = reduced, playing = false;
  let photoTimer, videoTimer, retryTimer, remaining = VIDEO_MS, startedAt = 0;
  const active = () => visible && !paused && !document.hidden;

  const stopClock = () => {
    if (startedAt) { remaining = Math.max(0, remaining - (performance.now() - startedAt)); startedAt = 0; }
    clearTimeout(videoTimer);
  };
  const runClock = () => {
    if (active() && playing && media.dataset.preview === 'video' && !startedAt) {
      startedAt = performance.now();
      videoTimer = setTimeout(cycle, remaining);
    }
  };

  function cycle() {
    stopClock();
    clearTimeout(photoTimer);
    remaining = VIDEO_MS;
    media.dataset.preview = 'photo';
    if (!active()) { player?.pauseVideo?.(); return; }
    if (player) { player.seekTo(start, true); player.playVideo(); } else prepare();
    photoTimer = setTimeout(() => {
      if (!active()) return;
      media.dataset.preview = 'video';
      runClock();
    }, PHOTO_MS);
  }

  function failed() {
    stopClock();
    player?.destroy?.();
    player = undefined;
    loading = playing = false;
    media.dataset.preview = 'photo';
    clearTimeout(retryTimer);
    retryTimer = setTimeout(() => { if (near && !paused) prepare(); }, 5000);
  }

  async function prepare() {
    if (player || loading || !near || paused || document.hidden) return;
    loading = true;
    try {
      const YT = await loadYouTube();
      const mount = document.createElement('div');
      media.append(mount);
      player = new YT.Player(mount, {
        host: 'https://www.youtube-nocookie.com',
        videoId: id,
        playerVars: { autoplay: 1, mute: 1, controls: 0, playsinline: 1, rel: 0, disablekb: 1, start, origin: location.origin },
        events: {
          onReady: e => {
            const frame = e.target.getIframe();
            frame.tabIndex = -1;
            frame.title = 'Film poglądowy producenta: maszyna w działaniu';
            frame.setAttribute('aria-hidden', 'true');
            e.target.mute();
            if (active()) e.target.playVideo(); else e.target.pauseVideo();
          },
          onStateChange: e => {
            if (e.data === 1) { playing = true; if (!active()) { player.pauseVideo(); return; } runClock(); }
            else if (e.data === 0) { playing = false; cycle(); }
            else if (e.data === 2 || e.data === 3) { playing = false; stopClock(); }
          },
          onError: failed
        }
      });
    } catch { failed(); }
    loading = false;
  }

  const label = () => { toggle.textContent = paused ? 'Odtwórz podgląd' : 'Wstrzymaj podgląd'; toggle.setAttribute('aria-pressed', String(!paused)); };
  label();
  toggle.addEventListener('click', () => { paused = !paused; label(); cycle(); });

  const near$ = new IntersectionObserver(([e]) => { near = e.isIntersecting; if (near) prepare(); }, { rootMargin: '600px' });
  const seen$ = new IntersectionObserver(([e]) => { visible = e.isIntersecting; cycle(); }, { threshold: 0.35 });
  near$.observe(media);
  seen$.observe(media);
  const onVisibility = () => { cycle(); if (!document.hidden) prepare(); };
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    stopClock(); clearTimeout(photoTimer); clearTimeout(retryTimer);
    near$.disconnect(); seen$.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    player?.destroy?.();
  };
}

function galleryPreview(media, toggle, reduced) {
  const slides = [...media.querySelectorAll('img')];
  let i = 0, timer, visible = false, paused = reduced;
  const show = n => slides.forEach((s, k) => s.classList.toggle('is-active', k === n));
  const tick = () => { i = (i + 1) % slides.length; show(i); };
  const update = () => {
    clearInterval(timer);
    if (visible && !paused && !document.hidden) timer = setInterval(tick, GALLERY_MS);
  };
  const label = () => { toggle.textContent = paused ? 'Odtwórz podgląd' : 'Wstrzymaj podgląd'; toggle.setAttribute('aria-pressed', String(!paused)); };
  show(0);
  label();
  toggle.addEventListener('click', () => { paused = !paused; label(); update(); });
  const seen$ = new IntersectionObserver(([e]) => { visible = e.isIntersecting; update(); }, { threshold: 0.35 });
  seen$.observe(media);
  document.addEventListener('visibilitychange', update);
  return () => { clearInterval(timer); seen$.disconnect(); document.removeEventListener('visibilitychange', update); };
}

/** Uruchamia podglądy w kartach. Zwraca funkcję sprzątającą (wywoływaną przy zmianie filtra). */
export function initPreviews(root) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const disposers = [];
  for (const media of root.querySelectorAll('[data-video], [data-gallery]')) {
    const toggle = media.closest('.card').querySelector('.preview-toggle');
    disposers.push(media.dataset.video ? videoPreview(media, toggle, reduced) : galleryPreview(media, toggle, reduced));
  }
  return () => disposers.forEach(d => d());
}
