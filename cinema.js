/* Streaming Place – native cinematic preview engine.
 * Supply a rights-cleared MP4/WebM URL in item.previewVideo to enable video.
 * YouTube IDs are intentionally NOT used as native video sources.
 */
(() => {
  'use strict';
  let active = null, hoverTimer = null;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stop = () => {
    clearTimeout(hoverTimer);
    if (active) {
      const video = active.querySelector('video');
      if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
      active.remove();
      active = null;
    }
  };
  const start = (item, target, detail = false) => {
    stop();
    if (!target || !item) return;
    const layer = document.createElement('div');
    layer.className = 'sp-cinema';
    layer.classList.toggle('sp-cinema-detail', detail);
    const image = document.createElement('img');
    image.className = 'sp-cinema-image';
    image.alt = '';
    image.src = item.backdrop || item.poster;
    layer.append(image);
    const shade = document.createElement('div');
    shade.className = 'sp-cinema-shade';
    layer.append(shade);
    if (detail) {
      const label = document.createElement('span');
      label.className = 'sp-cinema-tag';
      label.textContent = item.previewVideo ? 'AUTOMATISCHE VORSCHAU' : 'TITELVORSCHAU';
      layer.append(label);
    }
    target.append(layer);
    active = layer;
    if (!item.previewVideo || reduced() || navigator.connection?.saveData) {
      layer.classList.add('sp-cinema-motion');
      return;
    }
    const video = document.createElement('video');
    video.className = 'sp-cinema-video';
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.poster = item.backdrop || item.poster;
    video.setAttribute('aria-label', item.title + ' Videovorschau');
    video.addEventListener('playing', () => layer.classList.add('sp-cinema-playing'));
    video.addEventListener('error', () => { layer.classList.remove('sp-cinema-playing'); layer.classList.add('sp-cinema-motion'); });
    video.src = item.previewVideo;
    layer.insertBefore(video, shade);
    video.play().catch(() => layer.classList.add('sp-cinema-motion'));
  };
  const open = item => start(item, document.querySelector('#detailContent .detail-backdrop'), true);
  const catalog = () => window.CATALOG || [];
  document.addEventListener('pointerover', event => {
    if (event.pointerType === 'touch') return;
    const card = event.target.closest('.poster-card[data-open]');
    if (!card || card.contains(event.relatedTarget)) return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      if (!card.isConnected || !card.matches(':hover') || document.querySelector('dialog[open]')) return;
      const item = catalog().find(x => x.id === card.dataset.open);
      if (item) start(item, card.querySelector('.poster-art'));
    }, 450);
  });
  document.addEventListener('pointerout', event => {
    const card = event.target.closest('.poster-card[data-open]');
    if (card && !card.contains(event.relatedTarget)) stop();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.StreamingPlaceCinema = { open, close: stop };
})();
