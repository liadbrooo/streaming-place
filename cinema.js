(() => {
  'use strict';
  let active = 0, hoverTimer;
  const trailerURL = (id) => {
    const p = new URLSearchParams({autoplay:'1',mute:'1',controls:'0',playsinline:'1',loop:'1',playlist:id,rel:'0',modestbranding:'1'});
    return 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?' + p;
  };
  const preview = (item, target, modal) => {
    const token = ++active;
    const layer = document.createElement('div');
    layer.className = 'cinema-layer';
    const img = document.createElement('img');
    img.className = 'cinema-still';
    img.alt = '';
    img.src = item.backdrop || item.poster;
    layer.append(img);
    if (modal) {
      const label = document.createElement('span');
      label.className = 'cinema-label';
      label.textContent = item.trailer ? 'TRAILER-VORSCHAU' : 'FILM-VORSCHAU';
      layer.append(label);
    }
    target.append(layer);
    if (!item.trailer || matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData) {
      layer.classList.add('cinema-animated');
      return layer;
    }
    const iframe = document.createElement('iframe');
    iframe.title = item.title + ' – Trailer-Vorschau';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.src = trailerURL(item.trailer);
    iframe.addEventListener('load', () => { if (active === token && layer.isConnected) layer.classList.add('playing'); });
    iframe.addEventListener('error', () => { layer.classList.remove('playing'); });
    layer.classList.add('cinema-animated');
    layer.append(iframe);
    // Some browsers never dispatch a usable iframe load event; keep the still visible until it does.
    return layer;
  };
  const close = () => {
    active++;
    clearTimeout(hoverTimer);
    document.querySelectorAll('.cinema-layer').forEach(x => x.remove());
  };
  const open = item => {
    close();
    const target = document.querySelector('#detailContent .detail-backdrop');
    if (target) preview(item,target,true);
  };
  const catalog = () => new Map((window.CATALOG || []).map(x => [x.id,x]));
  document.addEventListener('pointerover', e => {
    if (e.pointerType === 'touch') return;
    const card = e.target.closest('.poster-card[data-open]');
    if (!card || card.contains(e.relatedTarget)) return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      if (!card.isConnected || !card.matches(':hover') || document.querySelector('dialog[open]')) return;
      close();
      const item = catalog().get(card.dataset.open);
      const target = card.querySelector('.poster-art');
      if (item && target) preview(item,target,false);
    }, 650);
  });
  document.addEventListener('pointerout', e => {
    const card = e.target.closest('.poster-card[data-open]');
    if (card && !card.contains(e.relatedTarget)) close();
  });
  window.StreamingPlaceCinema = {open,close};
})();
