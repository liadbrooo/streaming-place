(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const CATALOG = window.CATALOG;
  const providers = window.PROVIDERS;
  const byId = new Map(CATALOG.map(item => [item.id, item]));
  const storageKey = 'streaming-place-watchlist-v1';
  const state = { view: 'home', provider: 'all', genre: 'Alle', heroIndex: 0, favorites: loadFavorites(), heroTimer: null, toastTimer: null };
  const HERO = window.HERO_IDS.map(id => byId.get(id));

  function loadFavorites() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return new Set(Array.isArray(value) ? value.filter(x => typeof x === 'string') : []);
    } catch { return new Set(); }
  }
  function saveFavorites() {
    try { localStorage.setItem(storageKey, JSON.stringify([...state.favorites])); } catch { /* Private browsing can disallow storage. */ }
  }
  function esc(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
  function toast(text) {
    const el = $('#toast'); el.textContent = text; el.classList.add('visible');
    clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => el.classList.remove('visible'), 2600);
  }

  // Each card is usable with mouse, touch and keyboard.
  function card(item, rank = null) {
    const saved = state.favorites.has(item.id);
    const pClass = item.provider === 'Netflix' ? 'netflix' : item.provider === 'Disney+' ? 'disney' : item.provider === 'Prime Video' ? 'prime' : item.provider === 'Paramount+' ? 'paramount' : item.provider === 'Apple TV+' ? 'apple' : '';
    return `<article class="poster-card ${rank ? 'rank-card' : ''}" data-open="${esc(item.id)}" tabindex="0" role="button" aria-label="Infos zu ${esc(item.title)} anzeigen">
      ${rank ? `<div class="rank-number" aria-hidden="true">${rank}</div>` : ''}
      <div class="poster-art"><img src="${esc(item.poster)}" alt="Cover: ${esc(item.title)}" loading="lazy" decoding="async" />
        ${item.provider !== 'Anbieter finden' ? `<span class="poster-provider ${pClass}">${esc(item.provider)}</span>` : ''}
        <div class="poster-bottom-shade"></div>
        <div class="poster-hover"><span class="card-play">${icon('play')}</span><span>Details ansehen</span></div>
        ${item.trailer ? `<button type="button" class="sp-card-trailer" data-trailer="${esc(item.id)}" aria-label="Trailer von ${esc(item.title)} abspielen">${icon('play')} Trailer</button>` : ''}
        <button class="card-save ${saved ? 'saved' : ''}" data-save="${esc(item.id)}" title="${saved ? 'Aus Liste entfernen' : 'Zur Liste hinzufügen'}" aria-label="${saved ? 'Aus Liste entfernen' : 'Zur Liste hinzufügen'}">${icon(saved ? 'check' : 'plus')}</button>
      </div>
      <h4 title="${esc(item.title)}">${esc(item.title)}</h4>
      <div class="card-meta">${item.year}<b>•</b>${esc(item.genres[0])}<b>•</b>${esc(item.type)}</div>
    </article>`;
  }

  function filtered(items) {
    return items.filter(item => {
      if (state.provider !== 'all' && item.provider !== state.provider) return false;
      if (state.genre !== 'Alle' && !item.genres.some(g => g.toLowerCase() === state.genre.toLowerCase())) return false;
      return true;
    });
  }
  function row(title, subtitle, ids, rank = false) {
    const items = filtered(ids.map(id => byId.get(id)).filter(Boolean));
    if (!items.length) return '';
    const rowId = `row-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    return `<section class="content-rail"><div class="rail-top"><div><h3>${esc(title)}</h3><p>${esc(subtitle)}</p></div>
      <div class="rail-controls"><button class="rail-arrow" data-scroll="${rowId}" data-direction="-1" aria-label="Nach links scrollen">${icon('left')}</button><button class="rail-arrow" data-scroll="${rowId}" data-direction="1" aria-label="Nach rechts scrollen">${icon('right')}</button></div></div>
      <div class="rail-track" id="${rowId}">${items.map((item, index) => card(item, rank ? index + 1 : null)).join('')}</div></section>`;
  }
  function editorialBanner() {
    const item = byId.get('dune-2');
    return `<section class="feature-banner"><div class="feature-banner-image" style="background-image:url('${item.backdrop}')"></div><span class="feature-banner-corner">THE CINEMA EDIT</span><div class="feature-banner-copy"><span class="section-kicker"><span class="small-red-square"></span> BIG SCREEN ENERGY</span><h3>Manche Welten muss<br>man <em style="font-style:normal;color:#f73c61">erleben.</em></h3><p>Von fernen Galaxien bis zu Geschichten, die dich nicht mehr loslassen. Bereit für deinen nächsten Filmabend?</p><button class="button button-primary" data-open="dune-2">Dune entdecken ${icon('arrow')}</button></div></section>`;
  }
  const setHead = (kicker, titleHtml, description, showAllButton = false) => {
    $('#viewHeading').innerHTML = `<div><div class="section-kicker"><span class="small-red-square"></span> ${kicker}</div><h2>${titleHtml}</h2><p>${description}</p></div>${showAllButton ? `<button class="text-link" data-view="all">Alle Titel entdecken ${icon('arrow')}</button>` : ''}`;
  };
  const ids = {
    picks: ['wednesday','fallout','last-of-us','dune-2','severance','mandalorian','the-boys','oppenheimer','reacher','silo'],
    trending: ['stranger-things','the-boys','house-dragon','squid-game','fallout','the-bear','severance','wednesday','last-of-us','reacher'],
    movies: ['dune-2','oppenheimer','interstellar','batman','spiderverse','top-gun','barbie','avatar','dark-knight','poor-things'],
    worlds: ['mandalorian','andor','loki','house-dragon','wheel-time','halo','silo','interstellar','avatar','dune-2'],
    suspense: ['severance','penguin','last-of-us','squid-game','white-lotus','yellowstone','peaky','the-boys','euphoria'],
    comfort: ['only-murders','the-bear','tulsa-king','barbie','top-gun','reacher','loki','mandalorian'],
    originals: ['tulsa-king','halo','yellowstone','the-bear','only-murders','euphoria','white-lotus','silo','peaky','wheel-time']
  };

  function renderHome() {
    if (state.provider !== 'all') { renderProviderSelection(); return; }
    setHead('CURATED FOR YOU', 'Was schaust du <em>heute?</em>', 'Die besten Geschichten. Überall zu Hause.', true);
    $('#contentSections').innerHTML = [
      row('Handverlesen für dich', 'Geschichten, die du nicht verpassen solltest', ids.picks),
      row('Gerade überall im Gespräch', 'Die beliebtesten Stories in unserem Showcase', ids.trending, true),
      editorialBanner(),
      row('Filmabend? Wir haben Ideen.', 'Ganz großes Kino – ganz nach deinem Geschmack', ids.movies),
      row('Andere Welten. Neue Regeln.', 'Entdecke fremde Galaxien und fantastische Universen', ids.worlds),
      row('Nervenkitzel garantiert', 'Mystery, Crime & dunkle Geheimnisse', ids.suspense),
      row('Noch eine Folge ...', 'Für deinen nächsten entspannten Serienabend', ids.comfort)
    ].join('');
    $('#manifestoBanner').hidden = false;
  }
  function genresFor(items) {
    const count = new Map(); items.forEach(item => item.genres.forEach(g => count.set(g, (count.get(g)||0) + 1)));
    return [...count].sort((a,b)=>b[1]-a[1]).slice(0,7).map(x=>x[0]);
  }
  function renderCatalog() {
    const base = CATALOG.filter(item => state.view === 'series' ? item.type === 'Serie' : state.view === 'movies' ? item.type === 'Film' : state.view === 'list' ? state.favorites.has(item.id) : true);
    const titles = {series:['SERIES COLLECTION','Serien für <em>jeden Vibe.</em>','Von der ersten Folge bis zum letzten Cliffhanger.'],movies:['THE CINEMA CLUB','Ganz großes <em>Kino.</em>','Filmperlen, Blockbuster und alles dazwischen.'],list:['YOUR PERSONAL SPACE','Deine <em>Watchlist.</em>','Alles, was du später erleben möchtest.'],all:['THE COMPLETE EDIT','Alles. <em>An einem Ort.</em>','Entdecke das ganze Streaming-Place-Showcase.']};
    const [kicker,title,description] = titles[state.view];
    setHead(kicker,title,description);
    const genreList = genresFor(base.filter(item => state.provider === 'all' || item.provider === state.provider));
    let items = filtered(base);
    const chips = `<div class="small-filter-row">${['Alle',...genreList].map(genre=>`<button class="genre-chip ${state.genre===genre?'active':''}" data-genre="${esc(genre)}">${esc(genre)}</button>`).join('')}</div>`;
    const content = items.length ? `<p class="count-label">${items.length} ${items.length===1?'Titel':'Titel'} in deiner Auswahl</p><div class="catalog-grid">${items.map(item=>card(item)).join('')}</div>` : emptyState();
    $('#contentSections').innerHTML = chips + content;
    $('#manifestoBanner').hidden = (state.view === 'list');
  }
  function renderProviderSelection() {
    const items = filtered(CATALOG);
    setHead('YOUR STREAMING SERVICES', `${esc(state.provider)} <em>Highlights.</em>`, 'Entdecke Titel aus deinem ausgewählten Streaming-Universum.');
    $('#contentSections').innerHTML = items.length ? `<p class="count-label">${items.length} ausgewählte Serien und Filme</p><div class="catalog-grid">${items.map(item=>card(item)).join('')}</div>` : emptyState();
    $('#manifestoBanner').hidden = false;
  }
  function emptyState() {
    const isList = state.view === 'list' && state.favorites.size === 0;
    return `<div class="empty-state">${icon(isList ? 'heart' : 'search')}<h3>${isList ? 'Deine Liste wartet auf dich.' : 'Hier ist es noch ruhig.'}</h3><p>${isList ? 'Speichere Serien und Filme mit dem Plus-Symbol. Sie erscheinen dann hier – auch bei deinem nächsten Besuch.' : 'Für diese Kombination haben wir noch keine Titel. Probier einen anderen Anbieter oder Genre-Filter.'}</p><button class="button button-primary" data-reset>${isList ? 'Titel entdecken' : 'Filter zurücksetzen'} ${icon('arrow')}</button></div>`;
  }
  function render() {
    if (state.view === 'home') renderHome(); else renderCatalog();
    renderProviders();
    $$('[data-view]').forEach(el => el.classList.toggle('active', el.dataset.view === state.view));
  }
  function setView(view) {
    state.view = view; state.genre = 'Alle';
    if (['movies','list','all'].includes(view)) state.provider = 'all';
    render(); window.scrollTo({top:0,behavior:'smooth'});
  }
  function renderProviders() {
    $('#providerStrip').innerHTML = providers.map(p => `<button class="provider-pill provider-${p.slug==='Netflix'?'netflix':p.slug==='Disney+'?'disney':p.slug==='Prime Video'?'prime':p.slug==='Paramount+'?'paramount':p.slug==='Apple TV+'?'apple':p.slug==='Sky / WOW'?'sky':'all'} ${state.provider===p.slug?'selected':''}" data-provider="${esc(p.slug)}" aria-pressed="${state.provider===p.slug}"><span>${esc(p.glyph)}</span></button>`).join('');
  }

  function toggleSaved(id) {
    const item = byId.get(id); if (!item) return;
    if (state.favorites.has(id)) { state.favorites.delete(id); toast(`${item.title} aus deiner Liste entfernt`); }
    else { state.favorites.add(id); toast(`${item.title} zu deiner Liste hinzugefügt`); }
    saveFavorites();
    render(); updateHeroSave();
    if ($('#detailDialog').open && $('#detailDialog').dataset.itemId === id) {
      const button = $('[data-detail-save]', $('#detailDialog'));
      if (button) { button.classList.toggle('saved', state.favorites.has(id)); button.innerHTML = icon(state.favorites.has(id) ? 'check':'plus'); button.setAttribute('aria-label', state.favorites.has(id) ? 'Aus Liste entfernen':'Zur Liste hinzufügen'); }
    }
  }

  // Featured stories rotate on an eight-second rhythm, pausing during interaction.
  function renderHero() {
    const item = HERO[state.heroIndex];
    $('#heroBackground').style.backgroundImage = `url("${item.backdrop || item.poster}")`;
    $('#heroTitle').textContent = item.title;
    $('#heroTitle').classList.toggle('long-title', item.title.length > 13);
    $('#heroProvider').textContent = item.type === 'Film' ? 'CINEMA CLUB' : item.provider.toUpperCase();
    $('#heroKicker').textContent = item.type === 'Film' ? 'THE CINEMA EDIT' : 'YOUR NEXT OBSESSION';
    $('#heroDescription').textContent = item.description;
    $('#heroFacts').innerHTML = `<span class="match-score">${item.badge ? 'TOP PICK' : 'EMPFOHLEN'}</span><span class="fact-separator"></span><span>${item.year}</span><span class="fact-separator"></span><span>${item.seasons ? item.seasons+' Staffel'+(item.seasons===1?'':'n') : item.duration}</span><span class="fact-separator"></span><span class="age-rating">${item.age||'12+'}</span><span class="fact-separator"></span><span>${esc(item.genres[0])}</span>`;
    $('#heroCurrent').textContent = String(state.heroIndex+1).padStart(2,'0');
    $('#heroProgress').innerHTML = HERO.map((x,index)=>`<button class="${state.heroIndex===index?'active':''}" data-slide="${index}" title="${esc(x.title)}" aria-label="${esc(x.title)} anzeigen"></button>`).join('');
    updateHeroSave();
    $('#heroTotal').textContent = String(HERO.length).padStart(2,'0');
    $('#heroPreviewPlay').hidden = true;
    $('#heroTrailer').innerHTML = icon('play')+' '+(item.trailer ? 'Trailer abspielen' : 'Trailer suchen');
    window.StreamingPlaceCinema?.hero(item);
  }
  function updateHeroSave() {
    const saved = state.favorites.has(HERO[state.heroIndex].id);
    const btn = $('#heroSave'); btn.classList.toggle('saved', saved); btn.innerHTML = icon(saved ? 'check' : 'plus'); btn.setAttribute('aria-label', saved ? 'Aus Liste entfernen':'Zur Liste hinzufügen');
  }
  function restartHeroTimer() {
    clearInterval(state.heroTimer);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    state.heroTimer = setInterval(()=>{if (!$('dialog[open]').length && !document.hidden && !window.StreamingPlaceCinema?.isPlaying()) changeSlide(1, false);},15000);
  }
  function changeSlide(direction, restart = true) {
    state.heroIndex = (state.heroIndex + direction + HERO.length) % HERO.length;
    renderHero(); if (restart) restartHeroTimer();
  }

  function providerUrl(item) {
    if (item.type === 'Film') return `https://www.justwatch.com/de/Suche?q=${encodeURIComponent(item.title)}`;
    return item.watchUrl || `https://www.justwatch.com/de/Suche?q=${encodeURIComponent(item.title)}`;
  }
  function showDetail(id) {
    const item = byId.get(id); if (!item) return;
    const dialog = $('#detailDialog'); dialog.dataset.itemId = id;
    const saved = state.favorites.has(id);
    const providerText = item.type === 'Film' ? 'Anbieter finden' : `Bei ${item.provider} öffnen`;
    $('#detailContent').innerHTML = `<button class="dialog-close detail-close" data-close-detail aria-label="Details schließen">${icon('x')}</button>
      <div class="detail-backdrop" style="background-image:url('${esc(item.backdrop||item.poster)}')"></div>
      <div class="detail-main"><div class="detail-poster"><img src="${esc(item.poster)}" alt="Cover von ${esc(item.title)}" /></div><div class="detail-info">
        <div class="detail-brand">${esc(item.provider.toUpperCase())}</div><h2>${esc(item.title)}</h2>
        <div class="detail-facts"><span>${item.year}</span><i class="dot"></i><span>${item.type}</span><i class="dot"></i><span>${esc(item.seasons ? item.seasons+' Staffel'+(item.seasons===1?'':'n') : item.duration||'') }</span><i class="dot"></i><span class="age-rating">${item.age||'12+'}</span></div>
        <p>${esc(item.description)}</p><div class="detail-tags">${item.genres.map(g=>`<span>${esc(g)}</span>`).join('')}</div>
        <div class="detail-actions"><button class="button button-primary" data-trailer="${esc(id)}">${icon('play')} Trailer ansehen</button>${item.previewVideo ? `<button class="button button-glass" data-cinema-play="1">${icon('play')} Vorschau starten</button>` : ''}<a class="button button-glass" href="${esc(providerUrl(item))}" target="_blank" rel="noopener noreferrer">${icon('external')} ${esc(providerText)}</a><button class="circle-button ${saved?'saved':''}" data-detail-save="${esc(id)}" aria-label="${saved?'Aus Liste entfernen':'Zur Liste hinzufügen'}">${icon(saved?'check':'plus')}</button></div>
        <div class="detail-availability"><h4>WO KANN ICH DAS ANSEHEN?</h4><p><strong>${esc(item.type === 'Film' ? 'Anbieter vergleichen' : item.provider)}</strong> · ${item.type === 'Film' ? 'Finde aktuelle Leih-, Kauf- und Abo-Angebote für Deutschland.' : 'Öffne den Anbieter, um Verfügbarkeit, Abo und Wiedergabe zu prüfen.'} Streaming Place spielt keine lizenzierten Vollversionen selbst ab.</p></div>
      </div></div><div class="detail-bottom">STREAMING PLACE SHOWCASE <span style="margin:0 10px;color:#4a515e">◆</span> Cover und Metadaten dienen der Entdeckung. Die Anbieter sind eigenständige Dienste.</div>`;
    dialog.showModal();
    window.StreamingPlaceCinema?.open(item);
  }
  function openTrailer(id) {
    const item = byId.get(id); if (!item) return;
    if ($('#detailDialog').open) $('#detailDialog').close();
    $('#playerTitle').textContent = item.title;
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(item.title+' official trailer')}`;
    $('#playerYouTube').href = item.trailer ? `https://www.youtube.com/watch?v=${item.trailer}` : searchUrl;
    if (item.previewVideo) {
      $('#playerYouTube').href = item.previewVideo;
      $('#playerYouTube').textContent = 'Video direkt öffnen';
      document.querySelector('.player-bottom > span').textContent = 'OFFEN LIZENZIERTE FILMVORSCHAU · BLENDER FOUNDATION';
      $('#trailerDialog').showModal();
      window.StreamingPlaceCinema?.player(item, $('#playerFrame'));
      clearInterval(state.heroTimer);
      return;
    }
    document.querySelector('.player-bottom > span').textContent = 'OFFIZIELLER TRAILER · YOUTUBE';
    $('#playerYouTube').innerHTML = 'Auf YouTube öffnen ' + icon('external');
    $('#playerFrame').innerHTML = item.trailer
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.trailer)}?autoplay=1&mute=0&playsinline=1&controls=1&rel=0" title="${esc(item.title)} – offizieller Trailer" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
      : `<div class="player-fallback">${icon('play')}<p>Für diesen Titel führt dich die Trailer-Suche zu YouTube. Vollständige Folgen und Filme findest du beim jeweiligen Streaming-Anbieter.</p><a class="button button-primary" href="${esc(searchUrl)}" target="_blank" rel="noopener noreferrer">Trailer auf YouTube finden ${icon('external')}</a></div>`;
    $('#trailerDialog').showModal();
    clearInterval(state.heroTimer);
  }
  function closeTrailer() { $('#trailerDialog').close(); $('#playerFrame').replaceChildren(); restartHeroTimer(); }

  function searchResults(query) {
    const q = query.toLocaleLowerCase('de').trim();
    const matches = q ? CATALOG.filter(item => [item.title,item.provider,item.description,item.type,...item.genres].join(' ').toLocaleLowerCase('de').includes(q)) : ids.picks.map(id=>byId.get(id));
    $('#searchStatus').textContent = q ? `${matches.length} TREFFER FÜR „${query.toUpperCase()}“` : 'BELIEBT BEI STREAMING PLACE';
    $('#searchResults').innerHTML = matches.length ? matches.map(item=>card(item)).join('') : `<div class="search-placeholder">${icon('search')}<p>Keine Treffer. Versuch einen anderen Titel, Anbieter oder ein Genre.</p></div>`;
  }
  function openSearch() {
    $('#searchDialog').showModal(); $('#searchInput').value = ''; searchResults('');
    setTimeout(()=>$('#searchInput').focus(),40);
    clearInterval(state.heroTimer);
  }
  function closeSearch() { $('#searchDialog').close(); restartHeroTimer(); }

  function activateTarget(event) {
    const save = event.target.closest('[data-save], [data-detail-save]');
    if (save) { event.preventDefault(); event.stopPropagation(); toggleSaved(save.dataset.save || save.dataset.detailSave); return; }
    const trailerFirst = event.target.closest('[data-trailer]');
    if (trailerFirst) { event.preventDefault(); event.stopPropagation(); openTrailer(trailerFirst.dataset.trailer); return; }
    const open = event.target.closest('[data-open]');
    if (open) { event.preventDefault(); if ($('#searchDialog').open) closeSearch(); showDetail(open.dataset.open); return; }
    const cinemaPlay = event.target.closest('[data-cinema-play]');
    if (cinemaPlay) { event.preventDefault(); window.StreamingPlaceCinema?.playCurrent(); return; }
    const trailer = event.target.closest('[data-trailer]');
    if (trailer) { event.preventDefault(); openTrailer(trailer.dataset.trailer); return; }
    const view = event.target.closest('[data-view]');
    if (view) { setView(view.dataset.view); return; }
    const provider = event.target.closest('[data-provider]');
    if (provider) { state.provider = provider.dataset.provider; state.genre='Alle'; render(); return; }
    const genre = event.target.closest('[data-genre]');
    if (genre) { state.genre = genre.dataset.genre; render(); return; }
    const scroll = event.target.closest('[data-scroll]');
    if (scroll) { const track = document.getElementById(scroll.dataset.scroll); track?.scrollBy({left: Number(scroll.dataset.direction)*Math.max(300, track.clientWidth*.7),behavior:'smooth'}); return; }
    const slide = event.target.closest('[data-slide]');
    if (slide) { state.heroIndex = Number(slide.dataset.slide); renderHero(); restartHeroTimer(); return; }
    const reset = event.target.closest('[data-reset]');
    if (reset) { state.provider='all'; state.genre='Alle'; if (state.view==='list') state.view='home'; render(); return; }
    if (event.target.closest('[data-close-detail]')) $('#detailDialog').close();
  }

  document.addEventListener('click', activateTarget);
  document.addEventListener('keydown', event => {
    const cardEl = event.target.closest?.('.poster-card[role="button"]');
    if (cardEl && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); showDetail(cardEl.dataset.open); return; }
    if (event.key === '/' && !$$('dialog[open]').length && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); openSearch(); }
  });
  $('#brandHome').addEventListener('click', e => { e.preventDefault(); state.provider='all'; setView('home'); });
  $('#searchTrigger').addEventListener('click', openSearch);
  $('#mobileSearch').addEventListener('click', openSearch);
  $('#bottomSearch').addEventListener('click', openSearch);
  $('#profileTrigger').addEventListener('click', () => toast('Willkommen bei Streaming Place ✦'));
  $('#manifestoExplore').addEventListener('click', () => setView('all'));
  $('#heroTrailer').addEventListener('click', () => openTrailer(HERO[state.heroIndex].id));
  $('#heroDetails').addEventListener('click', () => showDetail(HERO[state.heroIndex].id));
  $('#heroPreviewPlay').addEventListener('click', () => window.StreamingPlaceCinema?.playCurrent());
  $('#heroSave').addEventListener('click', () => toggleSaved(HERO[state.heroIndex].id));
  $('#heroPrevious').addEventListener('click', () => changeSlide(-1));
  $('#heroNext').addEventListener('click', () => changeSlide(1));
  $('#closeSearch').addEventListener('click', closeSearch);
  $('#searchInput').addEventListener('input', e => searchResults(e.target.value));
  $('#closeTrailer').addEventListener('click', closeTrailer);
  $('#searchDialog').addEventListener('click', e => { if (e.target === $('#searchDialog')) closeSearch(); });
  $('#detailDialog').addEventListener('click', e => { if (e.target === $('#detailDialog')) $('#detailDialog').close(); });
  $('#trailerDialog').addEventListener('click', e => { if (e.target === $('#trailerDialog')) closeTrailer(); });
  $('#trailerDialog').addEventListener('close', () => { $('#playerFrame').replaceChildren(); window.StreamingPlaceCinema?.hero(HERO[state.heroIndex]); restartHeroTimer(); });
  $('#searchDialog').addEventListener('close', restartHeroTimer);
  $('#detailDialog').addEventListener('close', () => { window.StreamingPlaceCinema?.close(); if (!$('#trailerDialog').open) { window.StreamingPlaceCinema?.hero(HERO[state.heroIndex]); restartHeroTimer(); } });
  window.addEventListener('scroll', () => $('#siteHeader').classList.toggle('scrolled', window.scrollY > 20), {passive:true});
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !$$('dialog[open]').length) restartHeroTimer(); });

  renderHero(); render(); restartHeroTimer();
})();
