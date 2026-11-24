/* ════════════════════════════════════════════════════════════════════════════
   Children Home website: section menus in the top menu (all five pages),
   one-section-at-a-time scrolling, the floating contact bubble, and the
   privacy labels on pictures of children
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
  const WORDS = {
    en: { open: 'Show sections', bubble: 'How can we help?', bubbleOpen: 'Show Donate, Volunteer and WhatsApp', bubbleClose: 'Close' },
    zh: { open: '显示本页内容', bubble: '我们能帮您什么？', bubbleOpen: '显示捐款、义工和 WhatsApp', bubbleClose: '关闭' }
  };

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

  /* ── Floating contact bubble (bottom right) ──
     The page's Donate / Volunteer / WhatsApp links stay as they are; this adds the round
     bubble that opens and closes them. Styles: "Floating contact bubble" in sections.css. */
  const fbar = document.querySelector('.float-bar');
  if (fbar) {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'fb-toggle'; btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<i class="fa fa-comment-dots fb-chat" aria-hidden="true"></i><i class="fa fa-xmark fb-x" aria-hidden="true"></i><span class="fb-tip"></span>';
    fbar.appendChild(btn);
    const links = [...fbar.querySelectorAll('a')];
    const setOpen = open => {
      fbar.classList.toggle('fb-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', w(open ? 'bubbleClose' : 'bubbleOpen'));
      links.forEach(a => { a.tabIndex = open ? 0 : -1; });
    };
    setOpen(false);
    btn.addEventListener('click', () => setOpen(!fbar.classList.contains('fb-open')));
    links.forEach(a => a.addEventListener('click', () => setTimeout(() => setOpen(false), 150)));
    document.addEventListener('click', e => { if (!fbar.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && fbar.classList.contains('fb-open')) { setOpen(false); btn.focus(); } });
    const relabelBubble = () => { btn.querySelector('.fb-tip').textContent = w('bubble'); btn.setAttribute('aria-label', w(fbar.classList.contains('fb-open') ? 'bubbleClose' : 'bubbleOpen')); };
    relabelBubble();
    new MutationObserver(relabelBubble).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  /* ── Privacy labels on every picture of children ────────────────────────────
     Real photos get "Edited for privacy"; AI-made pictures get "AI illustration".
     Pictures uploaded on the admin page (Programs, Moments) count as real photos.
     ► Adding a new picture of children? Put its file name in the right list below,
       or add  data-kids  (real photo) or  data-kids="ai"  to the picture in the HTML.
     The same name also covers its small copy in assets/img/thumbs/.               */
  const KID_PHOTOS = [
    'care-hug-1.jpg', 'care-hug.jpg', 'video-cover.jpg',
    'hero-festival.jpg', 'hero-friends.jpg', 'hero-play.jpg', 'hero-stage.jpg',
    'life-activity.jpg', 'life-cny.jpg', 'life-colouring.jpg', 'life-lion-dance.jpg', 'life-painting.jpg',
    'life-puzzle.jpg', 'life-school-1.jpg', 'life-school.jpg', 'life-selfie-1.jpg', 'life-selfie.jpg', 'life-sharing-circle.jpg',
    'moment-beds-1.jpg', 'moment-beds-3.jpg', 'moment-beds-4.jpg', 'moment-chess-1.jpg', 'moment-chess-2.jpg', 'moment-chess-3.jpg'
  ];
  const KID_AI = [
    'home-friends.jpg', 'home-new-year.jpg', 'home-playtime.jpg', 'moments-lanterns.jpg', 'our-care-dinner.jpg',
    'first-day.jpg', 'grandma-did-her-best.jpg', 'no-one-to-take-her-in.jpg', 'somewhere-to-call-home.jpg',
    'the-boy-who-rewrote-his-story.jpg', 'too-many-doors-no-home.jpg', 'two-siblings-one-promise.jpg', 'where-he-belongs.jpg',
    // Stories page pictures (Nov 2026)
    'first-day-2.jpg', 'no-one-to-take-her-in-2.jpg', 'where-he-belongs-2.jpg', 'grandma-did-her-best-2.jpg', 'two-siblings-one-promise-2.jpg',
    'the-family-that-lost-its-provider-2.jpg', 'too-many-doors-no-home-2.jpg', 'a-safe-place-to-sleep-2.jpg', 'somewhere-to-call-home-2.jpg',
    'the-boy-who-rewrote-his-story-2.jpg'
  ];
  const UPLOADS = '/storage/v1/object/public/ch-media/';      // photos added on the admin page
  Object.assign(WORDS.en, {
    kidShort: 'Edited for privacy', kidWide: 'Photo edited to protect the children’s identity', kidTip: 'This photo has been edited to protect the children’s identity.',
    aiShort: 'AI illustration', aiWide: 'AI illustration · no real child is shown', aiTip: 'This picture was made with AI for illustration. No real child is shown.',
    kidNote: 'All photos of children on this website have been edited to protect their identity.'
  });
  Object.assign(WORDS.zh, {
    kidShort: '已处理 · 保护隐私', kidWide: '照片已处理，以保护孩子的身份', kidTip: '此照片已经过处理，以保护孩子的身份。',
    aiShort: 'AI 示意图', aiWide: 'AI 示意图 · 并非真实孩子', aiTip: '此图片由 AI 制作，仅作示意，并非真实的孩子。',
    kidNote: '本网站所有孩子的照片均已经过处理，以保护他们的身份。'
  });
  const fileName = url => decodeURIComponent(String(url || '').split(/[?#]/)[0].split('/').pop()).toLowerCase();
  function kindOf(url, el) {
    const mark = el && el.closest('[data-kids]');
    if (mark) return mark.dataset.kids === 'ai' ? 'ai' : 'photo';
    if (!url) return null;
    if (url.includes(UPLOADS)) return 'photo';
    const f = fileName(url);
    return KID_AI.includes(f) ? 'ai' : KID_PHOTOS.includes(f) ? 'photo' : null;
  }
  const bgUrl = el => { const m = (el.style.backgroundImage || '').match(/url\(["']?(.*?)["']?\)/); return el.dataset.bg || (m && m[1]) || ''; };
  const isOut = el => ['absolute', 'fixed'].includes(getComputedStyle(el).position);
  function hostFor(el) {                                    // the box the label sits in
    if (el.closest('header, footer, .kid-tag')) return null;
    if (el.classList.contains('gal-bg')) return null;       // blurred copy behind a gallery photo: the photo itself is labelled
    if (el.classList.contains('page-hero-bg')) return el.parentElement;
    if (el.classList.contains('hero-slide')) return el.closest('.hero');
    if (el.tagName.toLowerCase() === 'image') { const svg = el.closest('svg'); return svg && svg.parentElement; }
    if (el.tagName !== 'IMG') return el;                    // a background picture
    if (isOut(el)) return el.offsetParent || el.parentElement;
    const p = el.parentElement;
    const shares = [...p.children].some(c => c !== el && !c.classList.contains('kid-tag') && !isOut(c) && getComputedStyle(c).display !== 'none');
    if (!shares) return p;
    const box = document.createElement('span');             // the photo shares its box with text: give it a box of its own
    box.className = 'kid-wrap'; p.insertBefore(box, el); box.appendChild(el);
    return box;
  }
  const hosts = new Set(), tagOf = new WeakMap();          // picture → its label
  const fit = new ResizeObserver(es => es.forEach(e => sizeTag(e.target)));
  function sizeTag(host) {
    const w = host.getBoundingClientRect().width;
    host.querySelectorAll(':scope > .kid-tag').forEach(t => {
      t.classList.toggle('kid-tag--tiny', w < 170);
      t.classList.toggle('kid-tag--wide', w >= 560);
      writeTag(t);
    });
  }
  function writeTag(t) {
    const ai = t.dataset.kind === 'ai', wide = t.classList.contains('kid-tag--wide'), tip = w(ai ? 'aiTip' : 'kidTip');
    t.querySelector('b').textContent = w(ai ? (wide ? 'aiWide' : 'aiShort') : (wide ? 'kidWide' : 'kidShort'));
    t.querySelector('em').textContent = tip;               // shown when you point at the label
    t.setAttribute('aria-label', tip);
    if (t.classList.contains('kid-tag--tiny')) t.title = tip; else t.removeAttribute('title');   // tiny thumbnails: the browser's own tip
  }
  function label(el, kind) {
    const host = hostFor(el);
    if (!host) return;
    let tag = host.querySelector(':scope > .kid-tag');
    if (!tag) {
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      tag = document.createElement('span');
      tag.className = 'kid-tag'; tag.setAttribute('role', 'note');
      tag.innerHTML = '<i class="fa" aria-hidden="true"></i><b></b><em></em>';
      host.appendChild(tag);
      hosts.add(host); fit.observe(host);
    }
    if (el.classList.contains('hero-slide')) { tag.kinds = tag.kinds || new Map(); tag.kinds.set(el, kind); heroSync(host); return; }
    tagOf.set(el, tag);
    tag.dataset.kind = kind;
    tag.querySelector('i').className = 'fa ' + (kind === 'ai' ? 'fa-wand-magic-sparkles' : 'fa-shield-halved');
    sizeTag(host);
  }
  function heroSync(hero) {                                 // Home banner: the label follows the picture on show
    const tag = hero.querySelector(':scope > .kid-tag');
    if (!tag || !tag.kinds) return;
    const on = hero.querySelector('.hero-slide.active') || hero.querySelector('.hero-slide');
    const kind = tag.kinds.get(on);
    tag.hidden = !kind;
    if (kind && tag.dataset.kind !== kind) { tag.dataset.kind = kind; tag.querySelector('i').className = 'fa ' + (kind === 'ai' ? 'fa-wand-magic-sparkles' : 'fa-shield-halved'); writeTag(tag); }
  }
  const seen = new WeakMap();                               // picture → the file it showed when last checked
  function scan(root) {
    (root.querySelectorAll ? root : document).querySelectorAll('img, image, [data-bg], [style*="background-image"]').forEach(el => {
      const url = el.tagName === 'IMG' ? el.getAttribute('src') : el.tagName.toLowerCase() === 'image' ? (el.getAttribute('href') || el.getAttribute('xlink:href')) : bgUrl(el);
      if (seen.get(el) === url) return;
      seen.set(el, url);
      const kind = kindOf(url, el);
      if (kind) label(el, kind);
      else if (tagOf.has(el)) { tagOf.get(el).remove(); tagOf.delete(el); }   // a reused frame (photo viewer) now shows another picture
    });
  }
  scan(document);
  document.querySelectorAll('.hero').forEach(hero => new MutationObserver(() => heroSync(hero))
    .observe(hero, { subtree: true, attributes: true, attributeFilter: ['class'] }));
  /* pictures added later (pop-ups, the photo viewer, photos from the admin page) */
  let scanRaf = 0;
  new MutationObserver(ms => {
    const fresh = ms.some(m => m.type === 'childList'
      ? [...m.addedNodes].some(n => n.nodeType === 1 && !n.classList.contains('kid-tag') && !n.classList.contains('kid-wrap'))
      : m.attributeName !== 'style' || !!m.target.style.backgroundImage);   // ignore style changes that aren't pictures
    if (fresh && !scanRaf) scanRaf = requestAnimationFrame(() => { scanRaf = 0; scan(document); });
  }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['src', 'href', 'style', 'data-bg'] });
  /* one line in the footer for the whole site */
  document.querySelectorAll('.foot-bot .disclaimer').forEach(d => {
    const p = document.createElement('p');
    p.className = 'disclaimer kid-note';
    p.innerHTML = '<i class="fa fa-shield-halved" aria-hidden="true"></i> <span></span>';
    d.after(p);
  });
  const relabelKids = () => {
    document.querySelectorAll('.kid-tag[data-kind]').forEach(writeTag);
    document.querySelectorAll('.kid-note span').forEach(s => { s.textContent = w('kidNote'); });
  };
  relabelKids();
  new MutationObserver(relabelKids).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  /* ── Header: pass the logo's height to the CSS so "Children Home" lines up with the logo's lettering ── */
  const logoImg = document.querySelector('#hdr .brand img'), brandBox = document.querySelector('#hdr .brand');
  if (logoImg && brandBox) {
    const setLogoH = () => brandBox.style.setProperty('--logo-h', logoImg.getBoundingClientRect().height + 'px');
    new ResizeObserver(setLogoH).observe(logoImg);
    setLogoH();
  }

  relabel(); spy();
  new MutationObserver(relabel).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  if (window.fitBrandTag) window.fitBrandTag();             // the menu got a little wider: re-check it still fits
})();