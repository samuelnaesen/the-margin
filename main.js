// The Margin — prototype logic: page turning, candle light, grid overlay, lock.
(() => {
  const spreads = [...document.querySelectorAll('.spread')];
  const pages = spreads.flatMap((s, si) => [...s.querySelectorAll('.page')].map(p => ({ el: p, si })));
  const phone = matchMedia('(max-width: 760px)');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const pos = document.getElementById('pos');
  let current = 0; // index into pages

  function render() {
    const { si } = pages[current];
    spreads.forEach((s, i) => s.classList.toggle('active', i === si));
    pages.forEach((p, i) => p.el.classList.toggle('current', i === current));
    if (phone.matches) {
      pos.textContent = `${current + 1} / ${pages.length}`;
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === pages.length - 1;
    } else {
      pos.textContent = si === 0 ? 'Cover' : `Spread ${si} of ${spreads.length - 1}`;
      prevBtn.disabled = si === 0;
      nextBtn.disabled = si === spreads.length - 1;
    }
  }

  function step(dir) {
    if (phone.matches) {
      current = Math.max(0, Math.min(pages.length - 1, current + dir));
    } else {
      const si = Math.max(0, Math.min(spreads.length - 1, pages[current].si + dir));
      current = pages.findIndex(p => p.si === si);
    }
    render();
  }

  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));
  phone.addEventListener('change', render);
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'g' || e.key === 'G') document.body.classList.toggle('show-grid');
  });

  // swipe
  let sx = null;
  document.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 60 && !e.target.closest('.candle, input')) step(dx < 0 ? 1 : -1);
    sx = null;
  });

  // test hook: go to a page index
  window.__goto = i => { current = i; render(); };
  window.__pageCount = pages.length;

  // ---- Candle: move a light over the page; hidden ink shows under it ----
  document.querySelectorAll('.candle').forEach(page => {
    const inks = page.querySelectorAll('.ink-hidden');
    const move = e => {
      const r = page.getBoundingClientRect();
      page.style.setProperty('--lx', `${e.clientX - r.left}px`);
      page.style.setProperty('--ly', `${e.clientY - r.top}px`);
      inks.forEach(ink => {
        const ir = ink.getBoundingClientRect();
        ink.style.setProperty('--mx', `${e.clientX - ir.left}px`);
        ink.style.setProperty('--my', `${e.clientY - ir.top}px`);
      });
    };
    page.addEventListener('pointermove', move);
    page.addEventListener('pointerdown', move);
    page.addEventListener('pointerleave', () => {
      page.style.removeProperty('--lx'); page.style.removeProperty('--ly');
      inks.forEach(ink => { ink.style.removeProperty('--mx'); ink.style.removeProperty('--my'); });
    });
  });

  // ---- Grid overlay: the Van de Graaf construction, drawn per page ----
  const NS = 'http://www.w3.org/2000/svg';
  pages.forEach(({ el }) => {
    const recto = el.classList.contains('recto');
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'grid-overlay');
    svg.setAttribute('viewBox', '0 0 600 900');
    svg.setAttribute('preserveAspectRatio', 'none');
    const add = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); svg.appendChild(n); };
    for (let i = 1; i < 9; i++) {
      add('line', { x1: i * 600 / 9, y1: 0, x2: i * 600 / 9, y2: 900, class: 'ninth' });
      add('line', { x1: 0, y1: i * 100, x2: 600, y2: i * 100, class: 'ninth' });
    }
    // inner edge is x=600 on a verso, x=0 on a recto
    const inner = recto ? 0 : 600, outer = recto ? 600 : 0;
    add('line', { x1: inner, y1: 0, x2: outer, y2: 900, class: 'diag' });     // page diagonal
    add('line', { x1: outer, y1: 0, x2: inner, y2: 450, class: 'diag' });     // half of the spread diagonal
    add('line', { x1: outer, y1: 900, x2: inner, y2: 450, class: 'diag' });   // the other spread diagonal
    const x = recto ? 600 / 9 : 1200 / 9;
    add('rect', { x, y: 100, width: 400, height: 600 });                     // text block
    el.appendChild(svg);
  });

  // ---- Lock ----
  const lock = document.getElementById('lock');
  const boxes = [...lock.querySelectorAll('input')];
  const msg = document.getElementById('lock-msg');
  const ending = document.getElementById('ending');
  boxes.forEach((b, i) => {
    b.addEventListener('input', () => {
      b.value = b.value.replace(/[^a-z]/gi, '').slice(-1).toUpperCase();
      if (b.value && i < boxes.length - 1) boxes[i + 1].focus();
      check();
    });
    b.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !b.value && i > 0) boxes[i - 1].focus();
    });
  });
  lock.addEventListener('submit', e => { e.preventDefault(); check(); });

  function check() {
    const word = boxes.map(b => b.value).join('');
    if (word.length < 4) { msg.textContent = ''; return; }
    if (word === 'BOTH') {
      lock.hidden = true;
      ending.hidden = false;
    } else {
      msg.textContent = '[NO RESULTS WERE FOUND]';
      lock.classList.remove('shake'); void lock.offsetWidth; lock.classList.add('shake');
    }
  }

  render();
})();
