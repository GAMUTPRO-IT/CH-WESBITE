/* ════════════════════════════════════════════════════════════════════════════
   Children Home website: section menus in the top menu (all five pages)
   Point at a page name (Home, Our Care, Stories, Moments, Get Involved) to open a
   list of the sections on that page, then pick one to go straight to it.
   Clicking the page name itself opens that page. On phones the same lists open
   inside the ☰ menu when you tap a page name.

   To add, remove or rename a menu item, edit SECTIONS below. Each line is:
     [ id of the section in that page , icon , English name , Chinese name , 'sub' to indent it ]
   The id must match id="…" on the section in the HTML.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  const SECTIONS = {
    'index.html': [
      ['home', 'fa-house', 'Welcome', '欢迎'],
      ['programs', 'fa-hands-holding-child', 'Programs', '我们的项目'],      // only listed while a program is published
      ['credentials', 'fa-award', 'Credentials', '资质认证'],
      ['about', 'fa-seedling', 'About us', '关于我们'],
      ['explore', 'fa-compass', 'Explore', '探索'],
      ['contact', 'fa-location-dot', 'Get in touch', '联系我们'],
      ['social', 'fa-share-nodes', 'Social media', '社交媒体'],
      ['donate', 'fa-hand-holding-heart', 'Donate', '捐款']
    ],
    'our-care.html': [
      ['support', 'fa-heart', 'Our programmes', '我们的计划'],
      ['shelter', '', 'Shelter & daily care', '住所与日常照顾', 'sub'],
      ['education', '', 'Education & academic support', '教育与课业支持', 'sub'],
      ['growth', '', 'Emotional & social development', '情感与社交发展', 'sub'],
      ['gallery', 'fa-images', 'Life at the Home', '院内生活'],
      ['donate', 'fa-hand-holding-heart', 'Donate', '捐款']
    ],
    'stories.html': [
      ['stories', 'fa-book-open', 'All stories', '全部故事'],
      ['success-stories', 'fa-star', 'Success Stories', '成功故事'],
      ['childrens-stories', 'fa-child-reaching', 'Children’s Stories', '孩子们的故事'],
      ['donate', 'fa-hand-holding-heart', 'Donate', '捐款']
    ],
    'moments.html': [
      ['news', 'fa-camera-retro', 'News & moments', '新闻与温馨时刻'],
      ['donate', 'fa-hand-holding-heart', 'Donate', '捐款']
    ],
    'get-involved.html': [
      ['ways', 'fa-handshake-angle', 'Ways to help', '参与方式'],
      ['sponsor', 'fa-hand-holding-heart', 'Sponsor a child', '资助孩子'],
      ['volunteer', 'fa-hands-holding-child', 'Volunteer', '当义工'],
      ['partner', 'fa-handshake', 'Corporate partnership', '企业合作'],
      ['donate', 'fa-heart', 'Donate', '捐款'],
      ['contact', 'fa-envelope', 'Contact us', '联系我们']
    ]
  };
  /* Stories page: these items press the matching filter button (All / Success / Children's) */
  const STORY_FILTER = { 'stories': 0, 'success-stories': 1, 'childrens-stories': 2 };
  const WORDS = { en: { open: 'Show sections' }, zh: { open: '显示本页内容' } };

  const zh = () => document.documentElement.lang === 'zh';
  const w = k => WORDS[zh() ? 'zh' : 'en'][k];
  const pageOf = href => {                                  // "our-care.html#x" → "our-care.html"; "#" → null
    const path = String(href || '').split(/[?#]/)[0];
    if (!path) return null;
    return path.split('/').pop() || 'index.html';
  };
  const here = (location.pathname.split('/').pop() || 'index.html');

  function makeList(page, cls) {
    const box = document.createElement('div');
    box.className = cls;
    SECTIONS[page].forEach(([id, icon, en, zhName, kind]) => {
      const a = document.createElement('a');
      a.href = (page === here ? '' : page) + '#' + id;
      a.dataset.sec = id; a.dataset.page = page; a.dataset.en = en; a.dataset.zh = zhName;
      if (kind === 'sub') a.className = 'sub';
      a.innerHTML = '<i class="fa ' + (icon || 'fa-circle') + '" aria-hidden="true"></i><span></span>';
      box.appendChild(a);
    });
    return box;
  }
  function relabel() {
    document.querySelectorAll('a[data-sec]').forEach(a => { a.querySelector('span').textContent = zh() ? a.dataset.zh : a.dataset.en; });
    document.querySelectorAll('.mob-caret').forEach(b => b.setAttribute('aria-label', w('open')));
  }

  /* going to a section on this same page */
  function storyFilter(id) {
    const btn = document.querySelectorAll('#stFilter button')[STORY_FILTER[id]];
    if (btn && !btn.classList.contains('on')) btn.click();
    const sec = document.getElementById('stories');
    if (sec) sec.scrollIntoView();
  }
  /* Some things slide up 28px as they appear. Put the target in its final place first,
     or the jump would stop 28px short. */
  function settle(el) {
    const a = el && el.closest('.aos,.aos-l,.aos-r');
    if (!a || a.classList.contains('in')) return;
    a.style.transition = 'none';
    a.classList.add('in');
    void a.offsetHeight;
    requestAnimationFrame(() => { a.style.transition = ''; });
  }
  function go(link, e) {
    if (link.dataset.page !== here) return;                 // another page: the browser goes there
    const id = link.dataset.sec;
    settle(document.getElementById(id));
    if (here === 'stories.html' && id in STORY_FILTER) {
      e.preventDefault(); storyFilter(id); history.replaceState(null, '', '#' + id);
    } else if (id === 'home') {
      e.preventDefault(); window.scrollTo(0, 0); history.replaceState(null, '', '#home');
    }
  }

  /* ── laptop / desktop menu ── */
  const nav = document.querySelector('#hdr .nav'), bar = document.querySelector('#hdr .hdr');
  const canHover = matchMedia('(hover:hover) and (pointer:fine)');
  function closeDd(dd) { dd.classList.remove('open'); dd.querySelector(':scope > a').setAttribute('aria-expanded', 'false'); }
  function closeAll() { document.querySelectorAll('.nav-dd.open').forEach(closeDd); }
  function openDd(dd, byKeyboard) {
    closeAll();
    dd.classList.add('open');
    dd.querySelector(':scope > a').setAttribute('aria-expanded', 'true');
    const r = dd.getBoundingClientRect(), list = dd.querySelector('.nav-sub');
    if (bar) list.style.setProperty('--dd-gap', Math.max(0, Math.round(bar.getBoundingClientRect().bottom - r.bottom)) + 'px');   // sit right under the header
    dd.classList.toggle('edge', r.left + list.offsetWidth > innerWidth - 12);   // keep it on screen
    if (byKeyboard) { const first = list.querySelector('a:not([hidden])'); if (first) first.focus(); }
  }
  if (nav) nav.querySelectorAll(':scope > a').forEach(a => {
    const page = pageOf(a.getAttribute('href'));
    if (!SECTIONS[page]) return;
    const dd = document.createElement('div');
    dd.className = 'nav-dd';
    a.replaceWith(dd);
    const caret = document.createElement('button');
    caret.type = 'button'; caret.className = 'nav-caret'; caret.tabIndex = -1; caret.setAttribute('aria-hidden', 'true');
    caret.innerHTML = '<i class="fa fa-chevron-down"></i>';
    const list = makeList(page, 'nav-sub');
    list.id = 'nav-sub-' + page.replace('.html', '');
    a.setAttribute('aria-haspopup', 'true'); a.setAttribute('aria-expanded', 'false'); a.setAttribute('aria-controls', list.id);
    dd.append(a, caret, list);
    const toggle = e => { e.preventDefault(); if (dd.classList.contains('open')) closeDd(dd); else openDd(dd, e.detail === 0); };
    /* with a mouse the list opens on pointing, so clicking the page name opens that page;
       with the keyboard (Enter) or a touch screen, clicking the name opens the list */
    a.addEventListener('click', e => { if (canHover.matches && e.detail !== 0) { closeAll(); return; } toggle(e); });
    caret.addEventListener('click', toggle);
    let leave = 0;
    dd.addEventListener('mouseenter', () => { if (!canHover.matches) return; clearTimeout(leave); if (!dd.classList.contains('open')) openDd(dd, false); });
    dd.addEventListener('mouseleave', () => { if (!canHover.matches) return; clearTimeout(leave); leave = setTimeout(() => closeDd(dd), 200); });
    list.addEventListener('click', e => { const l = e.target.closest('a'); if (l) { closeAll(); go(l, e); } });
    list.addEventListener('keydown', e => {                  // arrow keys move through the list
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const items = [...list.querySelectorAll('a:not([hidden])')], i = items.indexOf(document.activeElement);
      const next = items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
      if (next) next.focus();
    });
    dd.addEventListener('focusout', e => { if (!dd.contains(e.relatedTarget)) closeDd(dd); });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.nav-dd')) closeAll(); });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = document.querySelector('.nav-dd.open');
    if (open) { closeAll(); open.querySelector(':scope > a').focus(); }
  });
  addEventListener('scroll', () => { if (document.querySelector('.nav-dd.open')) closeAll(); }, { passive: true });

  /* ── phone menu (☰) ── */
  const mob = document.getElementById('mob-menu'), burger = document.getElementById('burger');
  if (mob) {
    mob.querySelectorAll(':scope > a').forEach(a => {
      const page = pageOf(a.getAttribute('href'));
      if (!SECTIONS[page]) return;
      const row = document.createElement('div');
      row.className = 'mob-row';
      a.replaceWith(row);
      const caret = document.createElement('button');
      caret.type = 'button'; caret.className = 'mob-caret';
      caret.innerHTML = '<i class="fa fa-chevron-down" aria-hidden="true"></i>';
      const list = makeList(page, 'mob-sub');
      list.hidden = true; list.id = 'mob-sub-' + page.replace('.html', '');
      a.setAttribute('aria-expanded', 'false'); a.setAttribute('aria-controls', list.id);
      caret.setAttribute('aria-expanded', 'false'); caret.setAttribute('aria-controls', list.id);
      row.append(a, caret);
      row.after(list);
    });
    /* Tapping a page name opens its list instead of leaving. This runs before the page's own
       "close the menu when a link is tapped" handler, and stops it for page names only. */
    mob.addEventListener('click', e => {
      const hit = e.target.closest('.mob-row > a, .mob-caret');
      if (!hit) return;
      e.preventDefault(); e.stopPropagation();
      const row = hit.closest('.mob-row'), list = row.nextElementSibling, open = list.hidden;
      list.hidden = !open; row.classList.toggle('open', open);
      row.querySelectorAll('[aria-expanded]').forEach(x => x.setAttribute('aria-expanded', String(open)));
    }, true);
    /* the round Donate / Volunteer / WhatsApp buttons step aside while the menu is open */
    new MutationObserver(() => document.body.classList.toggle('menu-open', mob.classList.contains('open')))
      .observe(mob, { attributes: true, attributeFilter: ['class'] });
    mob.addEventListener('click', e => {
      const l = e.target.closest('.mob-sub a');
      if (!l) return;
      if (burger) burger.classList.remove('open');
      mob.classList.remove('open');
      go(l, e);
    });
  }

  /* arriving from another page with #section: same 28px fix */
  if (location.hash) settle(document.getElementById(decodeURIComponent(location.hash.slice(1))));

  /* ── "Programs" is listed only while the Home page has a program to show.
        The other pages remember what Home last showed. ── */
  const remember = v => { try { if (v === undefined) return localStorage.getItem('ch_programs_on'); localStorage.setItem('ch_programs_on', v); } catch (e) { return null; } };
  const pg = here === 'index.html' && document.getElementById('programs');
  if (pg) {
    let jumped = false;
    const sync = () => {
      document.querySelectorAll('a[data-sec="programs"]').forEach(a => { a.hidden = pg.hidden; });
      remember(pg.hidden ? '0' : '1');
      if (!pg.hidden && !jumped && location.hash === '#programs') { jumped = true; pg.scrollIntoView(); }   // arrived from another page
    };
    sync();
    new MutationObserver(sync).observe(pg, { attributes: true, attributeFilter: ['hidden'] });
  } else if (remember() !== '1') {
    document.querySelectorAll('a[data-sec="programs"]').forEach(a => { a.hidden = true; });
  }

  /* ── Stories: arriving with #success-stories or #childrens-stories shows that type ── */
  if (here === 'stories.html') {
    const want = decodeURIComponent(location.hash.slice(1));
    if (want === 'success-stories' || want === 'childrens-stories') requestAnimationFrame(() => storyFilter(want));
  }

  /* ── mark the section you are looking at in this page's list ── */
  const mine = (SECTIONS[here] || []).map(([id]) => id);
  let spyRaf = 0;
  function spy() {
    spyRaf = 0;
    const line = innerHeight * 0.4;
    let cur = mine[0];
    mine.forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.hidden && el.getClientRects().length && el.getBoundingClientRect().top <= line) cur = id;
    });
    document.querySelectorAll('a[data-page="' + here + '"]').forEach(a => a.classList.toggle('here', a.dataset.sec === cur));
  }
  addEventListener('scroll', () => { if (!spyRaf) spyRaf = requestAnimationFrame(spy); }, { passive: true });

  /* ── One section at a time (laptops and desktops; the rules are in sections.css) ──
     A turn of the wheel or a swipe on the trackpad goes straight to the next or previous
     section. Inside a section taller than the screen it scrolls normally until that
     section's end, so all of it can be read. */
  const snapOn = matchMedia('(hover:hover) and (pointer:fine) and (min-height:540px)');
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  function stops() {
    const top = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    return [...document.querySelectorAll('[data-snap]')].filter(el => el.getClientRects().length).map(el => {
      const s = el.getBoundingClientRect().top + scrollY;
      const start = el.dataset.snap === 'first' ? 0 : Math.min(max, Math.round(s - top));
      return { start, end: Math.min(max, Math.max(start, Math.round(s + el.offsetHeight - innerHeight))) };
    });
  }
  function wheelTarget(dir) {
    const y = scrollY, list = stops();
    const cur = list.find(k => y >= k.start - 2 && y <= k.end + 2);
    if (!cur) return null;                                  // between stops (still moving): leave it to the browser
    if (dir > 0) {
      if (y < cur.end - 2) return null;                     // still inside a long section
      const next = list.find(k => k.start > y + 2);
      return next ? next.start : null;
    }
    if (y > cur.start + 2) return null;
    const prev = list.filter(k => k.end < y - 2).pop();
    return prev ? prev.end : null;                          // a long section is entered from its end
  }
  function scrollsItself(el, dir) {                         // a scrolling box inside the page (a pop-up, a text box…)
    for (; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
      const o = getComputedStyle(el).overflowY;
      if ((o === 'auto' || o === 'scroll') && el.scrollHeight > el.clientHeight + 1)
        if (dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
    }
    return false;
  }
  let lockUntil = 0;
  addEventListener('wheel', e => {
    if (!snapOn.matches || e.ctrlKey || !e.deltaY || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (document.documentElement.style.overflow === 'hidden' || document.body.style.overflow === 'hidden') return;   // a pop-up is open
    const now = performance.now();
    if (now < lockUntil) { e.preventDefault(); lockUntil = Math.max(lockUntil, now + 220); return; }   // swallow the rest of one swipe
    const dir = Math.sign(e.deltaY);
    if (scrollsItself(e.target, dir)) return;
    const to = wheelTarget(dir);
    if (to === null) return;
    e.preventDefault();
    lockUntil = now + 750;
    window.scrollTo({ top: to, behavior: calm.matches ? 'auto' : 'smooth' });
  }, { passive: false });

  /* A Google Map comes from another website, so while the mouse is over it the page never
     hears the scroll. A see-through cover passes the scroll to the page; one click on the
     map takes the cover away (until the mouse leaves) so the map can be dragged and zoomed. */
  document.querySelectorAll('iframe[src*="maps.google."], iframe[src*="google.com/maps"]').forEach(frame => {
    const box = frame.parentElement;
    if (!box || getComputedStyle(box).position === 'static') return;
    const shield = document.createElement('button');
    shield.type = 'button'; shield.className = 'map-shield';
    shield.innerHTML = '<span><i class="fa fa-hand-pointer" aria-hidden="true"></i> <b></b></span>';
    shield.addEventListener('click', () => { shield.classList.add('off'); frame.focus(); });
    box.addEventListener('mouseleave', () => shield.classList.remove('off'));
    box.appendChild(shield);
  });
  WORDS.en.map = 'Click to use the map'; WORDS.zh.map = '点击以使用地图';
  const relabelMaps = () => document.querySelectorAll('.map-shield b').forEach(b => { b.textContent = w('map'); b.closest('button').setAttribute('aria-label', w('map')); });
  new MutationObserver(relabelMaps).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  relabelMaps();

  relabel(); spy();
  new MutationObserver(relabel).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  if (window.fitBrandTag) window.fitBrandTag();             // the menu got a little wider: re-check it still fits
})();