/* Streaming Place 1.5 – cinematic, muted automatic previews.
   Trailer playback uses the official YouTube IFrame Player API; no video rehosting.
   If YouTube or the browser blocks autoplay, the ordinary trailer action remains available.
*/
(() => {
  'use strict';

  const find = id => (window.CATALOG || []).find(item => item.id === id);
  let active = null;
  let hoverTimer = null;
  let leaveTimer = null;
  let apiPromise = null;
  let frameNumber = 0;
  const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function ensureYouTube() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise(resolve => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        resolve(window.YT?.Player ? window.YT : null);
      };
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previous === 'function') previous();
        finish();
      };
      const script = document.createElement('script');
      script.id = 'sp-youtube-api';
      script.async = true;
      script.src = 'https://www.youtube.com/iframe_api';
      script.addEventListener('error', finish, {once:true});
      document.head.append(script);
      setTimeout(finish, 10000);
    });
    return apiPromise;
  }

  function removeMedia(ctx) {
    if (ctx.player) {
      try { ctx.player.destroy(); } catch (_) {}
      ctx.player = null;
    }
    if (ctx.video) {
      try { ctx.video.pause(); ctx.video.removeAttribute('src'); ctx.video.load(); } catch (_) {}
      ctx.video = null;
    }
    clearTimeout(ctx.blockedTimer);
    clearTimeout(ctx.checkTimer);
    clearTimeout(ctx.deadline);
    ctx.deadline = null;
    ctx.iframe = null;
    ctx.slot?.replaceChildren();
    ctx.started = false;
    ctx.layer.classList.remove('sp-auto-playing');
  }

  function stop() {
    clearTimeout(hoverTimer);
    clearTimeout(leaveTimer);
    if (!active) return;
    const ctx = active;
    active = null;
    ctx.observer?.disconnect();
    removeMedia(ctx);
    ctx.layer.remove();
  }

  function sourceUrl(item, controls = false) {
    const params = new URLSearchParams({
      autoplay: '1', mute: '1', playsinline: '1',
      controls: controls ? '1' : '0', rel: '0',
      loop: '1', playlist: item.trailer,
      enablejsapi: '1', origin: location.origin, fs: '0'
    });
    return 'https://www.youtube.com/embed/' + encodeURIComponent(item.trailer) + '?' + params;
  }

  function showUnavailable(ctx, reason) {
    if (active !== ctx || ctx.layer.classList.contains('sp-auto-playing')) return;
    ctx.observer?.disconnect();
    removeMedia(ctx);
    ctx.started = true; // Prevent IntersectionObserver from retrying infinitely.
    const panel = document.createElement('div');
    panel.className = 'sp-auto-recovery';
    const heading = document.createElement('strong');
    heading.textContent = reason === 'restricted'
      ? 'Automatisches Abspielen eingeschränkt'
      : 'Trailer kann hier nicht automatisch starten';
    const message = document.createElement('p');
    message.textContent = reason === 'restricted'
      ? 'Dein Browser oder die Video-Einstellungen verhindern die Vorschau.'
      : 'Dieser YouTube-Trailer lässt sich auf deinem Gerät nicht automatisch einbetten.';
    const link = document.createElement('a');
    link.className = 'sp-auto-recovery-link';
    link.href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(ctx.item.trailer);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Offiziellen Trailer öffnen';
    panel.append(heading, message, link);
    ctx.slot.append(panel);
    ctx.layer.dataset.autoplay = reason;
  }

  function startYoutube(ctx) {
    if (active !== ctx || ctx.started || document.hidden) return;
    ctx.started = true;
    // Independent timeout: even when the YouTube API script never loads,
    // a failed embed must not remain onscreen forever.
    ctx.deadline = setTimeout(() => {
      if (active === ctx && !ctx.layer.classList.contains('sp-auto-playing')) showUnavailable(ctx, 'restricted');
    }, 10500);
    const iframe = document.createElement('iframe');
    iframe.className = 'sp-auto-iframe';
    iframe.id = 'sp-preview-player-' + (++frameNumber);
    iframe.title = ctx.item.title + ' – Trailer-Vorschau';
    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
    iframe.setAttribute('allowfullscreen', '');
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.src = sourceUrl(ctx.item);
    ctx.iframe = iframe;
    // The iframe requests muted autoplay immediately, without waiting for the API.
    ctx.slot.append(iframe);

    ensureYouTube().then(api => {
      if (active !== ctx || ctx.iframe !== iframe || !api) return;
      try {
        ctx.player = new api.Player(iframe, {
          events: {
            onReady: event => {
              if (active !== ctx) return;
              const frame = event.target.getIframe?.();
              if (frame) {
                frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
                frame.referrerPolicy = 'strict-origin-when-cross-origin';
                frame.title = ctx.item.title + ' – Trailer-Vorschau';
              }
              try { event.target.mute(); event.target.playVideo(); } catch (_) {}
              ctx.checkTimer = setTimeout(() => {
                if (active !== ctx || ctx.layer.classList.contains('sp-auto-playing')) return;
                try {
                  if (ctx.player?.getPlayerState?.() === 1) {
                    ctx.layer.classList.add('sp-auto-playing');
                    return;
                  }
                } catch (_) {}
                showUnavailable(ctx, 'restricted');
              }, 11500);
            },
            onStateChange: event => {
              if (active !== ctx) return;
              if (event.data === 1) {
                clearTimeout(ctx.blockedTimer);
                clearTimeout(ctx.checkTimer);
                clearTimeout(ctx.deadline);
                ctx.layer.classList.add('sp-auto-playing');
              }
            },
            onAutoplayBlocked: () => {
              if (active !== ctx) return;
              // An automatic play retry is permitted only once: repeated blocked
              // events would otherwise continuously postpone the fallback.
              if (!ctx.retryAttempted) {
                ctx.retryAttempted = true;
                try { ctx.player?.mute(); ctx.player?.playVideo(); } catch (_) {}
              }
              if (!ctx.blockedTimer) {
                ctx.blockedTimer = setTimeout(() => {
                  ctx.blockedTimer = null;
                  if (active === ctx && !ctx.layer.classList.contains('sp-auto-playing')) {
                    showUnavailable(ctx, 'restricted');
                  }
                }, 2600);
              }
            },
            onError: event => {
              if (active !== ctx) return;
              // Codes 101/150: embedding disabled; 153: player identity/referrer rejected.
              showUnavailable(ctx, 'embed');
            }
          }
        });
      } catch (_) {
        // The direct iframe is already present and may autoplay without the API.
      }
    });
  }

  function startNative(ctx) {
    if (active !== ctx || ctx.started || document.hidden) return;
    ctx.started = true;
    const video = document.createElement('video');
    video.className = 'sp-auto-native';
    video.src = ctx.item.previewVideo;
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted','');
    video.setAttribute('playsinline','');
    video.preload = 'metadata';
    video.addEventListener('playing', () => { if(active === ctx) ctx.layer.classList.add('sp-auto-playing'); });
    video.addEventListener('error', () => { if(active === ctx) removeMedia(ctx); });
    ctx.slot.append(video);
    ctx.video = video;
    video.play().catch(() => {});
  }

  function start(ctx) {
    if (!ctx.item?.trailer && !ctx.item?.previewVideo) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData) {
      if (ctx.item.trailer) showUnavailable(ctx, 'restricted');
      return;
    }
    if (isIOS && ctx.item.trailer && !ctx.item.previewVideo) {
      // 2026: YouTube iframe embeds on WebKit may return Error 153.
      // There is no legitimate forced-autoplay workaround for a blocked embed.
      // Prefer a clearly working official trailer URL over a permanently broken player.
      showUnavailable(ctx, 'restricted');
      return;
    }
    if (ctx.item.trailer) startYoutube(ctx);
    else startNative(ctx);
  }

  function observe(ctx) {
    if (!('IntersectionObserver' in window)) { start(ctx); return; }
    ctx.observer = new IntersectionObserver(entries => {
      if (active !== ctx) return;
      const showing = entries.some(x => x.isIntersecting && x.intersectionRatio >= .5);
      if (showing && !document.hidden) {
        if (!ctx.started) start(ctx);
        else if (ctx.player) {
          try { ctx.player.mute(); ctx.player.playVideo(); } catch (_) {}
        } else if (ctx.video) ctx.video.play().catch(() => {});
      } else if (ctx.started) {
        // There must never be a second audible/offscreen preview playing.
        removeMedia(ctx);
      }
    }, {threshold:[0,.5,.75]});
    ctx.observer.observe(ctx.layer);
  }

  function createPreview(item, target, mode) {
    stop();
    if (!item || !target) return;
    const layer = document.createElement('div');
    layer.className = 'sp-auto-preview sp-auto-' + mode;
    const still = document.createElement('img');
    still.className = 'sp-auto-still';
    still.alt = '';
    still.src = item.backdrop || item.poster;
    still.loading = 'eager';
    const slot = document.createElement('div');
    slot.className = 'sp-auto-slot';
    layer.append(still,slot);
    target.append(layer);
    const ctx = {layer,slot,item,mode,started:false,observer:null,player:null,video:null,deadline:null};
    active = ctx;
    observe(ctx);
  }

  function hero(item) {
    createPreview(item, document.querySelector('#heroVideoStage'), 'hero');
  }

  function open(item) {
    createPreview(item, document.querySelector('#detailContent .detail-backdrop'), 'detail');
  }

  function playCurrent() {
    if (!active) return;
    if (active.video) {
      active.video.play().catch(() => {});
      return;
    }
    const id = active.item.id;
    const target = active.mode === 'hero' ? document.querySelector('#heroTrailer')
      : document.querySelector('#detailContent [data-trailer]');
    if (target) target.click();
    else window.open('https://www.youtube.com/watch?v=' + active.item.trailer, '_blank', 'noopener');
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
      if (active.layer.matches(':hover') || active.anchor?.matches(':hover')) return;
      stop();
      restoreHero();
    }, 200);
  }

  function showHover(item, card) {
    if (!item?.trailer || !card || document.querySelector('dialog[open]')) return;
    stop();
    const host = document.createElement('div');
    host.className = 'sp-trailer-flyout sp-auto-hover';
    const media = document.createElement('div');
    media.className = 'sp-flyout-media';
    const still = document.createElement('img');
    still.className = 'sp-auto-still';
    still.alt = '';
    still.src = item.backdrop || item.poster;
    const slot = document.createElement('div');
    slot.className = 'sp-auto-slot';
    media.append(still,slot);
    const footer = document.createElement('div');
    footer.className = 'sp-flyout-footer';
    const labels = document.createElement('div');
    labels.className = 'sp-flyout-text';
    const title = document.createElement('strong');
    title.textContent = item.title;
    const provider = document.createElement('span');
    provider.textContent = item.provider + ' · stumme Vorschau';
    labels.append(title,provider);
    const info = document.createElement('button');
    info.type='button'; info.className='sp-flyout-info';
    info.dataset.open=item.id; info.textContent='Infos';
    const watch=document.createElement('button');
    watch.type='button'; watch.className='sp-flyout-watch';
    watch.dataset.trailer=item.id; watch.textContent='Mit Ton';
    footer.append(labels,info,watch);
    host.append(media,footer);
    document.body.append(host);
    const rect=card.getBoundingClientRect();
    const width=Math.min(385,window.innerWidth-24);
    const height=width*9/16+70;
    host.style.width=width+'px';
    host.style.left=Math.max(12,Math.min(window.innerWidth-width-12,rect.left+rect.width/2-width/2))+'px';
    host.style.top=Math.max(70,Math.min(window.innerHeight-height-12,rect.top-25))+'px';
    const ctx={layer:host,slot,item,mode:'card',anchor:card,started:false,observer:null,player:null,video:null,deadline:null};
    active=ctx;
    host.addEventListener('pointerenter',()=>clearTimeout(leaveTimer));
    host.addEventListener('pointerleave',closeHoverWhenOutside);
    observe(ctx);
  }

  document.addEventListener('pointerover',event => {
    if (event.pointerType==='touch' || window.innerWidth<820 || window.innerHeight<360) return;
    const card=event.target.closest('.poster-card[data-open]');
    if (!card || card.contains(event.relatedTarget)) return;
    clearTimeout(hoverTimer);
    clearTimeout(leaveTimer);
    hoverTimer=setTimeout(()=>{
      if (!card.isConnected || !card.matches(':hover') || document.querySelector('dialog[open]')) return;
      const item=find(card.dataset.open);
      if(item)showHover(item,card);
    },550);
  });

  document.addEventListener('pointerout',event=>{
    const card=event.target.closest('.poster-card[data-open]');
    if (!card || card.contains(event.relatedTarget)) return;
    clearTimeout(hoverTimer);
    if(active?.mode==='card')closeHoverWhenOutside();
  });

  window.addEventListener('scroll',()=>{
    if(active?.mode==='card') {stop();restoreHero();}
  },{passive:true});

  document.addEventListener('visibilitychange',()=>{
    if (document.hidden) {
      if (active) removeMedia(active);
      return;
    }
    if (!active || active.started) return;
    const rect = active.layer.getBoundingClientRect();
    const visibleHeight = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
    if (rect.height && visibleHeight / rect.height >= .5) start(active);
  });

  window.StreamingPlaceCinema = {
    hero,open,close:stop,playCurrent,
    isPlaying:()=>Boolean(active?.started && active?.layer.classList.contains('sp-auto-playing'))
  };
})();
