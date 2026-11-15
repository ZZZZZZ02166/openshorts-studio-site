// OpenShorts Studio site: entrances, the hero drift, and the two working interface fragments.
// Everything is readable without this file; it only adds motion and the sample interactions.
(() => {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Entrances: reveal once as each part enters the viewport. Never leaves content hidden.
  const targets = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) targets.forEach((el) => el.classList.add('is-in'));
  else {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    targets.forEach((el) => io.observe(el));
    window.addEventListener('load', () => setTimeout(() => {
      targets.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
      });
    }, 2500));
  }

  // The hero's publishing review drifts up a little as the page scrolls.
  const drift = document.querySelector('[data-drift]');
  if (drift && !still) {
    let queued = false;
    const move = () => {
      queued = false;
      const y = Math.min(window.scrollY, window.innerHeight);
      drift.style.transform = `translate3d(0, ${(-y * 0.12).toFixed(1)}px, 0)`;
    };
    window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(move); } }, { passive: true });
  }

  // Margin notes light the part of the panel they describe, and the other way round.
  const notes = document.querySelectorAll('[data-note]');
  const part = (name) => document.querySelector(`[data-part="${name}"]`);
  notes.forEach((note) => {
    const target = part(note.dataset.note);
    if (!target) return;
    const on = () => { target.classList.add('is-lit'); note.classList.add('is-active'); };
    const off = () => { target.classList.remove('is-lit'); note.classList.remove('is-active'); };
    note.addEventListener('mouseenter', on); note.addEventListener('mouseleave', off);
    note.addEventListener('focus', on); note.addEventListener('blur', off);
    note.addEventListener('click', () => { target.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' }); on(); });
    target.addEventListener('mouseenter', on); target.addEventListener('mouseleave', off);
  });

  // Place each note level with its control, pushed down so notes never overlap.
  // offsetTop ignores the entrance transforms, so the layout is right mid-animation too.
  const wrap = document.querySelector('.panel-wrap');
  const layoutNotes = () => {
    if (!wrap) return;
    const stacked = window.innerWidth <= 900;
    let deepest = 0;
    wrap.querySelectorAll('.notes').forEach((column) => {
      let floor = 0;
      column.querySelectorAll('.note').forEach((note) => {
        const target = part(note.dataset.note);
        note.hidden = !target || target.hidden;
        if (stacked) { note.style.top = ''; return; }
        if (note.hidden) return;
        const top = Math.max(target.offsetTop - 4, floor);
        note.style.top = `${top}px`;
        floor = top + note.offsetHeight + 22;
      });
      deepest = Math.max(deepest, floor);
    });
    wrap.style.minHeight = stacked ? '' : `${deepest}px`;
  };
  layoutNotes();
  window.addEventListener('resize', layoutNotes);
  window.addEventListener('load', layoutNotes);
  if (document.fonts) document.fonts.ready.then(layoutNotes);

  // The TikTok review, behaving as Studio's does. Sample only: nothing is sent anywhere.
  const form = document.getElementById('tt-demo');
  if (form) {
    const $ = (id) => document.getElementById(id);
    const mode = $('tt-mode'), privacy = $('tt-privacy'), result = $('tt-result');
    const disclose = $('tt-disclose'), brand = $('tt-brand'), branded = $('tt-branded'), approve = $('tt-approve');
    const MISSING = 'You need to indicate if your content promotes yourself, a third party, or both.';
    const PRIVATE = 'Branded content visibility cannot be set to private.';
    const selfOnly = privacy.querySelector('option[value="SELF_ONLY"]');
    const say = (text, kind) => { result.textContent = text; result.className = kind === 'ok' ? 'ui-ok' : 'ui-error'; };
    const sync = () => {
      const direct = mode.value === 'direct';
      form.querySelectorAll('[data-direct]').forEach((el) => {
        el.hidden = !direct;
        el.querySelectorAll('input[type=checkbox][required], select').forEach((c) => { c.required = direct; });
      });
      $('tt-music').querySelector('input').required = direct;
      privacy.required = direct;
      $('tt-draft').hidden = direct;
      // TikTok's disclosure rules: off by default; one kind required when on; branded content is never private.
      if (!disclose.checked) { brand.checked = false; branded.checked = false; }
      $('tt-kinds').hidden = !disclose.checked;
      const privateChosen = privacy.value === 'SELF_ONLY';
      branded.disabled = privateChosen;
      branded.closest('label').title = privateChosen ? PRIVATE : '';
      $('tt-private-note').hidden = !privateChosen;
      selfOnly.disabled = branded.checked;
      selfOnly.title = branded.checked ? PRIVATE : '';
      selfOnly.textContent = branded.checked ? 'self only · not available for branded content' : 'self only';
      const label = $('tt-label');
      label.textContent = branded.checked ? 'Your video will be labeled as ‘Paid partnership’.'
        : brand.checked ? 'Your video will be labeled as ‘Promotional content’.' : MISSING;
      label.className = branded.checked || brand.checked ? 'ui-muted' : 'ui-error';
      const missing = direct && disclose.checked && !brand.checked && !branded.checked;
      approve.disabled = missing;
      approve.title = missing ? MISSING : '';
      $('tt-bc').hidden = !branded.checked;
      result.textContent = '';
    };
    form.addEventListener('change', () => { sync(); layoutNotes(); });
    sync();
    layoutNotes();
    $('tt-refresh').addEventListener('click', () => {
      const who = $('tt-who');
      who.textContent = 'Checking the connected account…';
      setTimeout(() => { who.textContent = 'Posting as Sample Creator'; }, 600);
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        const first = form.querySelector(':invalid');
        say(first === privacy ? 'Choose a visibility before approving.' : 'Tick each confirmation before approving.');
        first.focus();
        return;
      }
      if (mode.value === 'direct' && branded.checked && privacy.value === 'SELF_ONLY') {
        say('Branded TikTok content cannot be private.');
        return;
      }
      say('Approval saved. Delivery results will appear for each destination.'
        + (mode.value === 'direct' ? ' Once TikTok receives the video, it may take a few minutes to process before it is visible on the profile.' : '')
        + ' (Sample: nothing was sent.)', 'ok');
    });
  }

  // The middle publishing row: Check result moves it to its finished state.
  const check = document.getElementById('row-check');
  if (check) {
    check.addEventListener('click', () => {
      const row = document.getElementById('row-live');
      const swap = (name) => row.querySelector(`[data-swap="${name}"]`);
      check.disabled = true;
      check.textContent = 'Checking…';
      setTimeout(() => {
        const status = swap('status');
        status.textContent = 'Published';
        status.className = 'ui-status is-done';
        swap('msg').textContent = 'TikTok confirmed publication.';
        swap('actions').innerHTML = '<span class="ui-btn">Open published post ↗</span>';
        row.setAttribute('aria-label', 'TikTok destination, published');
      }, 700);
    });
  }

  // Document pages: mark the section being read in the contents list.
  const links = [...document.querySelectorAll('.doc-aside a[href^="#"]')];
  if (links.length && 'IntersectionObserver' in window) {
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const seen = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((a) => a.classList.remove('is-current'));
        byId.get(entry.target.id)?.classList.add('is-current');
      }
    }, { rootMargin: '0px 0px -70% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) seen.observe(s); });
  }
})();
