/*!
 * Bishnupur Public Institute of Engineering – B.Tech
 * Site behaviour. Plain JavaScript, no dependencies.
 *
 * 1. Desktop dropdown menus
 * 2. Menu drawer (below 1200 px)
 * 3. Dismissible announcement bar
 * 4. Filters and search (notices, gallery)
 * 5. Forms: validation and submission
 * 6. Footer year
 */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const PHONE = '+91 94341 01473';
  const EMAIL = 'bpeibsp15@gmail.com';

  /* ---------- 1. Desktop dropdown menus ---------- */
  const navItems = $$('.nav-item');

  const setMenu = (item, open) => {
    item.classList.toggle('open', open);
    const btn = $('.nav-link', item);
    if (btn) btn.setAttribute('aria-expanded', String(open));
  };
  const closeMenus = (except) => navItems.forEach((item) => { if (item !== except) setMenu(item, false); });

  navItems.forEach((item) => {
    const btn = $('.nav-link', item);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('open');
      closeMenus(item);
      setMenu(item, open);
    });
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget)) setMenu(item, false);
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) closeMenus();
  });

  /* ---------- 2. Menu drawer (below 1200 px) ---------- */
  const menuBtn = $('.menu-btn');
  const drawer = $('#drawer');
  const drawerIsOpen = () => !!menuBtn && menuBtn.getAttribute('aria-expanded') === 'true';

  const setDrawer = (open) => {
    if (!menuBtn || !drawer) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.hidden = !open;
    document.body.classList.toggle('nav-open', open);
  };

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => setDrawer(!drawerIsOpen()));

    $$('.item[aria-controls]', drawer).forEach((btn) => {
      btn.addEventListener('click', () => {
        const sub = document.getElementById(btn.getAttribute('aria-controls'));
        const open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(open));
        if (sub) sub.hidden = !open;
      });
    });

    // Following a link (including same-page anchors) closes the drawer.
    $$('a', drawer).forEach((a) => a.addEventListener('click', () => setDrawer(false)));

    const wide = window.matchMedia('(min-width: 1200px)');
    const onWide = (e) => { if (e.matches) setDrawer(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
    else wide.addListener(onWide);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openItem = navItems.find((item) => item.classList.contains('open'));
    if (openItem) {
      setMenu(openItem, false);
      $('.nav-link', openItem).focus();
    }
    if (drawerIsOpen()) {
      setDrawer(false);
      menuBtn.focus();
    }
  });

  /* ---------- 3. Dismissible announcement bar ---------- */
  // Each announcement has a data-id; change it when the announcement changes
  // so people who dismissed the old one see the new one.
  $$('.annc').forEach((bar) => {
    const key = 'bpie-dismissed:' + (bar.dataset.id || 'announcement');
    try {
      if (localStorage.getItem(key) === '1') bar.hidden = true;
    } catch (err) { /* storage unavailable: keep showing it */ }

    const close = $('.annc-x', bar);
    if (close) {
      close.addEventListener('click', () => {
        bar.hidden = true;
        try { localStorage.setItem(key, '1'); } catch (err) { /* ignore */ }
      });
    }
  });

  /* ---------- 4. Filters and search (notices, gallery) ---------- */
  // Markup contract:
  //   [data-filter-group="name"]   wrapper of chip buttons, each with data-filter="all" or a category
  //   [data-filter-target="name"]  container whose children carry data-cat="category"
  //   [data-filter-search="name"]  optional search input (matches the item's text)
  //   [data-filter-empty="name"]   optional message shown when nothing matches
  //   [data-filter-count="name"]   optional "Showing x of y" line (data-noun sets the word)
  $$('[data-filter-group]').forEach((group) => {
    const name = group.dataset.filterGroup;
    const target = $('[data-filter-target="' + name + '"]');
    if (!target) return;

    const items = $$('[data-cat]', target);
    const chips = $$('[data-filter]', group);
    const search = $('[data-filter-search="' + name + '"]');
    const empty = $('[data-filter-empty="' + name + '"]');
    const count = $('[data-filter-count="' + name + '"]');
    let active = 'all';

    const apply = () => {
      const q = search ? search.value.trim().toLowerCase() : '';
      let shown = 0;
      items.forEach((item) => {
        const show = (active === 'all' || item.dataset.cat === active) &&
                     (!q || item.textContent.toLowerCase().includes(q));
        item.classList.toggle('is-hidden', !show);
        if (show) shown += 1;
      });
      if (empty) empty.hidden = shown > 0;
      if (count) {
        count.textContent = 'Showing ' + shown + ' of ' + items.length + ' ' + (count.dataset.noun || 'items') + '.';
      }
    };

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        active = chip.dataset.filter;
        chips.forEach((c) => {
          const on = c === chip;
          c.classList.toggle('on', on);
          c.setAttribute('aria-pressed', String(on));
        });
        apply();
      });
    });

    if (search) search.addEventListener('input', apply);
  });

  /* ---------- 5. Forms: validation and submission ---------- */
  // Forms post to the URL in data-endpoint (FormData, expects a 2xx reply).
  // While data-endpoint is empty, a valid submission shows how to call or email instead.
  const phoneDigits = (value) => {
    let d = value.replace(/\D/g, '');
    if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
    if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
    return d;
  };
  const isPhone = (value) => /^[6-9]\d{9}$/.test(phoneDigits(value));
  const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

  const problemWith = (field) => {
    const value = field.value.trim();
    if (field.required && !value) return 'Enter ' + (field.dataset.label || 'this field') + '.';
    if (!value) return '';
    if (field.dataset.kind === 'phone-or-email') {
      return isPhone(value) || isEmail(value) ? '' : 'Enter a 10-digit mobile number or an email address.';
    }
    if (field.type === 'email' && !isEmail(value)) return 'Enter an email address in the format name@example.com.';
    if (field.type === 'tel' && !isPhone(value)) return 'Enter a 10-digit mobile number.';
    return '';
  };

  const markField = (field, message) => {
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    field.classList.toggle('is-invalid', !!message);

    const wrap = field.closest('.fld');
    if (!wrap) return; // compact forms report errors in their status line
    wrap.classList.toggle('invalid', !!message);
    let err = $('.err', wrap);
    if (message) {
      if (!err) {
        err = document.createElement('p');
        err.className = 'err';
        err.id = field.id + '-error';
        wrap.appendChild(err);
      }
      err.textContent = message;
      field.setAttribute('aria-describedby', err.id);
    } else if (err) {
      err.remove();
      field.removeAttribute('aria-describedby');
    }
  };

  $$('form[data-form]').forEach((form) => {
    const status = $('.form-status', form);
    const fields = $$('input, select, textarea', form).filter((f) => f.type !== 'hidden');
    const say = (message, kind) => {
      if (!status) return;
      status.textContent = message;
      status.className = 'form-status' + (kind ? ' ' + kind : '');
    };

    fields.forEach((field) => {
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') markField(field, problemWith(field));
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let first = null;
      let firstMessage = '';
      fields.forEach((field) => {
        const message = problemWith(field);
        markField(field, message);
        if (message && !first) { first = field; firstMessage = message; }
      });
      if (first) {
        if (first.closest('.fld')) say('', '');
        else say(firstMessage, 'err');
        first.focus();
        return;
      }

      const endpoint = (form.dataset.endpoint || '').trim();
      if (!endpoint) {
        say('Online enquiries aren’t available yet. Please call ' + PHONE + ' or email ' + EMAIL + '.', 'warn');
        return;
      }

      const submit = $('[type="submit"]', form);
      if (submit) submit.disabled = true;
      say('Sending…', '');
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        say(form.dataset.success || 'Thank you. Your message has been sent.', 'ok');
      } catch (err) {
        say('Your message could not be sent. Please try again, or call ' + PHONE + '.', 'err');
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  });

  /* ---------- 6. Footer year ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ---------- 7. Lightbox — click any photo to view full-screen ---------- */
(() => {
  'use strict';

  // Every photo slot in the site uses <figure class="ph"> — grab those images only.
  const photos = Array.from(document.querySelectorAll('figure.ph img'))
    .filter((img) => {
      const src = img.getAttribute('src') || '';
      return src && !img.dataset.lbSkip;
    });
  if (!photos.length) return;

  /* ---- Build lightbox DOM once ---- */
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.hidden = true;
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Photo viewer');
  lb.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Close viewer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>
    <button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous photo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <button class="lightbox-nav lightbox-next" type="button" aria-label="Next photo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
    <figure class="lightbox-figure">
      <img class="lightbox-img" alt="">
      <figcaption class="lightbox-caption"></figcaption>
    </figure>
    <div class="lightbox-counter"><span class="lightbox-current">1</span> / <span class="lightbox-total">1</span></div>`;
  document.body.appendChild(lb);

  const lbImg = lb.querySelector('.lightbox-img');
  const lbCap = lb.querySelector('.lightbox-caption');
  const lbCur = lb.querySelector('.lightbox-current');
  const lbTot = lb.querySelector('.lightbox-total');
  const btnClose = lb.querySelector('.lightbox-close');
  const btnPrev = lb.querySelector('.lightbox-prev');
  const btnNext = lb.querySelector('.lightbox-next');

  let index = 0;
  let lastFocus = null;

  const captionOf = (img) => {
    const fig = img.closest('figure');
    if (!fig) return img.alt || '';
    const b = fig.querySelector('figcaption b');
    const s = fig.querySelector('figcaption small');
    const parts = [];
    if (s) parts.push(s.textContent.trim());
    if (b) parts.push(b.textContent.trim());
    return parts.join(' · ') || (img.alt || '');
  };

  const render = (i) => {
    index = (i + photos.length) % photos.length;
    const img = photos[index];
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || '';
    lbCap.textContent = captionOf(img);
    lbCur.textContent = String(index + 1);
    lbTot.textContent = String(photos.length);
  };

  const open = (i, trigger) => {
    lastFocus = trigger || document.activeElement;
    render(i);
    lb.hidden = false;
    document.body.classList.add('lightbox-open');
    // next frame so the transition actually runs
    requestAnimationFrame(() => lb.classList.add('open'));
    btnClose.focus();
  };

  const close = () => {
    lb.classList.remove('open');
    document.body.classList.remove('lightbox-open');
    const done = () => {
      lb.hidden = true;
      lbImg.removeAttribute('src');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) done();
    else setTimeout(done, 220);
  };

  const next = () => render(index + 1);
  const prev = () => render(index - 1);

  /* ---- Wire up each photo ---- */
  photos.forEach((img, i) => {
    const trigger = img.closest('figure.ph') || img;
    trigger.classList.add('lb-trigger');
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('aria-label', 'Open photo full-screen: ' + (img.alt || ''));
    trigger.addEventListener('click', (e) => { e.preventDefault(); open(i, trigger); });
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i, trigger); }
    });
  });

  /* ---- Controls ---- */
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);

  // Click on backdrop closes
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

  // Keyboard: Esc, ←/→, Tab trap
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
    else if (e.key === 'Tab') {
      const focusables = [btnClose, btnPrev, btnNext];
      const idx = focusables.indexOf(document.activeElement);
      if (e.shiftKey && idx <= 0) { e.preventDefault(); focusables[focusables.length - 1].focus(); }
      else if (!e.shiftKey && idx === focusables.length - 1) { e.preventDefault(); focusables[0].focus(); }
    }
  });

  // Touch swipe
  let tx = 0;
  lb.addEventListener('touchstart', (e) => { tx = e.changedTouches[0].screenX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - tx;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
  }, { passive: true });
})();
})();
