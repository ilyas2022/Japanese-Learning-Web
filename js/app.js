// Nihongo Diario — app principal (router + vistas)
(function () {
  Store.load();
  const S = () => Store.s;
  const view = document.getElementById('view');

  // ---------- utilidades ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (a, n) => shuffle(a).slice(0, n);
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const ITEMS = {}; ITEMS_LIST.forEach((it) => (ITEMS[it.id] = it));
  const UNIT = {}; UNITS.forEach((u) => (UNIT[u.id] = u));
  const canSpeak = Speech.available();
  const learnedIds = () => Object.keys(S().srs).filter((id) => ITEMS[id]);
  const unitVisible = (u) => u.kind !== 'adult' || S().settings.adult;

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1800);
  }
  function haptic() { if (navigator.vibrate) navigator.vibrate(15); }

  // ---------- Ruta (orden de aprendizaje) ----------
  // Unidades principales en orden de utilidad; cada 4 frases útiles, 1 divertida (ligar, romántico, +18…).
  function buildQueue() {
    const set = S().settings;
    const core = UNITS.filter((u) => u.kind === 'core').flatMap((u) => u.items.map((i) => i.id));
    const funUnits = UNITS.filter((u) => (u.kind === 'fun' && set.fun) || (u.kind === 'adult' && set.fun && set.adult)).map((u) => u.items.map((i) => i.id));
    const q = []; let ui = 0;
    core.forEach((id, i) => {
      q.push(id);
      if (i % 4 === 3 && funUnits.some((p) => p.length)) {
        for (let t = 0; t < funUnits.length; t++) { const pool = funUnits[ui++ % funUnits.length]; if (pool.length) { q.push(pool.shift()); break; } }
      }
    });
    funUnits.forEach((p) => q.push(...p));
    return q;
  }
  function nextNew(n) { return buildQueue().filter((id) => !S().srs[id]).slice(0, n); }

  function routeInfo() {
    const core = UNITS.filter((u) => u.kind === 'core'); const srs = S().srs;
    const idx = core.findIndex((u) => u.items.some((i) => !srs[i.id]));
    const cur = core[idx < 0 ? core.length - 1 : idx];
    const total = core.reduce((a, u) => a + u.items.length, 0);
    const done = core.reduce((a, u) => a + u.items.filter((i) => srs[i.id]).length, 0);
    return { cur, idx: idx < 0 ? core.length - 1 : idx, n: core.length, curDone: cur.items.filter((i) => srs[i.id]).length, total, done };
  }
  function routeCard() {
    const r = routeInfo(); const pct = Math.round((r.curDone / r.cur.items.length) * 100);
    return `
      <div class="card route">
        <div class="route-top"><span>Ruta · unidad ${r.idx + 1} de ${r.n}</span><span>${r.done}/${r.total}</span></div>
        <div class="route-unit">${r.cur.icon} ${esc(r.cur.name)}</div>
        <div class="bar"><div style="width:${pct}%"></div></div>
        <small class="muted">${r.curDone} de ${r.cur.items.length} en esta unidad</small>
      </div>`;
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
  function unitChip(it) { const u = UNIT[it.unit]; return `<span class="chip chip-${u.kind} chip-${u.id}">${u.icon} ${esc(u.name)}</span>`; }
  function partsBlock(it) {
    if (!it.parts) return '';
    return `<div class="parts" title="Desglose palabra a palabra">${it.parts.map(([j, e]) => `<span class="part"><b lang="ja">${esc(j)}</b><small>${esc(e)}</small></span>`).join('')}</div>`;
  }
  function noteBlock(it, cls = '') { return it.note ? `<div class="note ${cls}">💡 ${esc(it.note)}</div>` : ''; }
  function fullCard(it) {
    return `
      <article class="card learn-card">
        <div class="card-top">${unitChip(it)}${sayBtn(it.kana || it.jp, 'say-lg')}</div>
        ${jpBlock(it)}
        <div class="meaning">${esc(it.es)}</div>
        ${partsBlock(it)}
        ${noteBlock(it)}
      </article>`;
  }
  function header(title, sub, right = '') {
    return `<header class="page-head"><div><h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}</div>${right}</header>`;
  }
  function streakPill() {
    const n = streakNow();
    return `<div class="streak ${n ? 'on' : ''}" title="Racha de días">🔥 <b>${n}</b></div>`;
  }
  function miniRow(it, extra = '') {
    return `<div class="mini-row">${sayBtn(it.kana || it.jp, 'say-sm')}<div class="mini-jp" lang="ja">${esc(it.jp)}<small class="romaji">${esc(it.romaji)}</small></div><div class="mini-es">${esc(it.es)}${extra}</div></div>`;
  }

  // ---------- escribir en japonés (romaji → kana, js/romaji.js) ----------
  const writeOn = () => S().settings.writeP !== false;
  const WRITE_MSG = { ok: '✅ ¡Correcto!', near: '🤏 ¡Casi!', ko: '❌ No era eso', skip: '🤔 Sin respuesta', empty: '🤔 Sin respuesta' };
  function writeBoxHTML(w) {
    if (!w.t0) w.t0 = Date.now();
    return `
      <div class="write">
        <input id="wr-in" class="write-in" type="text" lang="en" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" enterkeyhint="done" placeholder="Escribe en romaji (o en kana)…" value="${esc(w.typed || '')}">
        <div class="write-prev" id="wr-prev" lang="ja" aria-live="polite">${esc(Romaji.toKana(w.typed || '')) || '&nbsp;'}</div>
        <div class="row-btns"><button class="btn ghost" data-act="wr-skip">No lo sé</button><button class="btn primary" data-act="wr-go">Comprobar</button></div>
      </div>`;
  }
  function writeResultHTML(w) {
    const c = w.check; const res = c.override ? 'ok' : c.res;
    const why = c.res === 'near' && !c.override ? (c.why === 'long' ? 'Ojo a las vocales largas y a la っ.' : 'Se te ha escapado una letra.') : '';
    return `
      <div class="feedback ${res === 'ok' ? 'ok' : res === 'near' ? 'near' : 'ko'}">${WRITE_MSG[res]}${why ? ` <small>${why}</small>` : ''}</div>
      ${c.got ? `<div class="write-cmp"><span class="muted small">Tú:</span> <b lang="ja">${esc(c.got)}</b></div>` : ''}
      ${(c.res === 'near' || c.res === 'ko') && !c.override ? `<button class="link center-link" data-act="wr-ok">${c.res === 'near' ? 'Era un despiste: cuéntala como bien' : 'Mi respuesta también es correcta'}</button>` : ''}`;
  }
  // onDone(check) al comprobar · onOverride() si dices que tu respuesta valía
  function bindWrite(w, it, onDone, rerender, onOverride) {
    const inp = view.querySelector('#wr-in');
    if (inp) {
      const prev = view.querySelector('#wr-prev');
      try { inp.focus({ preventScroll: true }); } catch (e) { /* sin foco */ }
      inp.addEventListener('input', () => { w.typed = inp.value; prev.textContent = Romaji.toKana(inp.value) || ' '; });
      const go = () => {
        if (!inp.value.trim()) { inp.focus(); return; }
        w.check = { ...Romaji.check(inp.value, it), ms: Date.now() - w.t0 }; haptic(); onDone(w.check);
      };
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
      on('[data-act="wr-go"]', go);
      on('[data-act="wr-skip"]', () => { w.check = { res: 'skip', got: '' }; onDone(w.check); });
    }
    on('[data-act="wr-ok"]', () => { w.check.override = true; onOverride && onOverride(); rerender(); });
  }
  const writeOk = (w) => !!(w && w.check && (w.check.res === 'ok' || w.check.override));
  // Nota sugerida tras escribir: fallo → Otra vez · casi → Difícil · bien → Bien (Fácil si fue rápido)
  function suggestGrade(w, it) {
    const c = w && w.check; if (!c) return null;
    if (c.override) return 2;
    if (c.res === 'ok') return c.ms < 4000 + 250 * [...(it.kana || '')].length ? 3 : 2;
    return c.res === 'near' ? 1 : 0;
  }

  // ---------- ejercicios (test de Hoy y Construir) ----------
  // Piezas para construir: palabras en japonés del desglose si lo hay; si no, romaji
  const kanaTiles = (it) => !!(it.parts && it.parts.length >= 2);
  const romajiTokens = (it) => it.romaji.replace(/[!?.…,~、。！？]/g, ' ').split(/\s+/).filter(Boolean);
  const tokens = (it) => (kanaTiles(it) ? it.parts.map(([j]) => j) : romajiTokens(it));
  const canBuild = (it) => !it.jp.includes('〜') && tokens(it).length >= 2 && tokens(it).length <= 8;

  function distractors(it, n, key) {
    const seen = new Set([it[key]]);
    const same = shuffle(UNIT[it.unit].items), rest = shuffle(ITEMS_LIST.filter((x) => x.kind === it.kind || x.kind === 'core'));
    const out = [];
    for (const x of [...same, ...rest]) {
      if (out.length >= n) break;
      if (x.id === it.id || seen.has(x[key]) || (key === 'jp' && x.es === it.es)) continue;
      seen.add(x[key]); out.push(x.id);
    }
    return out;
  }
  // stage 'rec' = reconocer (primer contacto, opción múltiple) · 'prod' = producir (escribir o construir)
  function makeExercise(id, only, stage = 'rec') {
    const it = ITEMS[id];
    const types = only ? [only] : stage === 'prod'
      ? [...(writeOn() ? ['write', 'write'] : ['reverse']), ...(canBuild(it) ? ['build'] : [])]
      : ['meaning', 'meaning', 'reverse', ...(canSpeak ? ['listen', 'listen'] : [])];
    const type = pick(types);
    const ex = { id, type, stage, answered: false, ok: null, spoken: false };
    if (type === 'build') {
      const tk = tokens(it); const kt = kanaTiles(it);
      const others = ITEMS_LIST.filter((x) => x.id !== id && kanaTiles(x) === kt).flatMap(tokens).filter((t) => !t.includes('〜'));
      const extra = sample([...new Set(others)].filter((t) => !tk.includes(t)), Math.min(2, Math.max(1, 8 - tk.length)));
      ex.tokens = tk; ex.kana = kt; ex.pool = shuffle([...tk, ...extra]); ex.picked = [];
    } else if (type === 'write') {
      ex.w = {};
    } else {
      ex.opts = shuffle([id, ...distractors(it, 3, type === 'reverse' ? 'jp' : 'es')]);
    }
    return ex;
  }
  const PROMPT = { meaning: '¿Qué significa?', reverse: '¿Cómo se dice en japonés?', listen: 'Escucha: ¿qué significa?', build: 'Ordena las piezas en japonés', write: 'Escríbelo en japonés (y dilo en voz alta)' };

  function exerciseHTML(ex) {
    const it = ITEMS[ex.id];
    let front, answer = '';
    if (ex.type === 'meaning') front = `<div class="card-top end">${sayBtn(it.kana || it.jp, 'say-lg')}</div>${jpBlock(it)}`;
    else if (ex.type === 'listen') front = `<div class="listen-big">${sayBtn(it.kana || it.jp, 'say-xl')}<p class="muted small">Toca para volver a oírlo</p></div>${ex.answered ? jpBlock(it, 'md') : ''}`;
    else front = `<div class="meaning big">${esc(it.es)}</div>`;

    if (ex.type === 'build') {
      const placed = ex.picked.map((i) => ex.pool[i]);
      const lang = ex.kana ? ' lang="ja"' : '';
      answer = `
        <div class="build-line ${ex.answered ? (ex.ok ? 'ok' : 'ko') : ''}">${placed.length ? ex.picked.map((pi, k) => `<button class="tile in ${ex.kana ? 'tile-ja' : ''}"${lang} data-unpick="${k}" ${ex.answered ? 'disabled' : ''}>${esc(ex.pool[pi])}</button>`).join('') : '<span class="muted small">Toca las piezas en orden…</span>'}</div>
        <div class="tiles">${ex.pool.map((t, i) => `<button class="tile ${ex.kana ? 'tile-ja' : ''} ${ex.picked.includes(i) ? 'used' : ''}"${lang} data-tile="${i}" ${ex.picked.includes(i) || ex.answered ? 'disabled' : ''}>${esc(t)}</button>`).join('')}</div>
        ${!ex.answered && ex.picked.length ? `<button class="link center-link" data-act="bclear">Borrar</button>` : ''}`;
    } else if (ex.type === 'write') {
      answer = ex.answered ? writeResultHTML(ex.w) : writeBoxHTML(ex.w);
    } else {
      answer = `<div class="options">${ex.opts.map((oid) => {
        const o = ITEMS[oid]; let cls = '';
        if (ex.answered) { if (oid === ex.id) cls = 'correct'; else if (oid === ex.answered) cls = 'wrong'; }
        const label = ex.type === 'reverse' ? `<span lang="ja" class="opt-jp">${esc(o.jp)}</span><small class="romaji">${esc(o.romaji)}</small>` : esc(o.es);
        return `<button class="opt ${cls}" data-opt="${oid}" ${ex.answered ? 'disabled' : ''}>${label}</button>`;
      }).join('')}</div>`;
    }
    const fb = ex.answered ? `
      ${ex.type === 'write' ? (ex.ok ? '' : '<p class="muted small center">Volverá a salir al final.</p>') : `<div class="feedback ${ex.ok ? 'ok' : 'ko'}">${ex.ok ? '✅ ¡Correcto!' : '❌ No. Volverá a salir al final.'}</div>`}
      ${ex.ok && ex.type === 'meaning' ? '' : `<div class="card answer-card">${sayBtn(it.kana || it.jp, 'say-sm')}<div><div lang="ja" class="ans-jp">${esc(it.jp)}</div><div class="romaji">${esc(it.romaji)}</div><div class="ans-es">${esc(it.es)}</div></div></div>`}
      <button class="btn primary wide" data-act="exnext">Continuar →</button>` : '';
    return `
      <p class="step-label">${PROMPT[ex.type]}</p>
      <article class="card center quiz-card">${front}</article>
      ${answer}${fb}`;
  }
  // onAnswer(ex) al responder · onNext() al pulsar Continuar
  function bindExercise(ex, rerender, onAnswer, onNext) {
    const it = ITEMS[ex.id];
    if (ex.type === 'listen' && !ex.spoken) { ex.spoken = true; Speech.speak(it.kana || it.jp); }
    const answered = (ok, choice) => {
      ex.answered = choice; ex.ok = ok; haptic();
      Speech.speak(it.kana || it.jp);
      onAnswer && onAnswer(ex); rerender();
    };
    if (ex.type === 'write') bindWrite(ex.w, it, (c) => answered(c.res === 'ok', true), rerender, () => { ex.ok = true; });
    view.querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', () => answered(b.dataset.opt === ex.id, b.dataset.opt)));
    view.querySelectorAll('[data-tile]').forEach((b) => b.addEventListener('click', () => {
      ex.picked.push(+b.dataset.tile);
      if (ex.picked.length === ex.tokens.length) answered(ex.picked.map((i) => ex.pool[i]).join(' ') === ex.tokens.join(' '), true);
      else rerender();
    }));
    view.querySelectorAll('[data-unpick]').forEach((b) => b.addEventListener('click', () => { ex.picked.splice(+b.dataset.unpick, 1); rerender(); }));
    on('[data-act="bclear"]', () => { ex.picked = []; rerender(); });
    on('[data-act="exnext"]', () => { onNext(); window.scrollTo({ top: 0 }); });
  }

  // ---------- tarjeta de repaso (SRS) — Hoy y Repaso ----------
  // Cada cola guarda claves 'id|r' (reconocer) o 'id|p' (producir), con calendarios separados.
  const newSession = (keys) => ({ queue: [...keys], shown: false, done: 0, dir: null, spoken: null });
  const validKey = (k) => !!(ITEMS[SRS.parse(k).id] && SRS.state(k));
  const itemOf = (k) => ITEMS[SRS.parse(k).id];
  function cardDir(k) {
    if (SRS.parse(k).side === 'p') return 'es';  // producir: ves el español y lo dices en japonés
    const mode = S().settings.reviewMode || 'mix';
    if (!canSpeak || mode === 'r') return 'jp';
    if (mode === 'audio') return 'audio';
    const c = SRS.state(k);
    if (!c || c.s == null || c.s < 3) return 'jp'; // recién aprendidas: leer
    return Math.random() < 0.5 ? 'audio' : 'jp';   // después, la mitad de las veces de oído
  }
  // Racha: cuenta el día si terminas el reto o te pones al día con el repaso
  function markStudied() {
    const st = S().streak, t = Store.today();
    if (st.last !== t) { st.count = st.last === t - 1 ? st.count + 1 : 1; st.last = t; st.best = Math.max(st.best || 0, st.count); }
  }
  function frontHTML(it, dir) {
    if (dir === 'es') return `<div class="card-top">${unitChip(it)}</div><p class="muted small">¿Cómo se dice en japonés? ${writeOn() ? 'Escríbelo y dilo en voz alta.' : 'Dilo en voz alta.'}</p><div class="meaning big">${esc(it.es)}</div>`;
    if (dir === 'audio') return `<div class="card-top">${unitChip(it)}</div><div class="listen-big">${sayBtn(it.kana || it.jp, 'say-xl')}<p class="muted small">Escucha. ¿Qué significa?</p></div>`;
    return `<div class="card-top">${unitChip(it)}${sayBtn(it.kana || it.jp, 'say-lg')}</div>${jpBlock(it)}`;
  }
  function backHTML(it, dir) {
    const main = dir === 'jp' ? `<div class="meaning">${esc(it.es)}</div>`
      : dir === 'es' ? `${jpBlock(it)}<div class="center-say">${sayBtn(it.kana || it.jp, 'say-lg')}</div>`
      : `${jpBlock(it, 'md')}<div class="meaning">${esc(it.es)}</div>`;
    return `<hr class="sep">${main}${partsBlock(it)}${noteBlock(it, 'left')}`;
  }
  function srsCardHTML(sess) {
    const k = sess.queue[0]; const { id, side } = SRS.parse(k); const it = ITEMS[id];
    if (!sess.dir) sess.dir = cardDir(k);
    const writing = sess.dir === 'es' && writeOn();
    if (writing && !sess.w) sess.w = {};
    const sug = writing ? suggestGrade(sess.w, it) : null;
    return `
      <article class="card center review-card">
        <span class="side-badge side-${side}">${side === 'p' ? '🗣️ producir' : sess.dir === 'audio' ? '🎧 entender' : '👁️ reconocer'}</span>
        ${SRS.isHard(id) ? '<span class="hard-badge">⚠️ difícil</span>' : ''}
        ${frontHTML(it, sess.dir)}
        ${sess.shown ? backHTML(it, sess.dir) : ''}
      </article>
      ${sess.shown ? `
        ${writing && sess.w.check ? writeResultHTML(sess.w) : ''}
        <div class="grades">
          ${[['Otra vez', 0, 'g0'], ['Difícil', 1, 'g1'], ['Bien', 2, 'g2'], ['Fácil', 3, 'g3']].map(([l, g, c]) =>
            `<button class="grade ${c} ${g === sug ? 'sug' : ''}" data-grade="${g}"><b>${l}</b><small>${g === 0 ? 'ahora otra vez' : SRS.label(SRS.preview(k, g).ivl)}</small></button>`).join('')}
        </div>
        ${sug != null ? '<p class="muted small center">Resaltada: la nota que sugiere tu respuesta.</p>' : ''}`
      : writing ? `${writeBoxHTML(sess.w)}<button class="link center-link" data-act="show">Prefiero decirlo en voz alta y mirar</button>`
      : `<button class="btn primary wide" data-act="show">Mostrar respuesta</button>`}`;
  }
  function bindSrsCard(sess, rerender) {
    const k = sess.queue[0]; const it = itemOf(k);
    if (sess.dir === 'audio' && sess.spoken !== k && !sess.shown) { sess.spoken = k; Speech.speak(it.kana || it.jp); }
    const reveal = () => { sess.shown = true; rerender(); Speech.speak(it.kana || it.jp); };
    on('[data-act="show"]', reveal);
    if (sess.w) bindWrite(sess.w, it, reveal, rerender);
    view.querySelectorAll('[data-grade]').forEach((b) => b.addEventListener('click', () => {
      const g = +b.dataset.grade; const cur = sess.queue.shift();
      SRS.grade(cur, g); haptic();
      // Fallada: vuelve más tarde en esta misma sesión (espaciado dentro de la sesión)
      if (g === 0) sess.queue.splice(Math.min(4, sess.queue.length), 0, cur); else sess.done++;
      if (!sess.queue.length && !SRS.due().length) markStudied();
      sess.shown = false; sess.dir = null; sess.w = null; Store.save(); rerender();
    }));
  }

  // ---------- HOY ----------
  let quiz = null, hoyRev = null;
  const BACKLOG_MAX = 60;
  function ensureDaily() {
    const t = Store.today();
    const d = S().daily;
    if (!d || d.day !== t) {
      const backlog = SRS.due().length;
      const paused = backlog > BACKLOG_MAX; // con muchos repasos acumulados, primero ponerse al día
      S().daily = { day: t, ids: paused ? [] : nextNew(S().settings.perDay), paused, step: backlog ? 'review' : 'learn', idx: 0, round: 1 };
      quiz = null; hoyRev = null; Store.save();
    }
    const d2 = S().daily;
    if (d2.step !== 'done') {
      const filtered = d2.ids.filter((id) => !S().srs[id] && ITEMS[id]);
      if (filtered.length !== d2.ids.length) { d2.ids = filtered; d2.idx = Math.min(d2.idx, Math.max(0, filtered.length - 1)); Store.save(); }
    }
    return S().daily;
  }

  function renderHoy() {
    const d = ensureDaily();
    const learned = learnedIds().length;
    if (d.step === 'review') {
      if (!hoyRev) hoyRev = newSession(SRS.due().slice(0, 20));
      hoyRev.queue = hoyRev.queue.filter(validKey);
      if (!hoyRev.queue.length) { d.step = 'learn'; Store.save(); }
    }
    const due = SRS.due().length;
    let body = '';

    if (d.step === 'review') {
      body = `
        <div class="phase"><span class="on">1 · Repaso</span><span>2 · Nuevas</span><span>3 · Test</span></div>
        <p class="step-label">Calentamiento: lo que ya sabes · quedan <b>${hoyRev.queue.length}</b></p>
        ${srsCardHTML(hoyRev)}
        <button class="link center-link" data-act="skiprev">Saltar repaso e ir a las nuevas →</button>`;
    } else if (!d.ids.length && d.step !== 'done' && d.paused) {
      body = `
        <div class="card center">
          <div class="big-emoji">🧘</div><h2>Hoy toca ponerse al día</h2>
          <p class="muted">Tienes <b>${due}</b> repasos pendientes. Para no olvidar lo que ya sabes, hoy no hay frases nuevas hasta que bajen de ${BACKLOG_MAX}.</p>
          <div class="stack-btns">
            ${due ? `<a class="btn primary" href="#/repaso">Repasar (${due})</a>` : ''}
            <button class="btn ghost" data-act="more">Aprender ${S().settings.perDay} nuevas igualmente</button>
          </div>
        </div>`;
    } else if (!d.ids.length && d.step !== 'done') {
      body = `<div class="card center"><div class="big-emoji">🏆</div><h2>¡Has completado la Ruta!</h2><p class="muted">No quedan frases nuevas. Sigue repasando para no olvidarlas.</p><a class="btn primary" href="#/repaso">Ir a repaso</a></div>`;
    } else if (d.step === 'learn') {
      const it = ITEMS[d.ids[d.idx]];
      const last = d.idx === d.ids.length - 1;
      body = `
        ${d.idx === 0 ? routeCard() : ''}
        <div class="phase"><span class="done">1 · Repaso</span><span class="on">2 · Nuevas</span><span>3 · Test</span></div>
        <div class="progress-dots">${d.ids.map((_, i) => `<span class="${i < d.idx ? 'done' : i === d.idx ? 'cur' : ''}"></span>`).join('')}</div>
        <p class="step-label">Nueva ${d.idx + 1} de ${d.ids.length} · escúchala y repítela en voz alta</p>
        ${fullCard(it)}
        <div class="row-btns">
          <button class="btn ghost" data-act="prev" ${d.idx === 0 ? 'disabled' : ''}>← Atrás</button>
          <button class="btn primary" data-act="next">${last ? 'Hacer el test ✓' : 'Siguiente →'}</button>
        </div>`;
    } else if (d.step === 'quiz') {
      // Dos rondas: primero reconocer (opción múltiple), después producir (escribir o construir)
      if (!quiz) quiz = { queue: [...shuffle(d.ids).map((id) => makeExercise(id, null, 'rec')), ...shuffle(d.ids).map((id) => makeExercise(id, null, 'prod'))], total: d.ids.length * 2, passed: 0 };
      body = `
        <div class="phase"><span class="done">1 · Repaso</span><span class="done">2 · Nuevas</span><span class="on">3 · Test</span></div>
        <div class="quiz-progress"><div style="width:${(quiz.passed / quiz.total) * 100}%"></div></div>
        <p class="muted small center">${quiz.queue[0].stage === 'prod' ? '🗣️ Ronda 2 · ahora la dices tú' : '👁️ Ronda 1 · reconócela'}</p>
        ${exerciseHTML(quiz.queue[0])}`;
    } else {
      body = `
        <div class="card center done-card">
          <div class="big-emoji">🎉</div>
          <h2>¡Reto completado!</h2>
          <p class="muted">${d.ids.length} frases nuevas en tu repaso. Volverán mañana para que se te queden.</p>
          <div class="stat-row">
            <div><b>${streakNow()}</b><span>días de racha</span></div>
            <div><b>${learned}</b><span>aprendidas</span></div>
            <div><b>${due}</b><span>por repasar</span></div>
          </div>
        </div>
        ${routeCard()}
        <h3 class="section-title">Lo de hoy</h3>
        <div class="mini-list">${d.ids.map((id) => miniRow(ITEMS[id])).join('')}</div>
        <div class="stack-btns">
          ${due ? `<a class="btn primary" href="#/repaso">Repasar (${due})</a>` : ''}
          ${learnedIds().filter((id) => canBuild(ITEMS[id])).length >= 3 ? '<a class="btn ghost" href="#/repaso/construir">🧩 Construir frases (2 min)</a>' : ''}
          <a class="btn ghost" href="#/numeros">🔢 Practicar números</a>
          <button class="btn ghost" data-act="more">+ Aprender ${S().settings.perDay} más</button>
        </div>`;
    }

    view.innerHTML = `
      ${header('今日 <span class="h-es">Hoy</span>', `Reto diario · ${learned} aprendidas`, streakPill())}
      ${migrationBanner() || safetyBanner(learned)}
      ${body}`;
    on('[data-act="dismiss-install"]', () => { S().settings.hideInstall = true; Store.save(); renderHoy(); });
    on('[data-act="dismiss-mig"]', () => { S().migrated.seen = true; Store.save(); renderHoy(); });

    if (d.step === 'review') {
      bindSrsCard(hoyRev, renderHoy);
      on('[data-act="skiprev"]', () => { d.step = 'learn'; Store.save(); renderHoy(); });
      return;
    }
    on('[data-act="prev"]', () => { d.idx--; Store.save(); renderHoy(); });
    on('[data-act="next"]', () => {
      if (d.idx < d.ids.length - 1) { d.idx++; Store.save(); renderHoy(); }
      else { d.step = 'quiz'; quiz = null; Store.save(); renderHoy(); }
      window.scrollTo({ top: 0 });
    });
    on('[data-act="more"]', () => {
      const ids = nextNew(S().settings.perDay);
      if (!ids.length) { toast('¡No quedan frases nuevas!'); return; }
      S().daily = { day: Store.today(), ids, step: 'learn', idx: 0, round: (d.round || 1) + 1 };
      quiz = null; Store.save(); renderHoy();
    });
    if (d.step === 'quiz' && quiz) {
      const ex = quiz.queue[0];
      bindExercise(ex, renderHoy, null, () => {
        const cur = quiz.queue.shift();
        if (!cur.ok) quiz.queue.push(makeExercise(cur.id, null, cur.stage)); else quiz.passed++;
        if (!quiz.queue.length) finishDaily(d);
        renderHoy();
      });
    }
  }
  function finishDaily(d) {
    d.ids.forEach((id) => SRS.addItem(id, 1));
    Store.logDay('learned', d.ids.length);
    markStudied();
    d.step = 'done'; quiz = null;
    Store.save();
    confetti();
  }

  function migrationBanner() {
    const m = S().migrated;
    if (!m || m.seen) return '';
    return `<div class="banner warn-banner">✨ <b>App renovada.</b> Ahora aprendes frases útiles con su desglose, en vez de palabras sueltas. Se han conservado <b>${m.kept}</b> de tus tarjetas${m.dropped ? ` y se ${m.dropped === 1 ? 'ha quitado 1 palabra suelta poco útil' : `han quitado ${m.dropped} palabras sueltas poco útiles`}` : ''}.
      <button class="link" data-act="dismiss-mig">Entendido</button></div>`;
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
    if (learned >= 15 && !(S().sync && S().sync.code) && (d === null || d >= 14)) {
      return `<a class="banner" href="#/perfil">💾 ${d === null ? 'Aún no has guardado ninguna copia' : `Tu última copia es de hace ${d} días`}. Activa la nube o haz una copia en Perfil.</a>`;
    }
    return '';
  }

  // ---------- REPASO ----------
  const revUI = { tab: 'dia', filter: 'all', q: '' };
  let rev = null, build = null, libre = null;

  function renderRepaso(sub) {
    if (sub && ['dia', 'construir', 'libre'].includes(sub)) revUI.tab = sub;
    const due = SRS.due().length;
    const tabs = `
      <div class="tabs">
        ${[['dia', `Del día${due ? ` (${due})` : ''}`], ['construir', '🧩 Construir'], ['libre', '🔁 Libre']].map(([id, l]) =>
          `<button class="${revUI.tab === id ? 'on' : ''}" data-rtab="${id}">${l}</button>`).join('')}
      </div>`;
    let body;
    if (revUI.tab === 'construir') body = buildBody();
    else if (revUI.tab === 'libre') body = libreBody();
    else body = diaBody();
    view.innerHTML = `${header('復習 <span class="h-es">Repaso</span>', 'Lo que no repasas, se olvida')}${tabs}${body}`;
    view.querySelectorAll('[data-rtab]').forEach((b) => b.addEventListener('click', () => {
      revUI.tab = b.dataset.rtab; history.replaceState(null, '', '#/repaso/' + revUI.tab); renderRepaso();
    }));
    if (revUI.tab === 'construir') bindBuild();
    else if (revUI.tab === 'libre') bindLibre();
    else bindDia();
    bindMyWords();
  }
  const rr = () => renderRepaso();

  // --- del día (SRS)
  function diaBody() {
    let mode = S().settings.reviewMode || 'mix';
    if (mode === 'audio' && !canSpeak) mode = 'mix';
    const side = mode === 'p' ? 'p' : mode === 'mix' ? undefined : 'r';
    if (!rev || rev.day !== Store.today() || rev.mode !== mode) rev = { ...newSession(SRS.due(side)), day: Store.today(), mode };
    SRS.due(side).forEach((k) => { if (!rev.queue.includes(k)) rev.queue.push(k); });
    rev.queue = rev.queue.filter(validKey);
    const nR = SRS.due('r').length, nP = SRS.due('p').length;
    const modeSwitch = `
      <div class="seg wide small-seg">
        ${[['mix', 'Mixto'], ['r', `👁️ Reconocer${nR ? ` ${nR}` : ''}`], ['p', `🗣️ Producir${nP ? ` ${nP}` : ''}`], ...(canSpeak ? [['audio', '🎧 Oído']] : [])].map(([m, l]) =>
          `<button class="${mode === m ? 'on' : ''}" data-mode="${m}">${l}</button>`).join('')}
      </div>`;
    if (!rev.queue.length) {
      const ids = Object.keys(S().srs).filter((id) => ITEMS[id]);
      const next = ids.length ? Math.min(...ids.map((id) => SRS.item(id).due)) - Store.today() : null;
      const otherDue = SRS.due().length;
      return `
        ${otherDue ? modeSwitch : ''}
        <div class="card center">
          <div class="big-emoji">${ids.length ? '✨' : '🌱'}</div>
          <h2>${ids.length ? (otherDue ? 'Nada en este modo' : '¡Todo repasado!') : 'Aún no hay nada que repasar'}</h2>
          <p class="muted">${ids.length
            ? (otherDue ? `Quedan <b>${otherDue}</b> en Mixto. ` : (rev.done ? `Has repasado ${rev.done} tarjeta${rev.done > 1 ? 's' : ''}. ` : '') + `Próximo repaso: ${next <= 0 ? 'hoy' : 'en ' + SRS.label(next)}.`)
            : 'Completa el reto de hoy y las frases aparecerán aquí.'}</p>
          ${ids.length && !otherDue ? `<p class="small">¿Quieres más? Practicar fuera de calendario también ayuda:</p>
            <div class="row-btns"><button class="btn ghost" data-rtab="construir">🧩 Construir</button><button class="btn primary" data-rtab="libre">🔁 Práctica libre</button></div>`
            : ids.length ? '' : '<a class="btn primary" href="#/hoy">Ir al reto de hoy</a>'}
        </div>
        ${ids.length ? myWords() : ''}`;
    }
    return `
      ${modeSwitch}
      <p class="step-label">Quedan <b>${rev.queue.length}</b> · Hechas ${rev.done}</p>
      ${srsCardHTML(rev)}
      ${mode === 'mix' ? '<p class="muted small center hint">Cada frase tiene dos memorias con su propio calendario: <b>reconocer</b> (leer u oír) y <b>producir</b> (decirla tú). Producir se desbloquea cuando ya la reconoces bien.</p>' : ''}`;
  }
  function bindDia() {
    view.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
      S().settings.reviewMode = b.dataset.mode; Store.save(); rr();
    }));
    if (rev && rev.queue.length) bindSrsCard(rev, rr);
  }

  // --- construir frases
  function startBuild() {
    const ids = learnedIds().filter((id) => canBuild(ITEMS[id]));
    const weak = SRS.weakest().filter((id) => ids.includes(id)).slice(0, 20);
    const chosen = sample(weak, 6); sample(ids.filter((id) => !chosen.includes(id)), 10 - chosen.length).forEach((id) => chosen.push(id));
    build = { queue: shuffle(chosen).map((id) => makeExercise(id, 'build')), total: chosen.length, ok: 0, fails: [] };
  }
  function buildBody() {
    const avail = learnedIds().filter((id) => canBuild(ITEMS[id])).length;
    if (avail < 2) return `<div class="card center"><div class="big-emoji">🧩</div><h2>Aún no hay frases para construir</h2><p class="muted">Aprende unas cuantas frases en el reto de Hoy y vuelve aquí para montarlas pieza a pieza.</p><a class="btn primary" href="#/hoy">Ir al reto de hoy</a></div>`;
    if (!build) return `
      <div class="card center">
        <div class="big-emoji">🧩</div><h2>Construir frases</h2>
        <p class="muted">Ves el español y montas la frase japonesa con las piezas. Es la mejor forma de que el orden de las palabras se te quede. Las que falles volverán antes en tu repaso.</p>
        <button class="btn primary wide" data-act="bstart">Empezar (${Math.min(10, avail)} frases)</button>
      </div>${myWords()}`;
    if (!build.queue.length) return `
      <div class="card center done-card">
        <div class="big-emoji">${build.fails.length ? '💪' : '🏅'}</div><h2>${build.ok} de ${build.total} a la primera</h2>
        <p class="muted">${build.fails.length ? 'Las falladas volverán mañana a tu repaso.' : '¡Perfecto!'}</p>
        <button class="btn primary wide" data-act="bstart">Otra ronda</button>
      </div>
      ${build.fails.length ? `<h3 class="section-title">Para repasar</h3><div class="mini-list">${build.fails.map((id) => miniRow(ITEMS[id])).join('')}</div>` : ''}`;
    return `
      <div class="quiz-progress"><div style="width:${((build.total - new Set(build.queue.map((e) => e.id)).size) / build.total) * 100}%"></div></div>
      ${exerciseHTML(build.queue[0])}`;
  }
  function bindBuild() {
    on('[data-act="bstart"]', () => { startBuild(); rr(); });
    if (!build || !build.queue.length) return;
    bindExercise(build.queue[0], rr, (ex) => {
      if (!ex.ok && !build.fails.includes(ex.id)) { build.fails.push(ex.id); SRS.miss(ex.id); Store.save(); }
      if (ex.ok && !build.fails.includes(ex.id)) build.ok++;
    }, () => {
      const cur = build.queue.shift();
      if (!cur.ok) build.queue.push(makeExercise(cur.id, 'build'));
      rr();
    });
  }

  // --- práctica libre
  const LIBRE_SRC = { weak: '😵 Las que más fallo', recent: '🆕 Recientes (7 días)', random: '🎲 Al azar' };
  function startLibre(src, unit) {
    const all = learnedIds();
    let ids = src === 'weak' ? SRS.weakest().filter((id) => ITEMS[id]).slice(0, 15)
      : src === 'recent' ? shuffle(SRS.recent(7).filter((id) => ITEMS[id])).slice(0, 15)
      : src === 'unit' ? shuffle(all.filter((id) => ITEMS[id].unit === unit)).slice(0, 15)
      : sample(all, 15);
    if (!ids.length) { toast('No hay frases en ese grupo'); return; }
    libre = { queue: shuffle(ids), total: ids.length, shown: false, dir: null, known: 0, missed: [], spoken: null, src, unit };
  }
  function libreBody() {
    const all = learnedIds();
    if (!all.length) return `<div class="card center"><div class="big-emoji">🌱</div><h2>Aún no has aprendido nada</h2><p class="muted">Haz el reto de hoy y aquí podrás repasar cuando quieras.</p><a class="btn primary" href="#/hoy">Ir al reto de hoy</a></div>`;
    if (!libre) {
      const units = UNITS.filter((u) => u.items.some((i) => S().srs[i.id]) && unitVisible(u));
      return `
        <div class="card">
          <h2 class="h2-sm">🔁 Práctica libre</h2>
          <p class="muted small">Repasa lo aprendido cuando quieras, aunque no toque. Si no te la sabes, se adelanta su repaso a mañana; si te la sabes, no cambia nada.</p>
          <div class="stack-btns">${Object.entries(LIBRE_SRC).map(([k, l]) => `<button class="btn ghost" data-libre="${k}">${l}</button>`).join('')}</div>
          <p class="muted small" style="margin-top:14px">Por unidad:</p>
          <div class="unit-chips">${units.map((u) => `<button class="cat" data-lunit="${u.id}">${u.icon} ${esc(u.name)}</button>`).join('')}</div>
        </div>
        ${myWords()}`;
    }
    if (!libre.queue.length) return `
      <div class="card center done-card">
        <div class="big-emoji">${libre.missed.length ? '💪' : '🏅'}</div>
        <h2>${libre.known} de ${libre.total} sabidas</h2>
        <p class="muted">${libre.missed.length ? `${libre.missed.length} volverán mañana a tu repaso.` : '¡Las dominas!'}</p>
        <div class="stack-btns">
          ${libre.missed.length ? '<button class="btn primary" data-act="lretry">Repetir las falladas</button>' : ''}
          <button class="btn ghost" data-act="lnew">Nueva sesión</button>
        </div>
      </div>
      ${libre.missed.length ? `<h3 class="section-title">Falladas</h3><div class="mini-list">${libre.missed.map((id) => miniRow(ITEMS[id])).join('')}</div>` : ''}`;
    const id = libre.queue[0]; const it = ITEMS[id];
    if (!libre.dir) { const r = Math.random(); libre.dir = r < 0.6 ? 'es' : r < 0.8 && canSpeak ? 'audio' : 'jp'; }
    const doneN = libre.total - new Set(libre.queue).size;
    const writing = libre.dir === 'es' && writeOn();
    if (writing && !libre.w) libre.w = {};
    const checked = writing && libre.w.check;
    const sugOk = checked ? writeOk(libre.w) : null;
    return `
      <div class="quiz-progress"><div style="width:${(doneN / libre.total) * 100}%"></div></div>
      <p class="step-label">${LIBRE_SRC[libre.src] || (UNIT[libre.unit] ? UNIT[libre.unit].icon + ' ' + esc(UNIT[libre.unit].name) : '')} · ${libre.queue.length} restantes</p>
      <article class="card center review-card">
        ${frontHTML(it, libre.dir)}
        ${libre.shown ? backHTML(it, libre.dir) : ''}
      </article>
      ${libre.shown ? `
        ${checked ? writeResultHTML(libre.w) : ''}
        <div class="row-btns even">
          <button class="btn ko-btn ${sugOk === false ? 'sug' : ''}" data-lres="0">❌ No la sabía</button>
          <button class="btn ok-btn ${sugOk === true ? 'sug' : ''}" data-lres="1">✅ La sabía</button>
        </div>`
      : writing ? `${writeBoxHTML(libre.w)}<button class="link center-link" data-act="lshow">Prefiero decirlo en voz alta y mirar</button>`
      : '<button class="btn primary wide" data-act="lshow">Mostrar respuesta</button>'}
      <button class="link center-link" data-act="lquit">Terminar sesión</button>`;
  }
  function bindLibre() {
    view.querySelectorAll('[data-libre]').forEach((b) => b.addEventListener('click', () => { startLibre(b.dataset.libre); rr(); }));
    view.querySelectorAll('[data-lunit]').forEach((b) => b.addEventListener('click', () => { startLibre('unit', b.dataset.lunit); rr(); }));
    on('[data-act="lnew"]', () => { libre = null; rr(); });
    on('[data-act="lquit"]', () => { libre.queue = []; rr(); });
    on('[data-act="lretry"]', () => { const m = libre.missed; libre = { ...libre, queue: shuffle(m), total: m.length, known: 0, missed: [], shown: false, dir: null, w: null }; rr(); });
    if (!libre || !libre.queue.length) return;
    const id = libre.queue[0]; const it = ITEMS[id];
    if (libre.dir === 'audio' && libre.spoken !== id && !libre.shown) { libre.spoken = id; Speech.speak(it.kana || it.jp); }
    const reveal = () => { libre.shown = true; rr(); Speech.speak(it.kana || it.jp); };
    on('[data-act="lshow"]', reveal);
    if (libre.w) bindWrite(libre.w, it, reveal, rr);
    view.querySelectorAll('[data-lres]').forEach((b) => b.addEventListener('click', () => {
      libre.w = null;
      const ok = b.dataset.lres === '1'; const cur = libre.queue.shift(); haptic();
      if (ok) { if (!libre.missed.includes(cur)) libre.known++; }
      else {
        if (!libre.missed.includes(cur)) { libre.missed.push(cur); SRS.miss(SRS.key(cur, libre.dir === 'es' ? 'p' : 'r')); Store.save(); }
        libre.queue.splice(Math.min(4, libre.queue.length), 0, cur); // vuelve en esta sesión
      }
      libre.shown = false; libre.dir = null; rr();
    }));
  }

  // --- mis frases
  const FILTERS = [['all', 'Todas'], ['hard', '⚠️ Difíciles'], ['aprendiendo', 'Aprendiendo'], ['madura', 'Madura'], ['dominada', 'Dominadas']];
  function myWords() {
    const entries = Object.keys(S().srs).filter((id) => ITEMS[id]);
    const t = Store.today();
    const f = revUI.q.toLowerCase();
    const list = entries
      .map((id) => ({ it: ITEMS[id], c: SRS.item(id) }))
      .filter(({ c }) => revUI.filter === 'all' || (revUI.filter === 'hard' ? c.hard : c.level === revUI.filter))
      .filter(({ it }) => !f || [it.jp, it.kana, it.romaji, it.es].some((x) => x.toLowerCase().includes(f)))
      .sort((a, b) => a.c.due - b.c.due);
    return `
      <h3 class="section-title">Mis frases <span class="muted">(${entries.length})</span></h3>
      <div class="unit-chips">${FILTERS.map(([k, l]) => `<button class="cat ${revUI.filter === k ? 'on' : ''}" data-wf="${k}">${l}</button>`).join('')}</div>
      <input class="search" id="wsearch" type="search" placeholder="Buscar…" value="${esc(revUI.q)}">
      <div class="mini-list">
        ${list.length ? list.map(({ it, c }) => miniRow(it, `<small class="lvl lvl-${c.level}">${c.hard ? '⚠️ ' : ''}${c.level}${c.hasP ? ' · 🗣️' : ''} · ${c.due - t <= 0 ? 'hoy' : SRS.label(c.due - t)}</small>`)).join('') : '<p class="muted center small">Nada por aquí.</p>'}
      </div>`;
  }
  function bindMyWords() {
    view.querySelectorAll('[data-wf]').forEach((b) => b.addEventListener('click', () => { revUI.filter = b.dataset.wf; rr(); }));
    const s = view.querySelector('#wsearch');
    if (!s) return;
    s.addEventListener('input', () => {
      revUI.q = s.value; const pos = s.selectionStart; rr();
      const s2 = view.querySelector('#wsearch'); if (s2) { s2.focus(); s2.setSelectionRange(pos, pos); }
    });
  }

  // ---------- NÚMEROS ----------
  const N = Numbers;
  const numUI = { tab: 'aprender', mode: 'dictado', range: 100, q: null, input: '', score: { ok: 0, n: 0 } };
  const NUM_MODES = [['dictado', '🎧 Dictado'], ['leer', '👀 Leer'], ['precios', '💴 Precios'], ['horas', '🕒 Horas'], ['contadores', '👥 Contadores']];

  function numStat() {
    const v = Object.values(S().nums || {}); const ok = v.reduce((a, x) => a + x.ok, 0), n = v.reduce((a, x) => a + x.n, 0);
    return { ok, n, pct: n ? Math.round((ok / n) * 100) : 0 };
  }
  function renderNumeros() {
    const st = numStat();
    const tabs = `<div class="seg wide">${[['aprender', '📖 Aprender'], ['practicar', '🎯 Practicar']].map(([id, l]) => `<button class="${numUI.tab === id ? 'on' : ''}" data-ntab="${id}">${l}</button>`).join('')}</div>`;
    view.innerHTML = `
      ${header('数 <span class="h-es">Números</span>', st.n ? `${st.pct}% de aciertos · ${st.n} ejercicios` : 'Precios, horas, edades y cantidades', `<div class="ring" style="--p:${st.pct}"><span>${st.pct}%</span></div>`)}
      ${tabs}
      ${numUI.tab === 'aprender' ? numLearn() : numPractice()}`;
    view.querySelectorAll('[data-ntab]').forEach((b) => b.addEventListener('click', () => { numUI.tab = b.dataset.ntab; renderNumeros(); }));
    if (numUI.tab === 'practicar') bindNumPractice();
  }

  function numRow(n, read, label, irregular) {
    return `<div class="nrow ${irregular ? 'irr' : ''}">${sayBtn(read.kana, 'say-sm')}<b class="nnum">${label}</b><span lang="ja" class="nkana">${esc(read.kana)}</span><span class="romaji">${esc(read.romaji)}</span></div>`;
  }
  function numLearn() {
    const C = N.COUNTERS;
    const basic = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const tens = [11, 15, 20, 37, 40, 70, 99];
    const huns = [100, 200, 300, 400, 500, 600, 700, 800, 900];
    const ths = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000];
    const big = [10000, 25000, 100000, 1000000, 10000000, 100000000];
    const irrH = [300, 600, 800], irrT = [3000, 8000];
    const ctrSamples = { tsu: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nin: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], en: [1, 4, 5, 10, 100, 500, 1000, 4000, 10000], ji: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], fun: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30], sai: [1, 3, 8, 10, 11, 18, 20, 21, 30], kai: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], gatsu: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] };
    const naive = (c, n) => { const r = C[c].read(n).kana; const plain = { tsu: null, nin: 'にん', en: 'えん', ji: 'じ', fun: 'ふん', sai: 'さい', kai: 'かい', gatsu: 'がつ' }[c]; return plain && N.toJa(n).kana + plain !== r; };
    const sec = (title, inner, open) => `<details class="card nsec" ${open ? 'open' : ''}><summary>${title}</summary>${inner}</details>`;
    return `
      <div class="tip">💡 Para hablar, lo que más vas a usar son <b>precios</b> (円), <b>horas</b> (時・分), <b>personas</b> (人) y <b>cantidades</b> (〜つ). Aprende 0-10, luego el truco del 万, y practica en 🎯.</div>
      ${sec('0 – 10: la base', `
        <p class="muted small">4, 7 y 9 tienen dos lecturas. En general usa <b>よん, なな, きゅう</b> (し suena a "muerte", く a "sufrimiento"). Pero en las horas y meses se usan las otras: よじ, しちじ, くじ.</p>
        <div class="nlist">${basic.map((n) => numRow(n, N.toJa(n), `${n} <small lang="ja">${N.toKanji(n)}</small>`)).join('')}</div>`, true)}
      ${sec('11 – 99: se construyen solos', `
        <p class="muted small">Como un puzle: 11 = 10+1 = じゅう いち · 20 = 2×10 = に じゅう · 37 = 3×10+7 = さんじゅう なな.</p>
        <div class="nlist">${tens.map((n) => numRow(n, N.toJa(n), `${n} <small lang="ja">${N.toKanji(n)}</small>`)).join('')}</div>`)}
      ${sec('Centenas y millares (con trampas)', `
        <p class="muted small">Los marcados cambian de sonido: さん<b>び</b>ゃく, ろっ<b>ぴ</b>ゃく, はっ<b>ぴ</b>ゃく, さん<b>ぜ</b>ん, はっ<b>せ</b>ん. 100 y 1000 se dicen sin "uno": ひゃく, せん.</p>
        <div class="nlist">${huns.map((n) => numRow(n, N.toJa(n), N.fmt(n), irrH.includes(n))).join('')}</div>
        <div class="nlist" style="margin-top:8px">${ths.map((n) => numRow(n, N.toJa(n), N.fmt(n), irrT.includes(n))).join('')}</div>`)}
      ${sec('El truco del 万 (10.000)', `
        <p class="muted small">En japonés se agrupa de <b>4 en 4 cifras</b>, no de 3. 10.000 tiene nombre propio: <b>万 (man)</b>. Así que 100.000 = 10 × 万 = じゅうまん, y 1 millón = 100 × 万 = ひゃくまん. Truco: tapa las 4 últimas cifras y lee lo que queda + まん.</p>
        <div class="nlist">${big.map((n) => numRow(n, N.toJa(n), N.fmt(n), false)).join('')}</div>`)}
      ${Object.entries(C).map(([k, c]) => sec(`${c.name}`, `
        <p class="muted small">${esc(c.hint)}</p>
        <div class="nlist">${ctrSamples[k].map((n) => numRow(n, c.read(n), `${esc(c.jp(n))} <small>${esc(c.es(n))}</small>`, naive(k, n))).join('')}</div>`)).join('')}
      ${sec('Días de la semana', `
        <p class="muted small">Todos acaban en 曜日 (youbi). Cada uno es un elemento: luna, fuego, agua, árbol, oro, tierra, sol.</p>
        <div class="nlist">${N.WEEKDAYS.map(([jp, kana, ro, es, el]) => `<div class="nrow">${sayBtn(kana, 'say-sm')}<b class="nnum" lang="ja">${jp}</b><span lang="ja" class="nkana">${kana}</span><span class="romaji">${ro}</span><small class="muted">${es} (${el})</small></div>`).join('')}</div>`)}
      <p class="legend"><span class="irr-dot"></span> lectura irregular: ¡la que más hay que practicar!</p>`;
  }

  // --- generación de preguntas
  function nearNumbers(n, max, count) {
    const out = new Set(); const s = String(n); let guard = 0;
    while (out.size < count && guard++ < 200) {
      let m; const r = Math.random();
      if (r < 0.45 && s.length) { const i = rand(0, s.length - 1); const d = rand(i === 0 ? 1 : 0, 9); m = +(s.slice(0, i) + d + s.slice(i + 1)); }
      else if (r < 0.6 && s.length > 1) { const i = rand(0, s.length - 2); m = +(s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2)); }
      else if (r < 0.75) m = Math.random() < 0.5 ? n * 10 : Math.floor(n / 10);
      else m = n + pick([-1, 1, -10, 10, -100, 100, 4, -4, 3]) * Math.max(1, 10 ** Math.max(0, s.length - 2));
      if (m > 0 && m !== n && m <= Math.max(max, 10) * 10) out.add(m);
    }
    return [...out];
  }
  function randNum(max) {
    if (max <= 10) return rand(0, 10);
    const r = Math.random(); // mezcla de redondos (los más habituales) y aleatorios
    if (r < 0.35) { const mag = pick([10, 100, 1000, 10000].filter((m) => m < max)); return rand(1, Math.floor(max / mag) || 1) * mag; }
    return rand(1, max);
  }
  const PRICES = [98, 100, 108, 120, 150, 180, 198, 220, 248, 298, 330, 398, 440, 480, 550, 600, 680, 780, 850, 980, 1080, 1280, 1500, 1680, 1980, 2400, 2980, 3500, 3800, 4500, 5800, 6400, 8800, 9800, 12800, 15000, 24800, 39800];
  function newNumQ() {
    const m = numUI.mode, C = N.COUNTERS;
    if (m === 'dictado') { const n = randNum(numUI.range); return { m, n, read: N.toJa(n) }; }
    if (m === 'leer') {
      const n = randNum(numUI.range);
      const opts = shuffle([n, ...nearNumbers(n, numUI.range, 3)]).map((x) => ({ v: x, ...N.toJa(x) }));
      return { m, n, read: N.toJa(n), show: N.fmt(n), sub: N.toKanji(n), opts };
    }
    if (m === 'precios') {
      const n = Math.random() < 0.7 ? pick(PRICES) : rand(1, 99) * 10;
      const opts = shuffle([n, ...nearNumbers(n, 50000, 3)]).map((x) => ({ v: x, ...C.en.read(x) }));
      return { m, n, read: C.en.read(n), show: '¥' + N.fmt(n).replace(/\./g, ','), sub: '¿Cuánto es?', opts };
    }
    if (m === 'horas') {
      const h = rand(1, 12), mi = pick([0, 0, 30, 30, 15, 45, rand(1, 59)]);
      const key = (a, b) => a * 100 + b;
      const set = new Map([[key(h, mi), [h, mi]]]);
      while (set.size < 4) { const hh = Math.random() < 0.6 ? pick([4, 7, 9, rand(1, 12)]) : h; const mm = Math.random() < 0.5 ? mi : pick([0, 30, 10, 20, 40, 1, 3, 6, 8]); set.set(key(hh, mm), [hh, mm]); }
      const opts = shuffle([...set.values()]).map(([a, b]) => ({ v: key(a, b), ...N.time(a, b) }));
      return { m, n: key(h, mi), read: N.time(h, mi), show: `${h}:${String(mi).padStart(2, '0')}`, sub: '¿Qué hora es?', opts };
    }
    // contadores
    const k = pick(['tsu', 'nin', 'nin', 'sai', 'fun', 'kai', 'gatsu', 'ji']); const c = C[k];
    const max = k === 'sai' ? 40 : k === 'fun' ? 30 : c.max;
    const n = rand(1, max);
    const vals = new Set([n]); while (vals.size < 4) vals.add(rand(1, max));
    const opts = [...vals].map((x) => ({ v: x, ...c.read(x) }));
    const naiveSuffix = { nin: ['にん', 'nin'], sai: ['さい', 'sai'], fun: ['ふん', 'fun'], kai: ['かい', 'kai'], gatsu: ['がつ', 'gatsu'], ji: ['じ', 'ji'] }[k];
    if (naiveSuffix) { // trampa: la forma "regular" que no existe
      const t = N.toJa(n); const trap = { v: -1, kana: t.kana + naiveSuffix[0], romaji: t.romaji + naiveSuffix[1] };
      if (trap.kana !== c.read(n).kana) opts[opts.findIndex((o) => o.v !== n)] = trap;
    }
    return { m, n, read: c.read(n), show: c.es(n), sub: c.jp(n), opts: shuffle(opts) };
  }

  function numPractice() {
    if (!numUI.q || numUI.q.m !== numUI.mode) { numUI.q = newNumQ(); numUI.input = ''; }
    const q = numUI.q; const st = (S().nums || {})[numUI.mode];
    const modes = `<div class="unit-chips">${NUM_MODES.map(([k, l]) => `<button class="cat ${numUI.mode === k ? 'on' : ''}" data-nmode="${k}">${l}</button>`).join('')}</div>`;
    const ranges = ['dictado', 'leer'].includes(numUI.mode) ? `<div class="seg wide small-seg">${[[10, '0-10'], [100, '1-100'], [1000, '1-1.000'], [100000, '1-100.000']].map(([v, l]) => `<button class="${numUI.range === v ? 'on' : ''}" data-nrange="${v}">${l}</button>`).join('')}</div>` : '';
    const reveal = q.ans != null ? `
      <div class="feedback ${q.ok ? 'ok' : 'ko'}">${q.ok ? '✅ ¡Correcto!' : '❌ Era:'}</div>
      <div class="card answer-card">${sayBtn(q.read.kana, 'say-sm')}<div><div class="ans-jp">${q.m === 'dictado' ? N.fmt(q.n) + ' · ' : ''}<span lang="ja">${esc(q.read.kana)}</span></div><div class="romaji">${esc(q.read.romaji)}</div></div></div>
      <button class="btn primary wide" data-act="nnext">Siguiente →</button>` : '';
    let main;
    if (q.m === 'dictado') {
      main = `
        <article class="card center kquiz">
          <div class="score">${numUI.score.ok}/${numUI.score.n}</div>
          <div class="listen-big">${sayBtn(q.read.kana, 'say-xl')}<p class="muted small">Escucha y escribe el número</p></div>
          <div class="num-input ${q.ans != null ? (q.ok ? 'ok' : 'ko') : ''}">${esc(numUI.input ? N.fmt(+numUI.input) : '…')}</div>
        </article>
        ${q.ans == null ? `<div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].map((k) => `<button class="key ${k === '✓' ? 'go' : ''}" data-key="${k}">${k}</button>`).join('')}</div>` : ''}`;
    } else {
      main = `
        <article class="card center kquiz">
          <div class="score">${numUI.score.ok}/${numUI.score.n}</div>
          <div class="num-show">${esc(q.show)}</div>
          <div class="muted" lang="ja">${esc(q.sub)}</div>
        </article>
        <div class="options">${q.opts.map((o, i) => {
          let cls = ''; if (q.ans != null) { if (o.v === q.n) cls = 'correct'; else if (i === q.ans) cls = 'wrong'; }
          return `<button class="opt ${cls}" data-nopt="${i}" ${q.ans != null ? 'disabled' : ''}><span lang="ja" class="opt-jp">${esc(o.kana)}</span><small class="romaji">${esc(o.romaji)}</small></button>`;
        }).join('')}</div>`;
    }
    return `${modes}${ranges}${main}${reveal}
      ${st ? `<p class="muted small center">En este modo: ${st.ok}/${st.n} (${Math.round((st.ok / st.n) * 100)}%)</p>` : ''}`;
  }
  function numAnswer(ok, ans) {
    const q = numUI.q; q.ans = ans; q.ok = ok;
    numUI.score.n++; if (ok) numUI.score.ok++;
    S().nums = S().nums || {}; const st = S().nums[q.m] || { ok: 0, n: 0 }; st.n++; if (ok) st.ok++; S().nums[q.m] = st;
    Store.logDay('reviews'); Store.save(); haptic();
    Speech.speak(q.read.kana); renderNumeros();
  }
  function bindNumPractice() {
    const q = numUI.q;
    if (q.m === 'dictado' && !q.spoken) { q.spoken = true; Speech.speak(q.read.kana); }
    view.querySelectorAll('[data-nmode]').forEach((b) => b.addEventListener('click', () => { numUI.mode = b.dataset.nmode; numUI.q = null; renderNumeros(); }));
    view.querySelectorAll('[data-nrange]').forEach((b) => b.addEventListener('click', () => { numUI.range = +b.dataset.nrange; numUI.q = null; renderNumeros(); }));
    view.querySelectorAll('[data-key]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.key;
      if (k === '⌫') numUI.input = numUI.input.slice(0, -1);
      else if (k === '✓') { if (numUI.input) return numAnswer(+numUI.input === q.n, numUI.input); }
      else if (numUI.input.length < 9) numUI.input = (numUI.input + k).replace(/^0+(?=\d)/, '');
      renderNumeros();
    }));
    view.querySelectorAll('[data-nopt]').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.nopt; numAnswer(q.opts[i].v === q.n, i); }));
    on('[data-act="nnext"]', () => { numUI.q = null; renderNumeros(); });
  }

  // ---------- KANA ----------
  // Cada kana es una tarjeta FSRS (kana[key].f). "Dominado" = lo recuerdas a más de una semana vista.
  const KANA_DONE_S = 7;
  const kanaUI = { script: 'h', tab: 'tabla', mode: 'k2r', q: null, sel: null, score: { ok: 0, n: 0 }, detail: null, dueMode: false };
  function kanaStat(key) { return S().kana[key] || { c: 0, w: 0, s: 0 }; }
  const kanaMem = (key) => (S().kana[key] || {}).f || null;
  const kanaDone = (key) => { const f = kanaMem(key); return !!(f && f.s >= KANA_DONE_S); };
  const kanaDueList = (sc) => allKana(sc).filter((k) => { const f = kanaMem(k.key); return f && f.due <= Store.today(); });
  function kanaClass(key) {
    const k = S().kana[key]; if (!k) return '';
    return kanaDone(key) ? 'm-done' : k.c + k.w > 0 ? 'm-learn' : '';
  }
  function selectedRows() {
    S().kanaSel = S().kanaSel || { h: ['a'], k: ['a'] };
    return S().kanaSel[kanaUI.script];
  }

  function renderKana() {
    const sc = kanaUI.script;
    const all = allKana(sc);
    const mastered = all.filter((k) => kanaDone(k.key)).length;
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
      <div class="legend"><span class="m-learn"></span> practicando <span class="m-done"></span> dominado (lo recuerdas a más de una semana vista)</div>`;
  }

  function rowMastery(sc, rowId) {
    const ks = allKana(sc).filter((k) => k.row === rowId);
    return ks.length ? ks.filter((k) => kanaDone(k.key)).length / ks.length : 0;
  }
  function kanaPractice(sc) {
    const sel = selectedRows();
    const allRows = [...KANA_ROWS, ...KANA_COMBOS];
    const dueList = kanaDueList(sc);
    if (kanaUI.dueMode && !dueList.length && !(kanaUI.q && kanaUI.q.ans != null)) { kanaUI.dueMode = false; kanaUI.q = null; }
    const pool = kanaUI.dueMode ? dueList : allKana(sc).filter((k) => sel.includes(k.row));
    if (!kanaUI.q && pool.length) kanaUI.q = newKanaQ(pool, sc);
    const q = kanaUI.q;
    const chips = allRows.map((row) => {
      const first = Array.isArray(row.kana) ? row.kana[0] : row.kana[0];
      const label = sc === 'k' ? toKatakana(first) : first;
      const p = rowMastery(sc, row.id);
      return `<button class="rchip ${sel.includes(row.id) ? 'on' : ''} ${p === 1 ? 'full' : ''}" data-row="${row.id}" style="--p:${p * 100}%"><span lang="ja">${label}</span></button>`;
    }).join('');
    return `
      ${kanaUI.dueMode ? `<div class="tip">🔁 <b>Repasando pendientes</b> · quedan ${dueList.length}. <button class="link" data-act="kdue-off">Volver a mis filas</button></div>`
        : `${dueList.length ? `<button class="btn primary wide" data-act="kdue">🔁 Repasar ${dueList.length} pendiente${dueList.length > 1 ? 's' : ''} (para no olvidarlos)</button>` : ''}
      <p class="muted small">Elige las filas que quieres practicar:</p>
      <div class="rchips">${chips}</div>`}
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
    // Peso: nuevos y los que más se te están olvidando (baja probabilidad de recordar) salen más
    const weighted = []; const t = Store.today();
    pool.forEach((k) => {
      const f = kanaMem(k.key);
      const w = !f ? 4 : 1 + Math.round((1 - FSRS.retrievability(t - f.last, f.s)) * 8) + (f.due <= t ? 3 : 0);
      for (let i = 0; i < w; i++) weighted.push(k);
    });
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
    return ITEMS_LIST.filter((v) => isHira(v.kana) && v.kana.length >= 2 && v.kana.length <= 8).map((v) => ({ jp: v.kana, r: v.romaji, es: v.es }));
  }
  function kanaRead(sc) {
    const pool = readPool(sc);
    if (!kanaUI.q || !kanaUI.q.read) {
      const w = pool[Math.floor(Math.random() * pool.length)];
      kanaUI.q = { read: true, w, opts: shuffle([w, ...sample(pool.filter((x) => x.r !== w.r), 3)]), ans: null };
    }
    const q = kanaUI.q;
    return `
      <p class="muted small">Lee la palabra y elige cómo se pronuncia. ${sc === 'h' ? 'Son palabras y frases de tu curso.' : 'Palabras extranjeras en katakana. ー alarga la vocal.'}</p>
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
      const t = Store.today(); // memoria FSRS del kana: acierto = Bien, fallo = Otra vez
      st.f = FSRS.options(st.f || { s: null, d: null }, t, S().settings.retention || 0.9)[ok ? 2 : 0];
      st.f.due = t + st.f.ivl;
      S().kana[q.k.key] = st; Store.logDay(ok ? 'ok' : 'fail'); Store.save();
      kanaUI.score.n++; if (ok) kanaUI.score.ok++;
      Speech.speak(q.k.ch); haptic();
      renderKana();
      if (ok) setTimeout(() => { if (kanaUI.q === q) { kanaUI.q = null; renderKana(); } }, 650);
    }));
    on('[data-act="knext"]', () => { kanaUI.q = null; renderKana(); });
    on('[data-act="kdue"]', () => { kanaUI.dueMode = true; kanaUI.q = null; renderKana(); });
    on('[data-act="kdue-off"]', () => { kanaUI.dueMode = false; kanaUI.q = null; renderKana(); });
    view.querySelectorAll('[data-ropt]').forEach((b) => b.addEventListener('click', () => {
      const q = kanaUI.q; q.ans = +b.dataset.ropt;
      kanaUI.score.n++; if (q.opts[q.ans].r === q.w.r) kanaUI.score.ok++;
      Speech.speak(q.w.jp); haptic(); renderKana();
    }));
    on('[data-act="rnext"]', () => { kanaUI.q = null; renderKana(); });
  }

  // ---------- FRASES (biblioteca) ----------
  const fr = { cat: 'saludos', q: '', learned: false };
  function renderFrases() {
    const units = UNITS.filter(unitVisible);
    if (fr.cat !== 'all' && !units.some((u) => u.id === fr.cat)) fr.cat = 'saludos';
    const cats = [{ id: 'all', name: 'Todas', icon: '🔎' }, ...units];
    const visible = ITEMS_LIST.filter((it) => unitVisible(UNIT[it.unit]));
    let list = fr.cat === 'all' ? visible : UNIT[fr.cat].items;
    const f = fr.q.trim().toLowerCase();
    if (f) list = list.filter((it) => [it.jp, it.kana, it.romaji, it.es].some((x) => x.toLowerCase().includes(f)));
    if (fr.learned) list = list.filter((it) => S().srs[it.id]);
    const u = UNIT[fr.cat];
    const nLearned = (u ? u.items : visible).filter((it) => S().srs[it.id]).length;
    view.innerHTML = `
      ${header('言葉 <span class="h-es">Frases</span>', `Tu biblioteca · ${visible.length} frases y palabras`)}
      <input class="search" id="fsearch" type="search" placeholder="Buscar en japonés, romaji o español…" value="${esc(fr.q)}">
      <div class="cats">${cats.map((x) => `<button class="cat ${fr.cat === x.id ? 'on' : ''} cat-${x.kind || ''}" data-cat="${x.id}">${x.icon} ${esc(x.name)}</button>`).join('')}</div>
      ${u ? `<p class="cat-desc">${esc(u.desc)}</p>` : ''}
      ${u && u.warn ? `<div class="tip warn">${esc(u.warn)}</div>` : ''}
      <div class="lib-bar"><span class="muted small">${nLearned} de ${(u ? u.items : visible).length} aprendidas</span>
        <button class="cat ${fr.learned ? 'on' : ''}" data-act="flearned">✓ Solo aprendidas</button></div>
      <div class="plist">
        ${list.length ? list.map(phraseCard).join('') : '<p class="muted center">Sin resultados.</p>'}
      </div>`;
    const activeCat = view.querySelector('.cats .cat.on');
    if (activeCat) activeCat.parentElement.scrollLeft = activeCat.offsetLeft - 16;
    view.querySelectorAll('[data-cat]').forEach((b) => b.addEventListener('click', () => { fr.cat = b.dataset.cat; renderFrases(); }));
    on('[data-act="flearned"]', () => { fr.learned = !fr.learned; renderFrases(); });
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
      <article class="pcard pc-${it.kind} pc-${it.unit}">
        <div class="pc-main">
          ${jpBlock(it, 'md')}
          <div class="pc-es">${esc(it.es)}</div>
          ${partsBlock(it)}
          ${it.note ? `<div class="pc-note">💡 ${esc(it.note)}</div>` : ''}
        </div>
        <div class="pc-actions">
          ${sayBtn(it.kana || it.jp)}
          <button class="add ${inSrs ? 'in' : ''}" data-add="${esc(it.id)}" ${inSrs ? 'disabled' : ''} aria-label="Añadir a repaso">${inSrs ? '✓' : '+'}</button>
        </div>
      </article>`;
  }

  // ---------- PERFIL ----------
  function renderPerfil() {
    const s = S(), set = s.settings, t = Store.today();
    const cards = Object.keys(s.srs).filter((id) => ITEMS[id]);
    const masteredW = cards.filter((id) => SRS.item(id).level === 'dominada').length;
    // Retención real: aciertos / repasos de los últimos 30 días
    const last30 = [...Array(30)].map((_, i) => s.log[t - i]).filter(Boolean);
    const okN = last30.reduce((a, l) => a + (l.ok || 0), 0), failN = last30.reduce((a, l) => a + (l.fail || 0), 0);
    const retPct = okN + failN >= 10 ? Math.round((okN / (okN + failN)) * 100) + '%' : '—';
    const hk = allKana('h').filter((k) => kanaDone(k.key)).length;
    const kk = allKana('k').filter((k) => kanaDone(k.key)).length;
    const total = ITEMS_LIST.filter((it) => unitVisible(UNIT[it.unit])).length;
    const ns = numStat();
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
        <div class="stat"><b>${retPct}</b><span>recuerdas (30 días, objetivo ${Math.round((set.retention || 0.9) * 100)}%)</span></div>
        <div class="stat"><b>🔢 ${ns.n ? ns.pct + '%' : '—'}</b><span>números (${ns.n} ejercicios)</span></div>
        <div class="stat"><b lang="ja">あ ${hk} · ア ${kk}</b><span>kana dominados</span></div>
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
        <label class="set"><span>Retención objetivo<small>Más alta = recuerdas más, pero repasas más a menudo</small></span>
          <select id="s-ret">${[[0.85, '85 %'], [0.9, '90 % (recomendado)'], [0.95, '95 %']].map(([v, l]) => `<option value="${v}" ${(set.retention || 0.9) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="set"><span>Escribir al producir<small>Escribes en romaji y la app lo corrige. Si lo quitas, solo lo dices y miras.</small></span>
          <input type="checkbox" class="switch" id="s-write" ${set.writeP !== false ? 'checked' : ''}></label>
        <label class="set"><span>Frases divertidas en el reto<small>Ligar, romántico, slang… (1 de cada 5)</small></span>
          <input type="checkbox" class="switch" id="s-fun" ${set.fun ? 'checked' : ''}></label>
        <label class="set"><span>Contenido +18<small>Picante y palabrotas fuertes (en el reto y la biblioteca)</small></span>
          <input type="checkbox" class="switch" id="s-adult" ${set.adult ? 'checked' : ''}></label>
        <label class="set"><span>Velocidad de voz <small id="rate-v">${set.rate.toFixed(2)}x</small></span>
          <span class="rate-wrap"><input type="range" id="s-rate" min="0.5" max="1.2" step="0.05" value="${set.rate}">${sayBtn('こんにちは、よろしくね', 'say-sm')}</span></label>
        <label class="set"><span>Tema</span>
          <select id="s-theme">${[['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Oscuro']].map(([v, l]) => `<option value="${v}" ${set.theme === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      </div>

      <h3 class="section-title">☁️ Guardar en la nube</h3>
      <div class="card">
        ${Sync.code ? `
          <p class="small"><b>Activada</b> · <span class="sync-st st-${Sync.status.state}">${syncLabel()}</span></p>
          <p class="muted small">Tu progreso se guarda solo en internet. Para usarlo en otro móvil o recuperarlo, pon este código en "Tengo un código":</p>
          <div class="code-box">${Sync.code.match(/.{1,4}/g).join('-')}</div>
          <div class="row-btns">
            <button class="btn ghost" data-act="copy-code">📋 Copiar</button>
            <button class="btn ghost" data-act="sync-now">🔄 Sincronizar</button>
          </div>
          <button class="link" data-act="sync-off">Desactivar en este móvil</button>` : `
          <p class="muted small">Guarda tu progreso en internet para no perderlo nunca y usarlo en varios dispositivos. Sin cuentas: solo un código secreto.</p>
          <div class="row-btns">
            <button class="btn ghost" data-act="sync-have">Tengo un código</button>
            <button class="btn primary" data-act="sync-on">Activar</button>
          </div>
          <div class="code-form" hidden>
            <input class="search" id="sync-code" placeholder="xxxx-xxxx-xxxx-xxxx-xxxx" autocapitalize="off" autocomplete="off" spellcheck="false">
            <button class="btn primary wide" data-act="sync-join">Recuperar mi progreso</button>
          </div>`}
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
    const resetDaily = () => { const d = s.daily; if (d && d.step === 'learn' && d.idx === 0) s.daily = null; };
    bind('#s-romaji', 'change', (e) => { set.romaji = e.target.checked; Store.save(); applySettings(); });
    bind('#s-perday', 'change', (e) => { set.perDay = +e.target.value; Store.save(); toast('Se aplicará en el próximo reto'); });
    bind('#s-ret', 'change', (e) => { set.retention = +e.target.value; Store.save(); toast('Se aplica a los próximos repasos'); });
    bind('#s-write', 'change', (e) => { set.writeP = e.target.checked; Store.save(); resetSessions(); });
    bind('#s-fun', 'change', (e) => { set.fun = e.target.checked; resetDaily(); Store.save(); });
    bind('#s-adult', 'change', (e) => { set.adult = e.target.checked; resetDaily(); Store.save(); });
    bind('#s-rate', 'input', (e) => { set.rate = +e.target.value; view.querySelector('#rate-v').textContent = set.rate.toFixed(2) + 'x'; Store.save(); });
    bind('#s-theme', 'change', (e) => { set.theme = e.target.value; Store.save(); applySettings(); });
    on('[data-act="export"]', async () => {
      set.lastBackup = Date.now(); Store.save();
      const name = `nihongo-diario-${new Date().toISOString().slice(0, 10)}.json`;
      const file = new File([Store.exportJSON()], name, { type: 'application/json' });
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
      try { Store.importJSON(await f.text()); resetSessions(); applySettings(); toast('Progreso importado ✓'); renderPerfil(); }
      catch (err) { toast('Archivo no válido'); }
    });
    on('[data-act="sync-on"]', async (e) => {
      e.target.disabled = true;
      try { await Sync.enable(); toast('Nube activada ✓'); } catch (err) { toast(err.message); }
      renderPerfil();
    });
    on('[data-act="sync-have"]', () => { view.querySelector('.code-form').hidden = false; view.querySelector('#sync-code').focus(); });
    on('[data-act="sync-join"]', async (e) => {
      const val = view.querySelector('#sync-code').value;
      if (Object.keys(s.srs).length && !confirm('Se sustituirá el progreso de este móvil por el guardado con ese código. ¿Seguir?')) return;
      e.target.disabled = true;
      try { await Sync.enable(val); resetSessions(); applySettings(); toast('Progreso recuperado ✓'); }
      catch (err) { toast(err.message); }
      renderPerfil();
    });
    on('[data-act="copy-code"]', async () => {
      try { await navigator.clipboard.writeText(Sync.code); toast('Código copiado ✓'); } catch (e) { toast('No se pudo copiar'); }
    });
    on('[data-act="sync-now"]', async () => { await syncNow(); renderPerfil(); });
    on('[data-act="sync-off"]', () => {
      if (confirm('Este móvil dejará de guardar en la nube (tus datos siguen allí). ¿Seguir?')) { Sync.disable(); renderPerfil(); }
    });
    on('[data-act="dayplus"]', () => { s.dayOffset = (s.dayOffset || 0) + 1; Store.save(); resetSessions(); toast('Simulando +' + s.dayOffset + ' días'); renderPerfil(); });
    on('[data-act="daynow"]', () => { s.dayOffset = 0; Store.save(); resetSessions(); renderPerfil(); });
    on('[data-act="reset"]', () => {
      if (confirm('¿Seguro? Se borrará TODO tu progreso.')) { Store.reset(); resetSessions(); applySettings(); toast('Progreso borrado'); renderPerfil(); }
    });
  }
  function resetSessions() { rev = null; quiz = null; hoyRev = null; build = null; libre = null; }

  // ---------- nube ----------
  function syncLabel() {
    const st = Sync.status, last = S().sync && S().sync.last;
    if (st.state === 'syncing') return 'sincronizando…';
    if (st.state === 'error' || st.state === 'unconfigured') return '⚠️ ' + st.msg;
    if (!last) return 'pendiente';
    const min = Math.round((Date.now() - last) / 60000);
    return '✓ guardado ' + (min < 1 ? 'ahora mismo' : min < 60 ? `hace ${min} min` : `hace ${Math.round(min / 60)} h`);
  }
  async function syncNow() {
    if (!Sync.code) return;
    const changed = await Sync.pull();
    if (changed) { resetSessions(); applySettings(); route(); }
  }
  Sync.onChange(() => {
    const el = document.querySelector('.sync-st');
    if (el) { el.textContent = syncLabel(); el.className = 'sync-st st-' + Sync.status.state; }
  });

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

  const ROUTES = { hoy: renderHoy, repaso: renderRepaso, frases: renderFrases, numeros: renderNumeros, kana: renderKana, perfil: renderPerfil };
  function route() {
    const [name, sub] = (location.hash.replace(/^#\/?/, '') || 'hoy').split('/');
    const fn = ROUTES[name] || renderHoy;
    document.querySelectorAll('.tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.route === (ROUTES[name] ? name : 'hoy')));
    fn(sub);
    updateBadge();
  }
  const origSave = Store.save;
  Store.save = function () { origSave(); updateBadge(); };

  window.addEventListener('hashchange', () => { route(); window.scrollTo({ top: 0 }); });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-say]');
    if (b) { e.preventDefault(); e.stopPropagation(); Speech.speak(b.dataset.say); b.classList.add('pulse'); setTimeout(() => b.classList.remove('pulse'), 400); }
  }, true);
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applySettings);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { route(); syncNow(); } });

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
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  syncNow();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
