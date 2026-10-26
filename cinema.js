/* Streaming Place v1.4 – cinematic trailers via official YouTube embeds.
 * No copyrighted videos are downloaded, proxied or rehosted.
 * Third-party embed and autoplay restrictions are controlled by YouTube/browser.
 */
(() => {
  'use strict';
  let active = null;
  let hoverTimer = null;
  let leaveTimer = null;

  const find = id => (window.CATALOG || []).find(item => item.id === id);
  const stop = () => {
    clearTimeout(hoverTimer);
    clearTimeout(leaveTimer);
    if (!active) return;
    const { layer, video } = active;
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    // Removing the iframe stops external video playback immediately.
    layer.remove();
    active = null;
  };

  function youtube(item, shouldAutoplay = true) {
    const iframe = document.createElement('iframe');
    const id = encodeURIComponent(item.trailer);
    const params = new URLSearchParams({
      autoplay: shouldAutoplay ? '1' : '0',
      mute: '1',
      playsinline: '1',
      controls: '1',
      rel: '0',
      loop: '1',
      playlist: item.trailer,
      enablejsapi: '1'
    });
    iframe.className = 'sp-youtube-frame';
    iframe.title = item.title + ' – offizieller Trailer (YouTube)';
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?' + params.toString();
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('loading', 'eager');
    return iframe;
  }

  function preview(item, target, mode) {
    stop();
    if (!item || !target) return;
    const layer = document.createElement('div');
    layer.className = 'sp-cinema-v14 sp-cinema-' + mode;
    layer.dataset.titleId = item.id;
    const still = document.createElement('img');
    still.alt = '';
    still.className = 'sp-v14-still';
    still.src = item.backdrop || item.poster;
    layer.append(still);
    target.append(layer);
    active = { layer, video: null, mode, item };

    if (item.previewVideo) {
      const video = document.createElement('video');
      video.className = 'sp-v14-video';
      video.src = item.previewVideo;
      video.muted = true;
      video.defaultMuted = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.controls = true;
      video.preload = 'metadata';
      video.addEventListener('playing', () => layer.classList.add('sp-ready'));
      video.addEventListener('error', () => layer.classList.add('sp-v14-motion'));
      layer.append(video);
      active.video = video;
      video.play().catch(() => layer.classList.add('sp-v14-motion'));
      return;
    }

    if (item.trailer && mode !== 'card') {
      layer.append(youtube(item));
      return;
    }

    // On small poster cards a YouTube embed would violate its 200px player minimum.
    // The card still opens a proper, full-sized trailer player on click.
    layer.classList.add('sp-v14-motion');
  }

  const hero = item => preview(item, document.querySelector('#heroVideoStage'), 'hero');
  const open = item => preview(item, document.querySelector('#detailContent .detail-backdrop'), 'detail');
  function playCurrent() {
    if (!active) return;
    if (active.video) {
      active.video.play().catch(() => {});
    } else if (active.item.trailer) {
      const el = active.mode === 'hero'
        ? document.querySelector('#heroTrailer')
        : document.querySelector('#detailContent [data-trailer]');
      if (el) el.click();
      else window.open('https://www.youtube.com/watch?v=' + active.item.trailer, '_blank', 'noopener');
    }
  }
  function player(item, target) {
    stop();
    target.replaceChildren();
    if (item.trailer) {
      target.append(youtube(item, true));
      return;
    }
    if (item.previewVideo) {
      const video = document.createElement('video');
      video.className = 'sp-player-video';
      video.controls = true;
      video.playsInline = true;
      video.src = item.previewVideo;
      target.append(video);
      video.play().catch(() => {});
    }
  }

  function restoreHero() {
    if (document.querySelector('dialog[open]')) return;
    const index = Math.max(0, Number(document.querySelector('#heroCurrent')?.textContent || 1) - 1);
    const item = find((window.HERO_IDS || [])[index]);
    if (item) hero(item);
  }

  function closeHoverWhenOutside() {
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => {
      if (active?.mode !== 'card') return;
      const popup = active.layer;
      if (popup.matches(':hover') || active.anchor?.matches(':hover')) return;
      stop();
      restoreHero();
    }, 250);
  }

  function showHover(item, card) {
    if (!item?.trailer || !card || document.querySelector('dialog[open]')) return;
    stop();
    const host = document.createElement('div');
    host.className = 'sp-trailer-flyout';
    const media = document.createElement('div');
    media.className = 'sp-flyout-media';
    media.append(youtube(item));
    const footer = document.createElement('div');
    footer.className = 'sp-flyout-footer';
    const labels = document.createElement('div');
    labels.className = 'sp-flyout-text';
    const title = document.createElement('strong');
    title.textContent = item.title;
    const provider = document.createElement('span');
    provider.textContent = item.provider + ' · offizieller Trailer';
    labels.append(title, provider);
    const info = document.createElement('button');
    info.type = 'button';
    info.className = 'sp-flyout-info';
    info.dataset.open = item.id;
    info.textContent = 'Infos';
    const watch = document.createElement('button');
    watch.type = 'button';
    watch.className = 'sp-flyout-watch';
    watch.dataset.trailer = item.id;
    watch.textContent = 'Trailer';
    footer.append(labels, info, watch);
    host.append(media, footer);
    document.body.append(host);
    const rect = card.getBoundingClientRect();
    const width = Math.min(374, window.innerWidth - 24);
    const height = width * (9 / 16) + 70;
    const left = Math.max(12, Math.min(window.innerWidth - width - 12, rect.left + rect.width / 2 - width / 2));
    const top = Math.max(80, Math.min(window.innerHeight - height - 12, rect.top - 36));
    host.style.cssText = 'width:' + width + 'px;left:' + left + 'px;top:' + top + 'px;';
    active = { layer: host, video: null, mode: 'card', item, anchor: card };
    host.addEventListener('pointerenter', () => clearTimeout(leaveTimer));
    host.addEventListener('pointerleave', closeHoverWhenOutside);
  }

  document.addEventListener('pointerover', event => {
    if (event.pointerType === 'touch' || window.innerWidth < 820 || window.innerHeight < 360) return;
    const card = event.target.closest('.poster-card[data-open]');
    if (!card || card.contains(event.relatedTarget)) return;
    clearTimeout(hoverTimer);
    clearTimeout(leaveTimer);
    hoverTimer = setTimeout(() => {
      if (!card.isConnected || !card.matches(':hover') || document.querySelector('dialog[open]')) return;
      const item = find(card.dataset.open);
      if (item) showHover(item, card);
    }, 550);
  });

  document.addEventListener('pointerout', event => {
    const card = event.target.closest('.poster-card[data-open]');
    if (!card || card.contains(event.relatedTarget)) return;
    clearTimeout(hoverTimer);
    if (active?.mode === 'card') closeHoverWhenOutside();
  });

  window.addEventListener('scroll', () => {
    if (active?.mode === 'card') {
      stop();
      restoreHero();
    }
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });

  window.StreamingPlaceCinema = {
    hero, open, close: stop, playCurrent, player,
    isPlaying: () => false
  };
})();
