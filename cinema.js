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
      setTimeout(finish, 4500);
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
      enablejsapi: '1', origin: location.origin
    });
    return 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(item.trailer) + '?' + params;
  }

  function fallbackEmbed(ctx) {
    if (active !== ctx) return;
    ctx.slot.replaceChildren();
    const iframe = document.createElement('iframe');
    iframe.className = 'sp-auto-iframe';
    iframe.title = ctx.item.title + ' – Trailer-Vorschau';
    iframe.src = sourceUrl(ctx.item);
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.setAttribute('allowfullscreen', '');
    iframe.addEventListener('load', () => {
      if (active !== ctx) return;
      ctx.layer.classList.add('sp-auto-playing');
      // Repeat the muted play command for players that initialize after iframe load.
      const command = action => {
        try { iframe.contentWindow?.postMessage(JSON.stringify({event:'command',func:action,args:[]}), '*'); } catch (_) {}
      };
      command('mute');
      command('playVideo');
    });
    ctx.slot.append(iframe);
  }

  function startYoutube(ctx) {
    if (active !== ctx || ctx.started || document.hidden) return;
    ctx.started = true;
    const item = ctx.item;
    ensureYouTube().then(api => {
      if (active !== ctx || !ctx.started) return;
      if (!api) { fallbackEmbed(ctx); return; }
      const mount = document.createElement('div');
      mount.className = 'sp-auto-mount';
      ctx.slot.replaceChildren(mount);
      try {
        ctx.player = new api.Player(mount, {
          host: 'https://www.youtube-nocookie.com',
          videoId: item.trailer,
          width: '100%', height: '100%',
          playerVars: {
            autoplay: 1, mute: 1, controls: 0, playsinline: 1,
            loop: 1, playlist: item.trailer, rel: 0,
            fs: 0, origin: location.origin
          },
          events: {
            onReady: event => {
              if (active !== ctx) return;
              const frame = event.target.getIframe?.();
              if (frame) {
                frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
                frame.referrerPolicy = 'strict-origin-when-cross-origin';
                frame.title = item.title + ' – Trailer-Vorschau';
              }
              try { event.target.mute(); event.target.playVideo(); } catch (_) {}
            },
            onStateChange: event => {
              if (active !== ctx) return;
              if (event.data === 1) ctx.layer.classList.add('sp-auto-playing');
            },
            onAutoplayBlocked: () => {
              if (active === ctx) ctx.layer.dataset.autoplay = 'blocked';
            },
            onError: () => {
              if (active !== ctx) return;
              // Preserve a poster instead of a broken embedded player.
              ctx.layer.dataset.autoplay = 'unavailable';
              removeMedia(ctx);
            }
          }
        });
      } catch (_) {
        fallbackEmbed(ctx);
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
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData) return;
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
    const ctx = {layer,slot,item,mode,started:false,observer:null,player:null,video:null};
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
    const ctx={layer:host,slot,item,mode:'card',anchor:card,started:false,observer:null,player:null,video:null};
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
    if (!document.hidden) return;
    if (active) removeMedia(active);
  });

  window.StreamingPlaceCinema = {
    hero,open,close:stop,playCurrent,
    isPlaying:()=>Boolean(active?.started && active?.layer.classList.contains('sp-auto-playing'))
  };
})();
