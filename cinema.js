(() => {
  'use strict';
  let sequence = 0;
  const close = () => {
    sequence++;
    document.querySelector('.cinema-layer')?.remove();
  };
  const open = (item) => {
    close();
    const current = ++sequence;
    const backdrop = document.querySelector('#detailContent .detail-backdrop');
    if (!backdrop) return;
    const layer = document.createElement('div');
    layer.className = 'cinema-layer';
    layer.style.backgroundImage = 'url(' + JSON.stringify(item.backdrop || item.poster) + ')';
    layer.innerHTML = '<span class="cinema-label"><span class="cinema-dot"></span> TRAILER-VORSCHAU</span>';
    backdrop.append(layer);
    if (!item.trailer || matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData) return;
    setTimeout(() => {
      if (current !== sequence || !document.querySelector('#detailDialog[open]')) return;
      const iframe = document.createElement('iframe');
      iframe.title = item.title + ' – Trailer';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      const id = encodeURIComponent(item.trailer);
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id +
        '?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&playlist=' + id + '&rel=0';
      layer.prepend(iframe);
      requestAnimationFrame(() => layer.classList.add('playing'));
    }, 750);
  };
  window.StreamingPlaceCinema = { open, close };
})();
