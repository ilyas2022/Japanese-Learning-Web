// Nihongo Diario — app principal (router + vistas)
(function () {
  Store.load();
  const S = () => Store.s;
  const view = document.getElementById('view');

  // ---------- utilidades ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (a, n) => shuffle(a).slice(0, n);
  const ITEMS = {};
  [...VOCAB, ...PHRASES].forEach((it) => (ITEMS[it.id] = it));
  const catOf = (id) => PHRASE_CATS.find((c) => c.id === id);

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1800);
  }
  function haptic() { if (navigator.vibrate) navigator.vibrate(15); }

  // Cola de aprendizaje: 4 palabras + 1 frase (rotando categorías)
  function buildQueue() {
    const pattern = S().settings.fun
      ? ['basicas','romantico','diario','manga','basicas','gracioso','diario','ligar','manga','romantico','basicas','insultos','diario','gracioso','manga','romantico','ligar']
      : ['basicas','diario','manga'];
    const pools = {};
    PHRASE_CATS.forEach((c) => (pools[c.id] = PHRASES.filter((p) => p.cat === c.id)));
    const q = []; let vi = 0, pi = 0;
    while (vi < VOCAB.length) {
      for (let k = 0; k < 4 && vi < VOCAB.length; k++) q.push(VOCAB[vi++].id);
      for (let tries = 0; tries < pattern.length; tries++) {
        const pool = pools[pattern[pi++ % pattern.length]];
        if (pool && pool.length) { q.push(pool.shift().id); break; }
      }
    }
    Object.values(pools).forEach((pool) => pool.forEach((p) => q.push(p.id)));
    return q;
  }
  function nextNew(n, exclude = []) {
    return buildQueue().filter((id) => !S().srs[id] && !exclude.includes(id)).slice(0, n);
  }

  function streakNow() {
    const st = S().streak, t = Store.today();
    return st.last === t || st.last === t - 1 ? st.count : 0;
  }

  // ---------- componentes ----------
  function sayBtn(text, cls = '') {
    return `<button class="say ${cls}" data-say="${esc(text)}" aria-label="Escuchar">${ICON.speaker}</button>`;
  }
  function jpBlock(it, size = 'xl') {
    const showKana = it.kana && it.kana !== it.jp;
    return `
      <div class="jp jp-${size}" lang="ja">${esc(it.jp)}</div>
      ${showKana ? `<div class="kana" lang="ja">${esc(it.kana)}</div>` : ''}
      <div class="romaji">${esc(it.romaji)}</div>`;
  }
  function tagChip(it) {
    if (it.type === 'phrase') { const c = catOf(it.cat); return `<span class="chip chip-${it.cat}">${c.icon} ${esc(c.name)}</span>`; }
    return `<span class="chip">${esc(it.tag)}</span>`;
  }
  function fullCard(it) {
    return `
      <article class="card learn-card">
        <div class="card-top">${tagChip(it)}${sayBtn(it.kana || it.jp, 'say-lg')}</div>
        ${jpBlock(it)}
        <div class="meaning">${esc(it.es)}</div>
        ${it.ex ? `
          <div class="example">
            <div class="ex-jp" lang="ja">${esc(it.ex.jp)} ${sayBtn(it.ex.jp, 'say-sm')}</div>
            <div class="romaji">${esc(it.ex.romaji)}</div>
            <div class="ex-es">${esc(it.ex.es)}</div>
          </div>` : ''}
        ${it.note ? `<div class="note">💡 ${esc(it.note)}</div>` : ''}
      </article>`;
  }
  function header(title, sub, right = '') {
    return `<header class="page-head"><div><h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}</div>${right}</header>`;
  }
  function streakPill() {
    const n = streakNow();
    return `<div class="streak ${n ? 'on' : ''}" title="Racha de días">🔥 <b>${n}</b></div>`;
  }

  // ---------- HOY ----------
  let quiz = null;
  function ensureDaily() {
    const t = Store.today();
    const d = S().daily;
    if (!d || d.day !== t) {
      S().daily = { day: t, ids: nextNew(S().settings.perDay), step: 'learn', idx: 0, round: 1 };
      quiz = null; Store.save();
    }
    // limpiar ids que ya estén en repaso (p. ej. añadidos desde Frases)
    const d2 = S().daily;
    if (d2.step !== 'done') {
      const filtered = d2.ids.filter((id) => !S().srs[id] && ITEMS[id]);
      if (filtered.length !== d2.ids.length) { d2.ids = filtered; d2.idx = Math.min(d2.idx, Math.max(0, filtered.length - 1)); Store.save(); }
    }
    return S().daily;
  }

  function renderHoy() {
    const d = ensureDaily();
    const due = SRS.due().length;
    const learned = Object.keys(S().srs).length;
    let body = '';

    if (!d.ids.length && d.step !== 'done') {
      body = `<div class="card center"><div class="big-emoji">🏆</div><h2>¡Has aprendido todo!</h2><p class="muted">Ya no quedan palabras nuevas. Sigue repasando para no olvidarlas.</p><a class="btn primary" href="#/repaso">Ir a repaso</a></div>`;
    } else if (d.step === 'learn') {
      const it = ITEMS[d.ids[d.idx]];
      const last = d.idx === d.ids.length - 1;
      body = `
        ${due && d.idx === 0 && d.round === 1 ? `<a class="banner" href="#/repaso">📚 Tienes <b>${due}</b> repaso${due > 1 ? 's' : ''} pendiente${due > 1 ? 's' : ''}. ¡Mejor hazlos primero! →</a>` : ''}
        <div class="progress-dots">${d.ids.map((_, i) => `<span class="${i < d.idx ? 'done' : i === d.idx ? 'cur' : ''}"></span>`).join('')}</div>
        <p class="step-label">Nueva ${d.idx + 1} de ${d.ids.length}</p>
        ${fullCard(it)}
        <div class="row-btns">
          <button class="btn ghost" data-act="prev" ${d.idx === 0 ? 'disabled' : ''}>← Atrás</button>
          <button class="btn primary" data-act="next">${last ? 'Hacer el test ✓' : 'Siguiente →'}</button>
        </div>`;
    } else if (d.step === 'quiz') {
      body = renderQuiz(d);
    } else {
      const total = d.ids.length;
      body = `
        <div class="card center done-card">
          <div class="big-emoji">🎉</div>
          <h2>¡Reto completado!</h2>
          <p class="muted">${total} nuevas añadidas a tu repaso. Volverán mañana para que no se te olviden.</p>
          <div class="stat-row">
            <div><b>${streakNow()}</b><span>días de racha</span></div>
            <div><b>${learned}</b><span>aprendidas</span></div>
            <div><b>${due}</b><span>por repasar</span></div>
          </div>
        </div>
        <h3 class="section-title">Lo de hoy</h3>
        <div class="mini-list">${d.ids.map((id) => miniRow(ITEMS[id])).join('')}</div>
        <div class="stack-btns">
          ${due ? `<a class="btn primary" href="#/repaso">Repasar (${due})</a>` : ''}
          <button class="btn ${due ? 'ghost' : 'primary'}" data-act="more">+ Aprender ${S().settings.perDay} más</button>
        </div>`;
    }

    view.innerHTML = `
      ${header('今日 <span class="h-es">Hoy</span>', `Reto diario · ${learned} aprendidas`, streakPill())}
      ${safetyBanner(learned)}
      ${body}`;
    on('[data-act="dismiss-install"]', () => { S().settings.hideInstall = true; Store.save(); renderHoy(); });

    on('[data-act="prev"]', () => { d.idx--; Store.save(); renderHoy(); });
    on('[data-act="next"]', () => {
      if (d.idx < d.ids.length - 1) { d.idx++; Store.save(); renderHoy(); }
      else { d.step = 'quiz'; quiz = null; Store.save(); renderHoy(); }
      window.scrollTo({ top: 0 });
    });
    on('[data-act="more"]', () => {
      const ids = nextNew(S().settings.perDay);
      if (!ids.length) { toast('¡No quedan palabras nuevas!'); return; }
      S().daily = { day: Store.today(), ids, step: 'learn', idx: 0, round: (d.round || 1) + 1 };
      quiz = null; Store.save(); renderHoy();
    });
    bindQuiz(d);
  }

  // Avisos para no perder el progreso
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isStandalone = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  function daysSinceBackup() {
    const b = S().settings.lastBackup;
    return b ? Math.floor((Date.now() - b) / 86400000) : null;
  }
  function safetyBanner(learned) {
    if (isIOS && !isStandalone && !S().settings.hideInstall) {
      return `<div class="banner warn-banner">📲 <b>Instálala para no perder tu progreso.</b> En Safari: Compartir (□↑) → <b>Añadir a pantalla de inicio</b> y usa siempre ese icono. Si no, iOS puede borrar los datos tras 7 días sin abrirla.
        <button class="link" data-act="dismiss-install">Ya lo sé</button></div>`;
    }
    const d = daysSinceBackup();
    if (learned >= 15 && (d === null || d >= 14)) {
      return `<a class="banner" href="#/perfil">💾 ${d === null ? 'Aún no has guardado ninguna copia' : `Tu última copia es de hace ${d} días`}. Haz una en Perfil → Copia de seguridad.</a>`;
    }
    return '';
  }

  function miniRow(it) {
    return `<div class="mini-row">${sayBtn(it.kana || it.jp, 'say-sm')}<div class="mini-jp" lang="ja">${esc(it.jp)}<small class="romaji">${esc(it.romaji)}</small></div><div class="mini-es">${esc(it.es)}</div></div>`;
  }

  function makeOptions(it) {
    const pool = (it.type === 'vocab' ? VOCAB : PHRASES).filter((x) => x.id !== it.id && x.es !== it.es);
    return shuffle([it.es, ...sample(pool, 3).map((x) => x.es)]);
  }
  function renderQuiz(d) {
    if (!quiz) quiz = { queue: shuffle(d.ids), answered: null, total: d.ids.length, ok: 0, opts: null };
    const id = quiz.queue[0];
    const it = ITEMS[id];
    if (!quiz.opts) quiz.opts = makeOptions(it);
    const doneCount = quiz.total - new Set(quiz.queue).size;
    return `
      <div class="quiz-progress"><div style="width:${(doneCount / quiz.total) * 100}%"></div></div>
      <p class="step-label">Test · ¿Qué significa?</p>
      <article class="card center quiz-card">
        <div class="card-top end">${sayBtn(it.kana || it.jp, 'say-lg')}</div>
        ${jpBlock(it, 'xl')}
      </article>
      <div class="options">
        ${quiz.opts.map((o, i) => {
          let cls = '';
          if (quiz.answered) { if (o === it.es) cls = 'correct'; else if (o === quiz.answered) cls = 'wrong'; }
          return `<button class="opt ${cls}" data-opt="${i}" ${quiz.answered ? 'disabled' : ''}>${esc(o)}</button>`;
        }).join('')}
      </div>
      ${quiz.answered ? `
        <div class="feedback ${quiz.answered === it.es ? 'ok' : 'ko'}">
          ${quiz.answered === it.es ? '✅ ¡Correcto!' : '❌ Era: <b>' + esc(it.es) + '</b>. Volverá a salir.'}
        </div>
        <button class="btn primary wide" data-act="qnext">Continuar →</button>` : ''}`;
  }
  function bindQuiz(d) {
    if (d.step !== 'quiz' || !quiz) return;
    const it = ITEMS[quiz.queue[0]];
    view.querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', () => {
      quiz.answered = quiz.opts[+b.dataset.opt];
      haptic();
      if (quiz.answered === it.es) { Speech.speak(it.kana || it.jp); }
      renderHoy();
    }));
    on('[data-act="qnext"]', () => {
      const id = quiz.queue.shift();
      if (quiz.answered !== it.es) quiz.queue.push(id);
      quiz.answered = null; quiz.opts = null;
      if (!quiz.queue.length) finishDaily(d);
      renderHoy();
    });
  }
  function finishDaily(d) {
    d.ids.forEach((id) => SRS.addItem(id, 1));
    Store.logDay('learned', d.ids.length);
    const st = S().streak, t = Store.today();
    if (st.last !== t) { st.count = st.last === t - 1 ? st.count + 1 : 1; st.last = t; st.best = Math.max(st.best || 0, st.count); }
    d.step = 'done'; quiz = null;
    Store.save();
    confetti();
  }

  // ---------- REPASO ----------
  let rev = null;
  function renderRepaso() {
    const mode = S().settings.reviewMode || 'jp';
    if (!rev || rev.day !== Store.today()) rev = { day: Store.today(), queue: SRS.due(), shown: false, done: 0 };
    // añadir nuevos vencidos que no estén en la cola
    SRS.due().forEach((id) => { if (!rev.queue.includes(id)) rev.queue.push(id); });
    rev.queue = rev.queue.filter((id) => ITEMS[id] && S().srs[id]);

    const modeSwitch = `
      <div class="seg" role="tablist">
        <button class="${mode === 'jp' ? 'on' : ''}" data-mode="jp">JP → ES</button>
        <button class="${mode === 'es' ? 'on' : ''}" data-mode="es">ES → JP</button>
      </div>`;

    let body;
    if (!rev.queue.length) {
      const cards = Object.entries(S().srs);
      const next = cards.length ? Math.min(...cards.map(([, c]) => c.due)) - Store.today() : null;
      body = `
        <div class="card center">
          <div class="big-emoji">${cards.length ? '✨' : '🌱'}</div>
          <h2>${cards.length ? '¡Todo repasado!' : 'Aún no hay nada que repasar'}</h2>
          <p class="muted">${cards.length
            ? (rev.done ? `Has repasado ${rev.done} tarjeta${rev.done > 1 ? 's' : ''}. ` : '') + `Próximo repaso: ${next <= 0 ? 'hoy' : 'en ' + SRS.label(next)}.`
            : 'Completa el reto de hoy y las palabras aparecerán aquí.'}</p>
          ${cards.length ? '' : '<a class="btn primary" href="#/hoy">Ir al reto de hoy</a>'}
        </div>
        ${cards.length ? myWords() : ''}`;
    } else {
      const id = rev.queue[0];
      const it = ITEMS[id];
      const card = S().srs[id];
      const front = mode === 'jp'
        ? `<div class="card-top">${tagChip(it)}${sayBtn(it.kana || it.jp, 'say-lg')}</div>${jpBlock(it)}`
        : `<div class="card-top">${tagChip(it)}</div><p class="muted small">¿Cómo se dice en japonés?</p><div class="meaning big">${esc(it.es)}</div>`;
      body = `
        <p class="step-label">Quedan <b>${rev.queue.length}</b> · Hechas ${rev.done}</p>
        <article class="card center review-card">
          ${front}
          ${rev.shown ? `<hr class="sep">${mode === 'jp'
            ? `<div class="meaning">${esc(it.es)}</div>`
            : `${jpBlock(it)}<div class="center-say">${sayBtn(it.kana || it.jp, 'say-lg')}</div>`}
            ${it.ex ? `<div class="example left"><div class="ex-jp" lang="ja">${esc(it.ex.jp)}</div><div class="romaji">${esc(it.ex.romaji)}</div><div class="ex-es">${esc(it.ex.es)}</div></div>` : ''}
            ${it.note ? `<div class="note left">💡 ${esc(it.note)}</div>` : ''}` : ''}
        </article>
        ${rev.shown ? `
          <div class="grades">
            ${[['Otra vez', 0, 'g0'], ['Difícil', 1, 'g1'], ['Bien', 2, 'g2'], ['Fácil', 3, 'g3']].map(([l, g, c]) =>
              `<button class="grade ${c}" data-grade="${g}"><b>${l}</b><small>${g === 0 ? '< 1 min' : SRS.label(SRS.preview(card, g).ivl)}</small></button>`).join('')}
          </div>` : `<button class="btn primary wide" data-act="show">Mostrar respuesta</button>`}`;
    }

    view.innerHTML = `${header('復習 <span class="h-es">Repaso</span>', 'Repetición espaciada', modeSwitch)}${body}`;

    view.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
      S().settings.reviewMode = b.dataset.mode; Store.save(); rev.shown = false; renderRepaso();
    }));
    on('[data-act="show"]', () => {
      rev.shown = true; renderRepaso();
      const it = ITEMS[rev.queue[0]]; if (it) Speech.speak(it.kana || it.jp);
    });
    view.querySelectorAll('[data-grade]').forEach((b) => b.addEventListener('click', () => {
      const g = +b.dataset.grade; const id = rev.queue.shift();
      SRS.grade(id, g); haptic();
      if (g === 0) rev.queue.splice(Math.min(3, rev.queue.length), 0, id); // vuelve en un ratito
      else rev.done++;
      rev.shown = false; Store.save(); renderRepaso();
    }));
    bindMyWords();
  }

  let wordsFilter = '';
  function myWords() {
    const entries = Object.entries(S().srs).filter(([id]) => ITEMS[id]);
    const t = Store.today();
    const f = wordsFilter.toLowerCase();
    const list = entries
      .map(([id, c]) => ({ it: ITEMS[id], c }))
      .filter(({ it }) => !f || [it.jp, it.kana, it.romaji, it.es].some((x) => x.toLowerCase().includes(f)))
      .sort((a, b) => a.c.due - b.c.due);
    return `
      <h3 class="section-title">Mis palabras <span class="muted">(${entries.length})</span></h3>
      <input class="search" id="wsearch" type="search" placeholder="Buscar…" value="${esc(wordsFilter)}">
      <div class="mini-list">
        ${list.map(({ it, c }) => `
          <div class="mini-row">${sayBtn(it.kana || it.jp, 'say-sm')}
            <div class="mini-jp" lang="ja">${esc(it.jp)}<small class="romaji">${esc(it.romaji)}</small></div>
            <div class="mini-es">${esc(it.es)}<small class="lvl lvl-${SRS.level(c)}">${SRS.level(c)} · ${c.due - t <= 0 ? 'hoy' : SRS.label(c.due - t)}</small></div>
          </div>`).join('')}
      </div>`;
  }
  function bindMyWords() {
    const s = view.querySelector('#wsearch');
    if (!s) return;
    s.addEventListener('input', () => {
      wordsFilter = s.value;
      const pos = s.selectionStart;
      renderRepaso();
      const s2 = view.querySelector('#wsearch'); s2.focus(); s2.setSelectionRange(pos, pos);
    });
  }

  // ---------- KANA ----------
  const kanaUI = { script: 'h', tab: 'tabla', mode: 'k2r', q: null, sel: null, score: { ok: 0, n: 0 }, detail: null };
  function kanaStat(key) { return S().kana[key] || { c: 0, w: 0, s: 0 }; }
  function kanaClass(key) {
    const k = S().kana[key]; if (!k) return '';
    return k.s >= 3 ? 'm-done' : k.c + k.w > 0 ? 'm-learn' : '';
  }
  function selectedRows() {
    S().kanaSel = S().kanaSel || { h: ['a'], k: ['a'] };
    return S().kanaSel[kanaUI.script];
  }

  function renderKana() {
    const sc = kanaUI.script;
    const all = allKana(sc);
    const mastered = all.filter((k) => kanaStat(k.key).s >= 3).length;
    const tabs = `
      <div class="seg wide">
        <button class="${sc === 'h' ? 'on' : ''}" data-script="h">ひらがな Hiragana</button>
        <button class="${sc === 'k' ? 'on' : ''}" data-script="k">カタカナ Katakana</button>
      </div>
      <div class="tabs">
        ${[['tabla', 'Tabla'], ['practica', 'Practicar'], ['leer', 'Leer palabras']].map(([id, l]) =>
          `<button class="${kanaUI.tab === id ? 'on' : ''}" data-ktab="${id}">${l}</button>`).join('')}
      </div>`;
    let body = '';
    if (kanaUI.tab === 'tabla') body = kanaTable(sc);
    else if (kanaUI.tab === 'practica') body = kanaPractice(sc);
    else body = kanaRead(sc);

    view.innerHTML = `
      ${header('かな <span class="h-es">Kana</span>', `${mastered}/${all.length} dominados`, `<div class="ring" style="--p:${(mastered / all.length) * 100}"><span>${Math.round((mastered / all.length) * 100)}%</span></div>`)}
      ${tabs}${body}`;

    view.querySelectorAll('[data-script]').forEach((b) => b.addEventListener('click', () => { kanaUI.script = b.dataset.script; kanaUI.q = null; kanaUI.detail = null; renderKana(); }));
    view.querySelectorAll('[data-ktab]').forEach((b) => b.addEventListener('click', () => { kanaUI.tab = b.dataset.ktab; kanaUI.q = null; renderKana(); }));
    bindKana();
  }

  function kanaTable(sc) {
    const mn = KANA_MNEMO[sc];
    const cell = (h, r) => {
      if (!r || h === '・') return '<div class="kcell empty"></div>';
      const ch = sc === 'k' ? toKatakana(h) : h;
      return `<button class="kcell ${kanaClass(sc + ':' + ch)}" data-kc="${esc(ch)}" data-kr="${r}"><span lang="ja">${ch}</span><small>${r}</small></button>`;
    };
    const rows = (list) => list.map((row) => {
      const chars = Array.isArray(row.kana) ? row.kana : [...row.kana];
      return `<div class="krow ${row.combo ? 'combo' : ''}">${chars.map((h, i) => cell(h, row.r[i])).join('')}</div>`;
    }).join('');
    const det = kanaUI.detail;
    return `
      ${!Object.keys(S().kana).length ? `
        <div class="tip">
          <b>👋 ¿Por dónde empiezo?</b><br>
          1. Empieza por <b>hiragana</b> (se usa en todo). 2. Aprende <b>fila a fila</b>: toca cada letra, escucha y lee el truco. 3. Ve a <b>Practicar</b> con esa fila. 4. Cuando la domines, añade la siguiente.<br>
          Con 10-15 min al día lo tienes en 2 semanas. Después, katakana (palabras extranjeras como コーヒー = café).
        </div>` : ''}
      ${det ? `
        <div class="card kdetail">
          <div class="kd-char" lang="ja">${esc(det.ch)}</div>
          <div class="kd-info">
            <div class="kd-r">${esc(det.r)} ${sayBtn(det.ch, 'say-sm')}</div>
            <p>${esc(mn[det.ch] || (det.ch.length > 1 ? 'Combinación: la pequeña ゃ/ゅ/ょ se pega a la anterior → un solo sonido.' : 'Igual que su versión sin comillas, pero con sonido "sonoro" (゛) o "p" (゜).'))}</p>
            ${kanaStat(sc + ':' + det.ch).c + kanaStat(sc + ':' + det.ch).w ? `<small class="muted">✓ ${kanaStat(sc + ':' + det.ch).c} · ✗ ${kanaStat(sc + ':' + det.ch).w}</small>` : ''}
          </div>
        </div>` : '<p class="muted small center">Toca una letra para oírla y ver el truco para recordarla.</p>'}
      <div class="kgrid">
        <div class="kgrid-label">Básicos</div>${rows(KANA_ROWS.filter((r) => !r.extra))}
        <div class="kgrid-label">Con ゛ y ゜ (dakuten)</div>${rows(KANA_ROWS.filter((r) => r.extra))}
        <div class="kgrid-label">Combinaciones (きゃ, しゅ…)</div>${rows(KANA_COMBOS)}
      </div>
      <div class="legend"><span class="m-learn"></span> practicando <span class="m-done"></span> dominado (3 aciertos seguidos)</div>`;
  }

  function rowMastery(sc, rowId) {
    const ks = allKana(sc).filter((k) => k.row === rowId);
    return ks.length ? ks.filter((k) => kanaStat(k.key).s >= 3).length / ks.length : 0;
  }
  function kanaPractice(sc) {
    const sel = selectedRows();
    const allRows = [...KANA_ROWS, ...KANA_COMBOS];
    const pool = allKana(sc).filter((k) => sel.includes(k.row));
    if (!kanaUI.q && pool.length) kanaUI.q = newKanaQ(pool, sc);
    const q = kanaUI.q;
    const chips = allRows.map((row) => {
      const label = sc === 'k' ? toKatakana(Array.isArray(row.kana) ? row.kana[0] : row.kana[0]) : (Array.isArray(row.kana) ? row.kana[0] : row.kana[0]);
      const p = rowMastery(sc, row.id);
      return `<button class="rchip ${sel.includes(row.id) ? 'on' : ''} ${p === 1 ? 'full' : ''}" data-row="${row.id}" style="--p:${p * 100}%"><span lang="ja">${label}</span></button>`;
    }).join('');
    return `
      <p class="muted small">Elige las filas que quieres practicar:</p>
      <div class="rchips">${chips}</div>
      <div class="seg small-seg">
        <button class="${kanaUI.mode === 'k2r' ? 'on' : ''}" data-kmode="k2r">${sc === 'h' ? 'あ' : 'ア'} → a</button>
        <button class="${kanaUI.mode === 'r2k' ? 'on' : ''}" data-kmode="r2k">a → ${sc === 'h' ? 'あ' : 'ア'}</button>
      </div>
      ${q ? `
        <article class="card center kquiz">
          <div class="score">${kanaUI.score.ok}/${kanaUI.score.n}</div>
          ${kanaUI.mode === 'k2r' ? `<div class="kq-big" lang="ja">${q.k.ch}</div>` : `<div class="kq-big roma">${q.k.r}</div>`}
        </article>
        <div class="options grid2">
          ${q.opts.map((o, i) => {
            let cls = '';
            if (q.ans != null) { if (o.key === q.k.key) cls = 'correct'; else if (i === q.ans) cls = 'wrong'; }
            return `<button class="opt big ${cls}" data-kopt="${i}" ${q.ans != null ? 'disabled' : ''} ${kanaUI.mode === 'r2k' ? 'lang="ja"' : ''}>${kanaUI.mode === 'k2r' ? o.r : o.ch}</button>`;
          }).join('')}
        </div>
        ${q.ans != null && q.opts[q.ans].key !== q.k.key ? `
          <div class="feedback ko"><b lang="ja">${q.k.ch}</b> = <b>${q.k.r}</b><br><small>${esc(KANA_MNEMO[sc][q.k.ch] || '')}</small></div>
          <button class="btn primary wide" data-act="knext">Siguiente →</button>` : ''}
      ` : '<p class="muted center">Selecciona al menos una fila.</p>'}`;
  }
  function newKanaQ(pool, sc) {
    // más probabilidad para los menos dominados
    const weighted = [];
    pool.forEach((k) => { const s = kanaStat(k.key).s; const w = s >= 3 ? 1 : s === 0 ? 4 : 2; for (let i = 0; i < w; i++) weighted.push(k); });
    let k = weighted[Math.floor(Math.random() * weighted.length)];
    if (kanaUI.lastKey && k.key === kanaUI.lastKey && pool.length > 1) k = pool.find((x) => x.key !== k.key && Math.random() < 0.5) || pool.find((x) => x.key !== k.key);
    kanaUI.lastKey = k.key;
    const distractPool = (pool.length >= 4 ? pool : allKana(sc)).filter((x) => x.key !== k.key && x.r !== k.r);
    const uniq = []; shuffle(distractPool).forEach((x) => { if (uniq.length < 3 && !uniq.some((u) => u.r === x.r)) uniq.push(x); });
    return { k, opts: shuffle([k, ...uniq]), ans: null };
  }

  const isHira = (s) => /^[ぁ-ゖー]+$/.test(s);
  function readPool(sc) {
    if (sc === 'k') return KATAKANA_WORDS.map(([jp, r, es]) => ({ jp, r, es }));
    return VOCAB.filter((v) => isHira(v.kana) && v.kana.length >= 2).map((v) => ({ jp: v.kana, r: v.romaji, es: v.es }));
  }
  function kanaRead(sc) {
    const pool = readPool(sc);
    if (!kanaUI.q || !kanaUI.q.read) {
      const w = pool[Math.floor(Math.random() * pool.length)];
      kanaUI.q = { read: true, w, opts: shuffle([w, ...sample(pool.filter((x) => x.r !== w.r), 3)]), ans: null };
    }
    const q = kanaUI.q;
    return `
      <p class="muted small">Lee la palabra y elige cómo se pronuncia. ${sc === 'h' ? 'Son palabras de tu vocabulario.' : 'Palabras extranjeras en katakana. ー alarga la vocal.'}</p>
      <article class="card center kquiz">
        <div class="score">${kanaUI.score.ok}/${kanaUI.score.n}</div>
        <div class="kq-word" lang="ja">${esc(q.w.jp)}</div>
        ${q.ans != null ? `<div class="meaning">${esc(q.w.es)} ${sayBtn(q.w.jp, 'say-sm')}</div>` : ''}
      </article>
      <div class="options grid2">
        ${q.opts.map((o, i) => {
          let cls = '';
          if (q.ans != null) { if (o.r === q.w.r) cls = 'correct'; else if (i === q.ans) cls = 'wrong'; }
          return `<button class="opt ${cls}" data-ropt="${i}" ${q.ans != null ? 'disabled' : ''}>${esc(o.r)}</button>`;
        }).join('')}
      </div>
      ${q.ans != null ? `<button class="btn primary wide" data-act="rnext">Siguiente →</button>` : ''}`;
  }

  function bindKana() {
    const sc = kanaUI.script;
    view.querySelectorAll('[data-kc]').forEach((b) => b.addEventListener('click', () => {
      kanaUI.detail = { ch: b.dataset.kc, r: b.dataset.kr };
      Speech.speak(b.dataset.kc); renderKana();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
    view.querySelectorAll('[data-row]').forEach((b) => b.addEventListener('click', () => {
      const sel = selectedRows(); const id = b.dataset.row;
      const i = sel.indexOf(id);
      if (i >= 0) { if (sel.length > 1) sel.splice(i, 1); } else sel.push(id);
      kanaUI.q = null; Store.save(); renderKana();
    }));
    view.querySelectorAll('[data-kmode]').forEach((b) => b.addEventListener('click', () => { kanaUI.mode = b.dataset.kmode; kanaUI.q = null; renderKana(); }));
    view.querySelectorAll('[data-kopt]').forEach((b) => b.addEventListener('click', () => {
      const q = kanaUI.q; q.ans = +b.dataset.kopt;
      const ok = q.opts[q.ans].key === q.k.key;
      const st = { ...kanaStat(q.k.key) };
      if (ok) { st.c++; st.s++; } else { st.w++; st.s = 0; }
      S().kana[q.k.key] = st; Store.save();
      kanaUI.score.n++; if (ok) kanaUI.score.ok++;
      Speech.speak(q.k.ch); haptic();
      renderKana();
      if (ok) setTimeout(() => { if (kanaUI.q === q) { kanaUI.q = null; renderKana(); } }, 650);
    }));
    on('[data-act="knext"]', () => { kanaUI.q = null; renderKana(); });
    view.querySelectorAll('[data-ropt]').forEach((b) => b.addEventListener('click', () => {
      const q = kanaUI.q; q.ans = +b.dataset.ropt;
      kanaUI.score.n++; if (q.opts[q.ans].r === q.w.r) kanaUI.score.ok++;
      Speech.speak(q.w.jp); haptic(); renderKana();
    }));
    on('[data-act="rnext"]', () => { kanaUI.q = null; renderKana(); });
  }

  // ---------- FRASES ----------
  const fr = { cat: 'basicas', q: '' };
  function renderFrases() {
    const cats = [{ id: 'all', name: 'Todas', icon: '🔎' }, { id: 'vocab', name: 'Palabras', icon: '📖' }, ...PHRASE_CATS];
    let list = fr.cat === 'all' ? [...PHRASES, ...VOCAB] : fr.cat === 'vocab' ? VOCAB : PHRASES.filter((p) => p.cat === fr.cat);
    const f = fr.q.trim().toLowerCase();
    if (f) list = (fr.cat === 'all' ? list : list).filter((it) => [it.jp, it.kana, it.romaji, it.es].some((x) => x.toLowerCase().includes(f)));
    const c = catOf(fr.cat);
    view.innerHTML = `
      ${header('言葉 <span class="h-es">Frases</span>', 'Tu biblioteca de japonés')}
      <input class="search" id="fsearch" type="search" placeholder="Buscar en japonés, romaji o español…" value="${esc(fr.q)}">
      <div class="cats">${cats.map((x) => `<button class="cat ${fr.cat === x.id ? 'on' : ''} cat-${x.id}" data-cat="${x.id}">${x.icon} ${esc(x.name)}</button>`).join('')}</div>
      ${c ? `<p class="cat-desc">${esc(c.desc)}</p>` : ''}
      ${fr.cat === 'insultos' ? '<div class="tip warn">⚠️ Los japoneses apenas insultan en serio. Úsalos en broma, con confianza, y nunca con desconocidos.</div>' : ''}
      <div class="plist">
        ${list.length ? list.map(phraseCard).join('') : '<p class="muted center">Sin resultados.</p>'}
      </div>`;
    view.querySelectorAll('[data-cat]').forEach((b) => b.addEventListener('click', () => { fr.cat = b.dataset.cat; renderFrases(); }));
    const s = view.querySelector('#fsearch');
    s.addEventListener('input', () => {
      fr.q = s.value; const pos = s.selectionStart;
      if (fr.q && fr.cat !== 'all') fr.cat = 'all';
      renderFrases();
      const s2 = view.querySelector('#fsearch'); s2.focus(); s2.setSelectionRange(pos, pos);
    });
    view.querySelectorAll('[data-add]').forEach((b) => b.addEventListener('click', () => {
      if (SRS.addItem(b.dataset.add, 0)) { Store.save(); toast('Añadida a tu repaso ✓'); haptic(); renderFrases(); }
    }));
  }
  function phraseCard(it) {
    const inSrs = !!S().srs[it.id];
    return `
      <article class="pcard ${it.cat ? 'pc-' + it.cat : ''}">
        <div class="pc-main">
          ${jpBlock(it, 'md')}
          <div class="pc-es">${esc(it.es)}</div>
          ${it.note ? `<div class="pc-note">💡 ${esc(it.note)}</div>` : ''}
          ${it.ex ? `<div class="pc-note" lang="ja">${esc(it.ex.jp)} <span class="romaji">· ${esc(it.ex.romaji)}</span> — ${esc(it.ex.es)}</div>` : ''}
        </div>
        <div class="pc-actions">
          ${sayBtn(it.kana || it.jp)}
          <button class="add ${inSrs ? 'in' : ''}" data-add="${it.id}" ${inSrs ? 'disabled' : ''} aria-label="Añadir a repaso">${inSrs ? '✓' : '+'}</button>
        </div>
      </article>`;
  }

  // ---------- PERFIL ----------
  function renderPerfil() {
    const s = S(), set = s.settings, t = Store.today();
    const cards = Object.values(s.srs);
    const masteredW = cards.filter((c) => c.ivl >= 21).length;
    const hk = allKana('h').filter((k) => kanaStat(k.key).s >= 3).length;
    const kk = allKana('k').filter((k) => kanaStat(k.key).s >= 3).length;
    const total = VOCAB.length + PHRASES.length;
    const days = [...Array(7)].map((_, i) => t - 6 + i);
    const maxAct = Math.max(1, ...days.map((d) => (s.log[d] ? s.log[d].learned + s.log[d].reviews : 0)));
    const dn = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    view.innerHTML = `
      ${header('私 <span class="h-es">Perfil</span>', 'Tu progreso y ajustes')}
      <div class="stats">
        <div class="stat fire"><b>🔥 ${streakNow()}</b><span>racha (mejor ${s.streak.best || 0})</span></div>
        <div class="stat"><b>${cards.length}</b><span>de ${total} aprendidas</span></div>
        <div class="stat"><b>${masteredW}</b><span>dominadas</span></div>
        <div class="stat"><b>${SRS.due().length}</b><span>por repasar</span></div>
        <div class="stat"><b lang="ja">あ ${hk}/${allKana('h').length}</b><span>hiragana</span></div>
        <div class="stat"><b lang="ja">ア ${kk}/${allKana('k').length}</b><span>katakana</span></div>
      </div>
      <h3 class="section-title">Últimos 7 días</h3>
      <div class="card week">
        ${days.map((d) => { const a = s.log[d] ? s.log[d].learned + s.log[d].reviews : 0; const wd = new Date((d - (s.dayOffset || 0)) * 86400000).getUTCDay();
          return `<div class="wcol"><div class="wbar"><div style="height:${(a / maxAct) * 100}%"></div></div><small>${dn[wd]}</small></div>`; }).join('')}
      </div>

      <h3 class="section-title">Ajustes</h3>
      <div class="card settings">
        <label class="set"><span>Mostrar romaji<small>Quítalo cuando ya leas kana con soltura</small></span>
          <input type="checkbox" class="switch" id="s-romaji" ${set.romaji ? 'checked' : ''}></label>
        <label class="set"><span>Nuevas por día</span>
          <select id="s-perday">${[3, 5, 7, 10].map((n) => `<option ${set.perDay === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <label class="set"><span>Frases divertidas en el reto<small>Románticas, de ligar, graciosas…</small></span>
          <input type="checkbox" class="switch" id="s-fun" ${set.fun ? 'checked' : ''}></label>
        <label class="set"><span>Velocidad de voz <small id="rate-v">${set.rate.toFixed(2)}x</small></span>
          <span class="rate-wrap"><input type="range" id="s-rate" min="0.5" max="1.2" step="0.05" value="${set.rate}">${sayBtn('こんにちは、よろしくね', 'say-sm')}</span></label>
        <label class="set"><span>Tema</span>
          <select id="s-theme">${[['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Oscuro']].map(([v, l]) => `<option value="${v}" ${set.theme === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      </div>

      <h3 class="section-title">📱 Instalar en el iPhone</h3>
      <div class="card tip-plain">En <b>Safari</b>: botón <b>Compartir</b> (□↑) → <b>Añadir a pantalla de inicio</b>. Se abrirá como una app, a pantalla completa y funcionará sin conexión.</div>

      <h3 class="section-title">Copia de seguridad</h3>
      <div class="card">
        <p class="muted small">Tu progreso se guarda en este dispositivo. Exporta una copia de vez en cuando (guárdala en Archivos, iCloud o mándatela por WhatsApp). Si cambias de móvil o se borra, la importas y sigues donde lo dejaste.</p>
        <p class="small"><b>Última copia:</b> ${daysSinceBackup() === null ? 'nunca' : daysSinceBackup() === 0 ? 'hoy ✓' : 'hace ' + daysSinceBackup() + ' días'}</p>
        <div class="row-btns">
          <button class="btn ghost" data-act="export">⬇️ Exportar</button>
          <label class="btn ghost">⬆️ Importar<input type="file" id="import" accept="application/json,.json" hidden></label>
        </div>
      </div>

      <details class="danger">
        <summary>Opciones avanzadas</summary>
        <p class="muted small">Simular días sirve para probar el repaso. ${s.dayOffset ? `<b>Ahora mismo: +${s.dayOffset} días.</b>` : ''}</p>
        <div class="row-btns">
          <button class="btn ghost" data-act="dayplus">+1 día</button>
          <button class="btn ghost" data-act="daynow" ${s.dayOffset ? '' : 'disabled'}>Volver a hoy</button>
        </div>
        <button class="btn danger-btn wide" data-act="reset">Borrar todo el progreso</button>
      </details>
      <p class="foot muted">頑張って！ · Nihongo Diario</p>`;

    const bind = (sel, ev, fn) => { const el = view.querySelector(sel); if (el) el.addEventListener(ev, fn); };
    bind('#s-romaji', 'change', (e) => { set.romaji = e.target.checked; Store.save(); applySettings(); });
    bind('#s-perday', 'change', (e) => { set.perDay = +e.target.value; Store.save(); toast('Se aplicará en el próximo reto'); });
    bind('#s-fun', 'change', (e) => { set.fun = e.target.checked; Store.save(); });
    bind('#s-rate', 'input', (e) => { set.rate = +e.target.value; view.querySelector('#rate-v').textContent = set.rate.toFixed(2) + 'x'; Store.save(); });
    bind('#s-theme', 'change', (e) => { set.theme = e.target.value; Store.save(); applySettings(); });
    on('[data-act="export"]', async () => {
      set.lastBackup = Date.now(); Store.save();
      const name = `nihongo-diario-${new Date().toISOString().slice(0, 10)}.json`;
      const file = new File([Store.exportJSON()], name, { type: 'application/json' });
      // En iPhone: menú Compartir (Guardar en Archivos, WhatsApp, AirDrop…)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: 'Copia Nihongo Diario' }); toast('Copia guardada ✓'); renderPerfil(); return; }
        catch (e) { if (e.name === 'AbortError') { set.lastBackup = null; Store.save(); return; } }
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(file); a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      toast('Copia descargada ✓'); renderPerfil();
    });
    bind('#import', 'change', async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { Store.importJSON(await f.text()); applySettings(); toast('Progreso importado ✓'); renderPerfil(); }
      catch (err) { toast('Archivo no válido'); }
    });
    on('[data-act="dayplus"]', () => { s.dayOffset = (s.dayOffset || 0) + 1; Store.save(); rev = null; toast('Simulando +' + s.dayOffset + ' días'); renderPerfil(); });
    on('[data-act="daynow"]', () => { s.dayOffset = 0; Store.save(); rev = null; renderPerfil(); });
    on('[data-act="reset"]', () => {
      if (confirm('¿Seguro? Se borrará TODO tu progreso.')) { Store.reset(); rev = null; quiz = null; applySettings(); toast('Progreso borrado'); renderPerfil(); }
    });
  }

  // ---------- general ----------
  function on(sel, fn) { const el = view.querySelector(sel); if (el) el.addEventListener('click', fn); }

  function applySettings() {
    const set = S().settings;
    document.body.classList.toggle('no-romaji', !set.romaji);
    const root = document.documentElement;
    if (set.theme === 'auto') root.removeAttribute('data-theme'); else root.dataset.theme = set.theme;
    const dark = set.theme === 'dark' || (set.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#16131a' : '#fbf7f2');
  }

  function updateBadge() {
    const n = SRS.due().length;
    const b = document.getElementById('due-badge');
    b.textContent = n > 99 ? '99+' : n; b.hidden = !n;
  }

  const ROUTES = { hoy: renderHoy, repaso: renderRepaso, kana: renderKana, frases: renderFrases, perfil: renderPerfil };
  function route() {
    const name = (location.hash.replace(/^#\/?/, '') || 'hoy').split('/')[0];
    const fn = ROUTES[name] || renderHoy;
    document.querySelectorAll('.tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.route === (ROUTES[name] ? name : 'hoy')));
    fn();
    updateBadge();
  }
  // re-render con cada acción para mantener badge al día
  const origSave = Store.save;
  Store.save = function () { origSave(); updateBadge(); };

  window.addEventListener('hashchange', () => { route(); window.scrollTo({ top: 0 }); });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-say]');
    if (b) { e.preventDefault(); e.stopPropagation(); Speech.speak(b.dataset.say); b.classList.add('pulse'); setTimeout(() => b.classList.remove('pulse'), 400); }
  }, true);
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applySettings);
  // al volver a la app al día siguiente, refrescar
  document.addEventListener('visibilitychange', () => { if (!document.hidden) route(); });

  function confetti() {
    const box = document.createElement('div'); box.className = 'confetti';
    const chars = ['🎉', '🌸', '⭐', '✨', '💮', 'あ', '日'];
    for (let i = 0; i < 28; i++) {
      const s = document.createElement('span');
      s.textContent = chars[i % chars.length];
      s.style.left = Math.random() * 100 + '%';
      s.style.animationDelay = Math.random() * 0.6 + 's';
      s.style.fontSize = 14 + Math.random() * 18 + 'px';
      box.appendChild(s);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 3000);
  }

  const ICON = {
    speaker: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>',
  };

  applySettings();
  route();
  // Pedir al navegador que no borre nuestros datos
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
