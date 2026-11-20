// Nihongo Diario — app principal (router + vistas)
(function () {
  Store.load();
  const S = () => Store.s;
  const view = document.getElementById('view');

  // ---------- utilidades ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (a, n) => shuffle(a).slice(0, n);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const { ic, stamp } = Icons;
  // Sello de unidad: un kanji relacionado con el tema (挨 saludo, 食 comer…) en vez de un emoji
  const seal = (u, cls = '') => `<span class="seal seal-${u.kind || 'core'} ${cls}" lang="ja"${u.iconRead ? ` title="${esc(u.iconRead)}"` : ''}>${u.icon}</span>`;
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
        <div class="route-unit">${seal(r.cur)} ${esc(r.cur.name)}</div>
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
    return `<button class="say ${cls}" data-say="${esc(text)}" aria-label="Escuchar">${ic('speaker', '')}</button>`;
  }
  function jpBlock(it, size = 'xl') {
    const showKana = it.kana && it.kana !== it.jp;
    return `
      <div class="jp jp-${size}" lang="ja">${esc(it.jp)}</div>
      ${showKana ? `<div class="kana" lang="ja">${esc(it.kana)}</div>` : ''}
      <div class="romaji">${esc(it.romaji)}</div>`;
  }
  function unitChip(it) { const u = UNIT[it.unit]; return `<span class="chip chip-${u.kind} chip-${u.id}">${seal(u, 'seal-sm')} ${esc(u.name)}</span>`; }
  function partsBlock(it) {
    if (!it.parts) return '';
    return `<div class="parts" title="Desglose palabra a palabra">${it.parts.map(([j, e]) => `<span class="part"><b lang="ja">${esc(j)}</b><small>${esc(e)}</small></span>`).join('')}</div>`;
  }
  function noteBlock(it, cls = '') { return it.note ? `<div class="note ${cls}">${ic('bulb')}<span>${esc(it.note)}</span></div>` : ''; }
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
    return `<div class="streak ${n ? 'on' : ''}" title="Racha de días">${ic('flame')} <b>${n}</b></div>`;
  }
  function miniRow(it, extra = '') {
    return `<div class="mini-row">${sayBtn(it.kana || it.jp, 'say-sm')}<div class="mini-jp" lang="ja">${esc(it.jp)}<small class="romaji">${esc(it.romaji)}</small></div><div class="mini-es">${esc(it.es)}${extra}</div></div>`;
  }

  // ---------- escribir en japonés (romaji → kana, js/romaji.js) ----------
  const writeOn = () => S().settings.writeP !== false;
  function writeBoxHTML(w) {
    if (!w.t0) w.t0 = Date.now();
    return `
      <div class="write">
        <input id="wr-in" class="write-in" type="text" lang="en" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" enterkeyhint="done" placeholder="Escribe en romaji (o en kana)…" value="${esc(w.typed || '')}">
        <div class="write-prev" id="wr-prev" lang="ja" aria-live="polite">${esc(Romaji.toKana(w.typed || '')) || '&nbsp;'}</div>
      </div>`;
  }
  const writeFoot = () => `<div class="row-btns"><button class="btn ghost" data-act="wr-skip">No lo sé</button><button class="btn primary" data-act="wr-go">Comprobar</button></div>`;
  // Respuesta correcta en una línea: japonés, kana y romaji con su audio
  function ansLine(t) {
    const jp = t.jp || t.kana;
    return `<div class="ans-line">${sayBtn(t.kana || jp, 'say-sm')}<div><b lang="ja">${esc(jp)}</b>${t.kana && t.kana !== jp ? ` <span lang="ja" class="muted">${esc(t.kana)}</span>` : ''}<div class="romaji">${esc(t.romaji)}</div></div></div>`;
  }
  // Lo que escribiste (verde / ámbar / rojo) y, si no era, la respuesta correcta
  function writeResultHTML(w, target) {
    const c = w.check; const res = c.override ? 'ok' : ['ok', 'near'].includes(c.res) ? c.res : 'ko';
    const hint = c.res === 'near' && !c.override ? (c.why === 'long' ? 'Ojo a las vocales largas y a la っ.' : 'Se te ha escapado una letra.') : '';
    return `
      <div class="write-res res-${res}" lang="ja">${c.got ? esc(c.got) : '—'}</div>
      ${res !== 'ok' ? ansLine(target) : ''}
      ${hint ? `<p class="muted small center tight">${hint}</p>` : ''}
      ${(c.res === 'near' || c.res === 'ko') && !c.override ? `<button class="link center-link tight" data-act="wr-ok">${c.res === 'near' ? 'Fue un despiste: cuéntala como bien' : 'Mi respuesta también vale'}</button>` : ''}`;
  }
  // onDone(check) al comprobar · onOverride() si dices que tu respuesta valía
  function bindWrite(w, target, onDone, rerender, onOverride, checker) {
    const inp = view.querySelector('#wr-in');
    if (inp) {
      const prev = view.querySelector('#wr-prev');
      try { inp.focus({ preventScroll: true }); } catch (e) { /* sin foco */ }
      inp.addEventListener('input', () => { w.typed = inp.value; prev.textContent = Romaji.toKana(inp.value) || ' '; });
      const go = () => {
        if (!inp.value.trim()) { inp.focus(); return; }
        w.check = { ...(checker ? checker(inp.value) : Romaji.check(inp.value, target)), ms: Date.now() - w.t0 }; haptic(); onDone(w.check);
      };
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
      on('[data-act="wr-go"]', go);
      on('[data-act="wr-skip"]', () => { w.check = { res: 'skip', got: '' }; onDone(w.check); });
    }
    on('[data-act="wr-ok"]', () => { w.check.override = true; onOverride && onOverride(); rerender(); });
  }

  // ---------- pantalla de test (modo enfoque) ----------
  // Sin cabecera ni barra inferior; arriba ✕ y el progreso, abajo el botón de acción siempre en el mismo sitio.
  // Al acertar se pasa sola a la siguiente; al fallar espera a que pulses Siguiente.
  const ADVANCE_MS = 950;
  let advTimer = null;
  function clearAdvance() { clearTimeout(advTimer); advTimer = null; }
  function autoAdvance(fn) { clearAdvance(); advTimer = setTimeout(() => { advTimer = null; fn(); }, ADVANCE_MS); }
  function paint(html, focus = false) {
    clearAdvance();
    document.body.classList.toggle('quizzing', focus);
    view.innerHTML = html;
  }
  function focusHTML({ done, total, label, body, foot }) {
    return `
      <div class="qz">
        <div class="qz-top">
          <button class="qz-x" data-act="qz-quit" aria-label="Salir">✕</button>
          <div class="quiz-progress"><div style="width:${total ? Math.min(100, (done / total) * 100) : 0}%"></div></div>
          <span class="qz-count">${Math.min(done, total)}/${total}</span>
        </div>
        ${label ? `<p class="qz-label">${label}</p>` : ''}
        <div class="qz-body">${body}</div>
        <div class="qz-foot">${foot || ''}</div>
      </div>`;
  }
  const nextBtn = (act = 'exnext') => `<button class="btn primary" data-act="${act}">Siguiente →</button>`;
  // Resumen al acabar una ronda
  function endHTML(run, sub, btns, missedHTML) {
    const n = run.total, ok = run.firstOk;
    return `
      <div class="card center done-card">
        ${stamp(ok === n ? '優' : ok >= n * 0.7 ? '良' : '練')}
        <h2>${ok} de ${n} a la primera</h2>
        ${sub ? `<p class="muted">${sub}</p>` : ''}
        <div class="stack-btns">${btns}</div>
      </div>
      ${missedHTML ? `<h3 class="section-title">Para repasar</h3>${missedHTML}` : ''}`;
  }
  const missedRows = (run) => (run.missed.length ? `<div class="mini-list">${run.missed.filter((id) => ITEMS[id]).map((id) => miniRow(ITEMS[id])).join('')}</div>` : '');

  // ---------- ejercicios ----------
  // Piezas para construir: palabras en japonés del desglose si lo hay; si no, romaji
  const kanaTiles = (it) => !!(it.parts && it.parts.length >= 2);
  const romajiTokens = (it) => it.romaji.replace(/[!?.…,~、。！？]/g, ' ').split(/\s+/).filter(Boolean);
  const tokens = (it) => (kanaTiles(it) ? it.parts.map(([j]) => j) : romajiTokens(it));
  const canBuild = (it) => !it.jp.includes('〜') && tokens(it).length >= 2 && tokens(it).length <= 8;

  // Distractores: primero de la misma unidad, y nunca uno que se confunda con la respuesta
  function distractors(it, n, key) {
    const seen = new Set([it[key]]);
    const same = shuffle(UNIT[it.unit].items), rest = shuffle(ITEMS_LIST.filter((x) => x.kind === it.kind || x.kind === 'core'));
    const out = [];
    for (const x of [...same, ...rest]) {
      if (out.length >= n) break;
      if (x.id === it.id || seen.has(x[key]) || Quiz.similar(x, it) || out.some((o) => Quiz.similar(ITEMS[o], x))) continue;
      if (!unitVisible(UNIT[x.unit])) continue;
      seen.add(x[key]); out.push(x.id);
    }
    return out;
  }
  // type: meaning (JP → significado) · reverse (español → elegir JP) · listen (audio → significado) · build · write
  function makeExercise(id, type, stage = 'rec') {
    const it = ITEMS[id];
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
  // Tipo de pregunta según la memoria: cuanto más afianzada, más difícil (reconocer → oír → elegir → construir → escribir)
  function reviewType(k, mode) {
    const { id, side } = SRS.parse(k); const it = ITEMS[id];
    const c = SRS.state(k); const s = (c && c.s) || 0;
    if (side === 'p') {
      if (s >= 7) return writeOn() ? 'write' : canBuild(it) ? 'build' : 'reverse';
      return canBuild(it) && Math.random() < 0.5 ? 'build' : 'reverse';
    }
    if (canSpeak && (mode === 'audio' || (s >= 3 && Math.random() < 0.5))) return 'listen';
    return 'meaning';
  }
  function reviewExercise(k, mode) {
    const { id, side } = SRS.parse(k);
    const ex = makeExercise(id, reviewType(k, mode), side === 'p' ? 'prod' : 'rec');
    ex.k = k; return ex;
  }
  // Nota FSRS automática a partir de la respuesta
  function gradeOf(ex) {
    const it = ITEMS[ex.id]; const c = ex.w && ex.w.check;
    return Quiz.autoGrade({ type: ex.type, ok: ex.ok, near: ex.near, override: !!(c && c.override), ms: c && c.ms != null ? c.ms : ex.ms, len: [...(it.kana || it.jp)].length });
  }
  const PROMPT = { meaning: '¿Qué significa?', reverse: '¿Cómo se dice en japonés?', listen: 'Escucha: ¿qué significa?', build: 'Ordena las piezas en japonés', write: 'Escríbelo en japonés (y dilo en voz alta)' };
  const shortOpts = (labels) => labels.every((l) => [...l].length <= 14);

  // Devuelve { prompt, body, foot } para la pantalla de test
  function exerciseHTML(ex) {
    const it = ITEMS[ex.id];
    if (!ex.t0) ex.t0 = Date.now();
    const long = [...it.jp].length > 6;
    let front, answer = '', foot;
    if (ex.type === 'meaning') front = `<div class="card-top end">${sayBtn(it.kana || it.jp, 'say-lg')}</div>${jpBlock(it, long ? 'lg' : 'xl')}`;
    else if (ex.type === 'listen') front = `<div class="listen-big">${sayBtn(it.kana || it.jp, 'say-xl')}${ex.answered ? '' : '<p class="muted small">Toca para volver a oírlo</p>'}</div>${ex.answered ? jpBlock(it, 'md') : ''}`;
    else front = `<div class="meaning big">${esc(it.es)}</div>`;

    if (ex.type === 'build') {
      const placed = ex.picked.map((i) => ex.pool[i]);
      const lang = ex.kana ? ' lang="ja"' : '';
      answer = `
        <div class="build-line ${ex.answered ? (ex.ok ? 'ok' : 'ko') : ''}">${placed.length ? ex.picked.map((pi, k) => `<button class="tile in ${ex.kana ? 'tile-ja' : ''}"${lang} data-unpick="${k}" ${ex.answered ? 'disabled' : ''}>${esc(ex.pool[pi])}</button>`).join('') : '<span class="muted small">Toca las piezas en orden…</span>'}</div>
        ${ex.answered ? (ex.ok ? '' : ansLine(it)) : `<div class="tiles">${ex.pool.map((t, i) => `<button class="tile ${ex.kana ? 'tile-ja' : ''} ${ex.picked.includes(i) ? 'used' : ''}"${lang} data-tile="${i}" ${ex.picked.includes(i) ? 'disabled' : ''}>${esc(t)}</button>`).join('')}</div>`}`;
      foot = ex.answered ? nextBtn() : ex.picked.length ? '<button class="btn ghost" data-act="bclear">Borrar</button>' : '<button class="btn ghost" data-act="ex-idk">No lo sé</button>';
    } else if (ex.type === 'write') {
      answer = ex.answered ? writeResultHTML(ex.w, it) : writeBoxHTML(ex.w);
      foot = ex.answered ? nextBtn() : writeFoot();
    } else {
      const labels = ex.opts.map((oid) => (ex.type === 'reverse' ? ITEMS[oid].jp : ITEMS[oid].es));
      answer = `<div class="options ${shortOpts(labels) ? 'grid2' : ''}">${ex.opts.map((oid) => {
        const o = ITEMS[oid]; let cls = '';
        if (ex.answered) { if (oid === ex.id) cls = 'correct'; else if (oid === ex.answered) cls = 'wrong'; }
        const label = ex.type === 'reverse' ? `<span lang="ja" class="opt-jp">${esc(o.jp)}</span><small class="romaji">${esc(o.romaji)}</small>` : esc(o.es);
        return `<button class="opt ${cls}" data-opt="${esc(oid)}" ${ex.answered ? 'disabled' : ''}>${label}</button>`;
      }).join('')}</div>
      ${ex.answered && !ex.ok && it.note ? `<p class="note-mini">${ic('bulb')} ${esc(it.note)}</p>` : ''}`;
      foot = ex.answered ? nextBtn() : '<button class="btn ghost" data-act="ex-idk">No lo sé</button>';
    }
    return { prompt: PROMPT[ex.type], body: `<article class="card center quiz-card">${front}</article>${answer}`, foot };
  }
  // onNext() al pasar a la siguiente (sola al acertar, o con Siguiente)
  function bindExercise(ex, rerender, onNext) {
    const it = ITEMS[ex.id];
    if (ex.type === 'listen' && !ex.spoken) { ex.spoken = true; Speech.speak(it.kana || it.jp); }
    const next = () => { clearAdvance(); onNext(); };
    const answered = (ok, choice, near = false) => {
      if (ex.answered) return;
      ex.answered = choice; ex.ok = ok; ex.near = near && !ok; ex.ms = Date.now() - (ex.t0 || Date.now()); haptic();
      Speech.speak(it.kana || it.jp);
      rerender();
      if (ok) autoAdvance(next);
    };
    if (ex.type === 'write') bindWrite(ex.w, it, (c) => answered(c.res === 'ok', true, c.res === 'near'), rerender, () => { ex.ok = true; ex.near = false; });
    view.querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', () => answered(b.dataset.opt === ex.id, b.dataset.opt)));
    view.querySelectorAll('[data-tile]').forEach((b) => b.addEventListener('click', () => {
      ex.picked.push(+b.dataset.tile);
      if (ex.picked.length === ex.tokens.length) answered(ex.picked.map((i) => ex.pool[i]).join(' ') === ex.tokens.join(' '), true);
      else rerender();
    }));
    view.querySelectorAll('[data-unpick]').forEach((b) => b.addEventListener('click', () => { ex.picked.splice(+b.dataset.unpick, 1); rerender(); }));
    on('[data-act="bclear"]', () => { ex.picked = []; rerender(); });
    on('[data-act="ex-idk"]', () => answered(false, 'idk'));
    on('[data-act="exnext"]', next);
  }

  // ---------- sesiones de test (Hoy, Repaso, Libre, Construir) ----------
  // requeue: 'soon' = la fallada vuelve a 3 tarjetas · 'end' = al final
  const newRun = (exs, requeue = 'soon') => ({ queue: exs, total: exs.length, passed: 0, firstOk: 0, missed: [], requeue });
  function runScreen(run, prefix = '') {
    const x = exerciseHTML(run.queue[0]);
    return focusHTML({ done: run.passed, total: run.total, label: prefix + x.prompt, body: x.body, foot: x.foot });
  }
  // h: { onCommit(ex) al dejar cada ejercicio, remake(ex) para repetir una fallada, onFinish(), onQuit() }
  function bindRun(run, rerender, h) {
    const commit = () => {
      const cur = run.queue.shift();
      h.onCommit && h.onCommit(cur);
      if (!cur.ok && !cur.near) {
        if (!run.missed.includes(cur.id)) run.missed.push(cur.id);
        const n = h.remake(cur); n.retry = true;
        run.queue.splice(run.requeue === 'end' ? run.queue.length : Math.min(3, run.queue.length), 0, n);
      } else { run.passed++; if (cur.ok && !cur.retry) run.firstOk++; }
      Store.save();
      if (!run.queue.length && h.onFinish) h.onFinish();
    };
    on('[data-act="qz-quit"]', () => { clearAdvance(); if (run.queue[0] && run.queue[0].answered) commit(); h.onQuit && h.onQuit(); rerender(); window.scrollTo({ top: 0 }); });
    if (!run.queue.length) return;
    bindExercise(run.queue[0], rerender, () => { commit(); rerender(); window.scrollTo({ top: 0 }); });
  }

  // Racha: cuenta el día si terminas el reto o te pones al día con el repaso
  function markStudied() {
    const st = S().streak, t = Store.today();
    if (st.last !== t) { st.count = st.last === t - 1 ? st.count + 1 : 1; st.last = t; st.best = Math.max(st.best || 0, st.count); }
  }
  const validKey = (k) => !!(k && ITEMS[SRS.parse(k).id] && SRS.state(k));
  const gradeReview = (ex) => { if (validKey(ex.k)) SRS.grade(ex.k, gradeOf(ex)); };

  // ---------- HOY ----------
  // Tres pestañas que puedes pulsar cuando quieras: Repaso · Nuevas · Test. Cada una guarda por dónde ibas.
  // d.step = pestaña abierta ('review' | 'learn' | 'quiz') o 'done' (resumen del reto).
  // d.revDone = repaso del día hecho · d.seenAll = has visto todas las nuevas · d.learned = reto completado.
  let quiz = null, hoyRev = null;
  const BACKLOG_MAX = 60;
  const HOY_REVIEW_MAX = 20;
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
    if (d2.step === 'done') d2.learned = true; // retos guardados antes de las pestañas
    if (!d2.learned) {
      const filtered = d2.ids.filter((id) => !S().srs[id] && ITEMS[id]);
      if (filtered.length !== d2.ids.length) { d2.ids = filtered; d2.idx = Math.min(d2.idx, Math.max(0, filtered.length - 1)); quiz = null; Store.save(); }
    }
    d2.ids = d2.ids.filter((id) => ITEMS[id]);
    d2.idx = Math.min(d2.idx || 0, Math.max(0, d2.ids.length - 1));
    return d2;
  }
  // Test de las nuevas: ronda 1 reconocer (opción múltiple u oído), ronda 2 producir (construir o elegir; escribir si es corta)
  function newQuizExercise(id, stage) {
    const it = ITEMS[id];
    if (stage === 'rec') return makeExercise(id, canSpeak && Math.random() < 0.35 ? 'listen' : 'meaning', 'rec');
    const short = [...(it.kana || it.jp)].length <= 8;
    return makeExercise(id, writeOn() && short && Math.random() < 0.5 ? 'write' : canBuild(it) ? 'build' : 'reverse', 'prod');
  }
  function newHoyQuiz(d) {
    const q = newRun([...shuffle(d.ids).map((id) => newQuizExercise(id, 'rec')), ...shuffle(d.ids).map((id) => newQuizExercise(id, 'prod'))], 'end');
    q.practice = !!d.learned; // después del reto: ronda de práctica (no vuelve a añadir las frases)
    return q;
  }
  function reviewDone(d) {
    d.revDone = true; hoyRev = null;
    if (!SRS.due().length) markStudied();
    d.step = d.learned ? 'done' : 'learn';
    Store.save();
  }
  function goPhase(d, step, start = false) {
    d.step = step;
    if (step === 'quiz') { if (!quiz) quiz = newHoyQuiz(d); if (start) quiz.started = true; }
    Store.save(); renderHoy(); window.scrollTo({ top: 0 });
  }

  function phaseBar(d) {
    const due = SRS.due().length;
    const has = d.ids.length > 0;
    const tabs = [
      ['review', 'Repaso', due ? String(due) : '', !due, d.revDone || !due],
      ['learn', 'Nuevas', has ? String(d.ids.length) : '', !has, d.seenAll || d.learned],
      ['quiz', 'Test', '', !has, d.learned],
    ];
    return `<div class="phase" role="tablist">${tabs.map(([k, l, n, off, done]) => {
      const on = d.step === k;
      return `<button role="tab" class="${on ? 'on' : done ? 'done' : ''}" data-phase="${k}" ${off && !on ? 'disabled' : ''} aria-selected="${on}">${done && !on ? ic('check') : ''}${l}${n ? ` <small>${n}</small>` : ''}</button>`;
    }).join('')}</div>`;
  }

  function renderHoy() {
    const d = ensureDaily();
    const learned = learnedIds().length;
    if (d.step === 'review') {
      if (!hoyRev) hoyRev = newRun(SRS.due().slice(0, HOY_REVIEW_MAX).map((k) => reviewExercise(k)));
      hoyRev.queue = hoyRev.queue.filter((ex) => validKey(ex.k));
      if (!hoyRev.queue.length) reviewDone(d);
    }
    if (d.step === 'quiz' && !d.ids.length) d.step = d.learned ? 'done' : 'learn';
    if (d.step === 'quiz' && !quiz) quiz = newHoyQuiz(d);
    // Pantallas de test (✕ vuelve a Hoy sin perder por dónde ibas)
    if (d.step === 'review' && hoyRev.started) {
      paint(runScreen(hoyRev, 'Repaso · '), true);
      bindRun(hoyRev, renderHoy, { onCommit: gradeReview, remake: (ex) => reviewExercise(ex.k), onFinish: () => reviewDone(d), onQuit: () => { if (hoyRev) hoyRev.started = false; } });
      return;
    }
    if (d.step === 'quiz' && quiz.started) {
      const pre = quiz.practice ? 'Práctica · ' : quiz.queue[0].stage === 'prod' ? 'Ahora tú · ' : '';
      paint(runScreen(quiz, pre), true);
      bindRun(quiz, renderHoy, {
        onCommit: (ex) => { if (quiz.practice && !ex.ok && !ex.near && !ex.retry) SRS.miss(ex.id); },
        remake: (ex) => newQuizExercise(ex.id, ex.stage),
        onFinish: () => { if (quiz.practice) { d.step = 'done'; quiz = null; Store.save(); } else finishDaily(d); },
        onQuit: () => { if (quiz) quiz.started = false; },
      });
      return;
    }

    const due = SRS.due().length;
    let body = '';
    if (d.step === 'review') {
      body = `
        <div class="card center">
          ${stamp('復')}
          <h2>Repaso</h2>
          <p class="muted">Recuerda lo que ya sabes antes de aprender nada nuevo: <b>${hoyRev.queue.length}</b> pregunta${hoyRev.queue.length > 1 ? 's' : ''} tipo test.</p>
          <button class="btn primary wide" data-act="revgo">${hoyRev.passed ? `Seguir (${hoyRev.passed}/${hoyRev.total})` : 'Empezar'}</button>
        </div>`;
    } else if (!d.ids.length && d.paused) {
      body = `
        <div class="card center">
          ${stamp('復')}<h2>Hoy toca ponerse al día</h2>
          <p class="muted">Tienes <b>${due}</b> repasos pendientes. Para no olvidar lo que ya sabes, hoy no hay frases nuevas hasta que bajen de ${BACKLOG_MAX}.</p>
          <div class="stack-btns">
            ${due ? `<button class="btn primary" data-phase="review">Repasar (${due})</button>` : ''}
            <button class="btn ghost" data-act="more">Aprender ${S().settings.perDay} nuevas igualmente</button>
          </div>
        </div>`;
    } else if (!d.ids.length) {
      body = `<div class="card center">${stamp('極')}<h2>¡Has completado la Ruta!</h2><p class="muted">No quedan frases nuevas. Sigue repasando para no olvidarlas.</p><a class="btn primary" href="#/repaso">Ir a repaso</a></div>`;
    } else if (d.step === 'quiz') {
      const n = d.ids.length;
      body = `
        <div class="card center">
          ${stamp(quiz.practice ? '練' : '試')}
          <h2>${quiz.practice ? 'Practicar las de hoy' : 'Test de las nuevas'}</h2>
          <p class="muted">${quiz.practice
            ? `Otra ronda con las ${n} frases de hoy. Si fallas una, se adelanta su repaso.`
            : `${n} frase${n > 1 ? 's' : ''} en 2 rondas: primero reconocerlas y después decirlas tú.${d.seenAll ? '' : ' Aún no las has visto todas: puedes hacerlo igualmente.'}`}</p>
          <button class="btn primary wide" data-act="qgo">${quiz.passed ? `Seguir (${quiz.passed}/${quiz.total})` : 'Empezar'}</button>
        </div>`;
    } else if (d.step === 'learn') {
      const it = ITEMS[d.ids[d.idx]];
      const last = d.idx === d.ids.length - 1;
      body = `
        ${d.idx === 0 && !d.learned ? routeCard() : ''}
        <div class="progress-dots">${d.ids.map((_, i) => `<span class="${i < d.idx ? 'done' : i === d.idx ? 'cur' : ''}"></span>`).join('')}</div>
        <p class="step-label">Nueva ${d.idx + 1} de ${d.ids.length} · escúchala y repítela en voz alta</p>
        ${fullCard(it)}
        <div class="row-btns">
          <button class="btn ghost" data-act="prev" ${d.idx === 0 ? 'disabled' : ''}>← Atrás</button>
          <button class="btn primary" data-act="next">${last ? (d.learned ? 'Practicar con un test' : 'Hacer el test') : 'Siguiente →'}</button>
        </div>`;
    } else {
      body = `
        <div class="card center done-card">
          ${stamp('完')}
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
          ${due ? `<button class="btn primary" data-phase="review">Repasar (${due})</button>` : ''}
          ${learnedIds().filter((id) => canBuild(ITEMS[id])).length >= 3 ? `<a class="btn ghost" href="#/repaso/construir">${ic('blocks')} Construir frases (2 min)</a>` : ''}
          <a class="btn ghost" href="#/numeros">${ic('hash')} Practicar números</a>
          <button class="btn ghost" data-act="more">+ Aprender ${S().settings.perDay} más</button>
        </div>`;
    }

    paint(`
      ${header('今日 <span class="h-es">Hoy</span>', `Reto diario · ${learned} aprendidas`, streakPill())}
      ${migrationBanner() || safetyBanner(learned)}
      ${d.ids.length || due ? phaseBar(d) : ''}
      ${body}`);
    on('[data-act="dismiss-install"]', () => { S().settings.hideInstall = true; Store.save(); renderHoy(); });
    on('[data-act="dismiss-mig"]', () => { S().migrated.seen = true; Store.save(); renderHoy(); });
    view.querySelectorAll('[data-phase]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.phase;
      if (k === d.step) return;
      if (k === 'learn' && d.learned) d.idx = 0;
      goPhase(d, k);
    }));
    on('[data-act="revgo"]', () => { hoyRev.started = true; renderHoy(); window.scrollTo({ top: 0 }); });
    on('[data-act="qgo"]', () => { quiz.started = true; renderHoy(); window.scrollTo({ top: 0 }); });
    on('[data-act="prev"]', () => { d.idx--; Store.save(); renderHoy(); });
    on('[data-act="next"]', () => {
      if (d.idx < d.ids.length - 1) { d.idx++; Store.save(); renderHoy(); window.scrollTo({ top: 0 }); }
      else { d.seenAll = true; goPhase(d, 'quiz', true); }
    });
    on('[data-act="more"]', () => {
      const ids = nextNew(S().settings.perDay);
      if (!ids.length) { toast('¡No quedan frases nuevas!'); return; }
      S().daily = { day: Store.today(), ids, step: 'learn', idx: 0, round: (d.round || 1) + 1, revDone: d.revDone };
      quiz = null; Store.save(); renderHoy();
    });
  }
  function finishDaily(d) {
    d.ids.forEach((id) => SRS.addItem(id, 1));
    Store.logDay('learned', d.ids.length);
    markStudied();
    d.learned = true; d.seenAll = true; d.step = 'done'; quiz = null;
    Store.save();
    confetti();
  }

  function migrationBanner() {
    const m = S().migrated;
    if (!m || m.seen) return '';
    if (m.v === 4) return `<div class="banner warn-banner">${ic('sparkles')} <b>Contenido renovado.</b> Las plantillas con 〜 y las palabras sueltas ahora son frases completas.${m.moved ? ` Tu progreso pasó a las frases nuevas (${m.moved}) y volverán pronto al repaso para afianzarlas.` : ''}${m.dropped ? ` Se ${m.dropped === 1 ? 'quitó 1 palabra suelta poco útil' : `quitaron ${m.dropped} palabras sueltas poco útiles`}.` : ''}
      <button class="link" data-act="dismiss-mig">Entendido</button></div>`;
    return `<div class="banner warn-banner">${ic('sparkles')} <b>App renovada.</b> Ahora aprendes frases útiles con su desglose, en vez de palabras sueltas. Se han conservado <b>${m.kept}</b> de tus tarjetas${m.dropped ? ` y se ${m.dropped === 1 ? 'ha quitado 1 palabra suelta poco útil' : `han quitado ${m.dropped} palabras sueltas poco útiles`}` : ''}.
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
      return `<div class="banner warn-banner">${ic('phone')} <b>Instálala para no perder tu progreso.</b> En Safari: Compartir (□↑) → <b>Añadir a pantalla de inicio</b> y usa siempre ese icono. Si no, iOS puede borrar los datos tras 7 días sin abrirla.
        <button class="link" data-act="dismiss-install">Ya lo sé</button></div>`;
    }
    const d = daysSinceBackup();
    if (learned >= 15 && !(S().sync && S().sync.code) && (d === null || d >= 14)) {
      return `<a class="banner" href="#/perfil">${ic('save')} ${d === null ? 'Aún no has guardado ninguna copia' : `Tu última copia es de hace ${d} días`}. Activa la nube o haz una copia en Perfil.</a>`;
    }
    return '';
  }

  // ---------- REPASO ----------
  // Todo es tipo test: la nota del repaso espaciado sale de tu respuesta (fallo, duda, acierto, rapidez).
  const revUI = { tab: 'dia', filter: 'all', q: '' };
  let rev = null, build = null, libre = null;
  const REV_CHUNK = 20;

  const reviewMode = () => { const m = S().settings.reviewMode || 'mix'; return m === 'audio' && !canSpeak ? 'mix' : m; };
  const modeSide = (m) => (m === 'p' ? 'p' : m === 'mix' ? undefined : 'r');

  function renderRepaso(sub) {
    if (sub && ['dia', 'construir', 'libre'].includes(sub)) revUI.tab = sub;
    const run = { dia: rev, libre, construir: build }[revUI.tab];
    if (run && run.queue.length) {
      paint(runScreen(run), true);
      bindRun(run, rr, RUN_HANDLERS[revUI.tab]());
      return;
    }
    const due = SRS.due().length;
    const tabs = `
      <div class="tabs">
        ${[['dia', `Del día${due ? ` (${due})` : ''}`], ['construir', `${ic('blocks')} Construir`], ['libre', `${ic('repeat')} Libre`]].map(([id, l]) =>
          `<button class="${revUI.tab === id ? 'on' : ''}" data-rtab="${id}">${l}</button>`).join('')}
      </div>`;
    let body;
    if (revUI.tab === 'construir') body = buildBody();
    else if (revUI.tab === 'libre') body = libreBody();
    else body = diaBody();
    paint(`${header('復習 <span class="h-es">Repaso</span>', 'Recordar es lo que fija la memoria')}${tabs}${body}`);
    view.querySelectorAll('[data-rtab]').forEach((b) => b.addEventListener('click', () => {
      revUI.tab = b.dataset.rtab; history.replaceState(null, '', '#/repaso/' + revUI.tab); renderRepaso();
    }));
    if (revUI.tab === 'construir') bindBuild();
    else if (revUI.tab === 'libre') bindLibre();
    else bindDia();
    bindMyWords();
  }
  const rr = () => renderRepaso();

  const RUN_HANDLERS = {
    dia: () => ({
      onCommit: gradeReview,
      remake: (ex) => reviewExercise(ex.k, rev.mode),
      onFinish: () => { if (!SRS.due().length) markStudied(); },
      onQuit: () => { rev = null; },
    }),
    libre: () => ({
      onCommit: (ex) => { if (!ex.ok && !ex.near && !ex.retry && validKey(ex.k)) SRS.miss(ex.k); },
      remake: (ex) => reviewExercise(ex.k),
      onQuit: () => { libre = null; },
    }),
    construir: () => ({
      onCommit: (ex) => { if (!ex.ok && !ex.retry) SRS.miss(ex.id); },
      remake: (ex) => makeExercise(ex.id, 'build', 'prod'),
      onQuit: () => { build = null; },
    }),
  };

  // --- del día (repaso espaciado)
  function startDia() {
    const mode = reviewMode();
    const keys = SRS.due(modeSide(mode)).filter(validKey).slice(0, REV_CHUNK);
    rev = { ...newRun(keys.map((k) => reviewExercise(k, mode))), mode, day: Store.today() };
  }
  function diaBody() {
    const mode = reviewMode();
    if (rev && rev.day !== Store.today()) rev = null;
    const keys = SRS.due(modeSide(mode)).filter(validKey);
    const nR = SRS.due('r').length, nP = SRS.due('p').length;
    const modeSwitch = `
      <div class="seg wide small-seg">
        ${[['mix', 'Mixto'], ['r', `${ic('eye')} Reconocer${nR ? ` ${nR}` : ''}`], ['p', `${ic('mic')} Producir${nP ? ` ${nP}` : ''}`], ...(canSpeak ? [['audio', `${ic('headphones')} Oído`]] : [])].map(([m, l]) =>
          `<button class="${mode === m ? 'on' : ''}" data-mode="${m}">${l}</button>`).join('')}
      </div>`;
    const ids = Object.keys(S().srs).filter((id) => ITEMS[id]);
    const end = rev && !rev.queue.length ? endHTML(rev, keys.length ? `Quedan ${keys.length} para hoy.` : 'Lo fallado volverá pronto; lo acertado, más adelante.',
      keys.length ? `<button class="btn primary" data-act="dgo">Seguir (${Math.min(REV_CHUNK, keys.length)})</button>` : '', missedRows(rev)) : '';
    if (end) return `${end}${myWords()}`;
    if (!keys.length) {
      const next = ids.length ? Math.min(...ids.map((id) => SRS.item(id).due)) - Store.today() : null;
      const otherDue = SRS.due().length;
      return `
        ${otherDue ? modeSwitch : ''}
        <div class="card center">
          ${stamp(ids.length ? '済' : '始')}
          <h2>${ids.length ? (otherDue ? 'Nada en este modo' : '¡Todo repasado!') : 'Aún no hay nada que repasar'}</h2>
          <p class="muted">${ids.length
            ? (otherDue ? `Quedan <b>${otherDue}</b> en Mixto.` : `Próximo repaso: ${next <= 0 ? 'hoy' : 'en ' + SRS.label(next)}.`)
            : 'Completa el reto de hoy y las frases aparecerán aquí.'}</p>
          ${ids.length && !otherDue ? `<p class="small">¿Quieres más? Practicar fuera de calendario también ayuda:</p>
            <div class="row-btns"><button class="btn ghost" data-rtab="construir">${ic('blocks')} Construir</button><button class="btn primary" data-rtab="libre">${ic('repeat')} Práctica libre</button></div>`
            : ids.length ? '' : '<a class="btn primary" href="#/hoy">Ir al reto de hoy</a>'}
        </div>
        ${ids.length ? myWords() : ''}`;
    }
    return `
      ${modeSwitch}
      <div class="card center">
        <div class="big-num">${keys.length}</div>
        <p class="muted">${keys.length === 1 ? 'pregunta pendiente' : 'preguntas pendientes'} hoy</p>
        <button class="btn primary wide" data-act="dgo">Empezar${keys.length > REV_CHUNK ? ` (${REV_CHUNK})` : ''}</button>
        <p class="muted small hint">Cada frase tiene dos memorias: <b>reconocerla</b> (leerla u oírla) y <b>decirla tú</b>. Las preguntas se ponen más difíciles a medida que la recuerdas mejor.</p>
      </div>
      ${myWords()}`;
  }
  function bindDia() {
    view.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
      S().settings.reviewMode = b.dataset.mode; rev = null; Store.save(); rr();
    }));
    on('[data-act="dgo"]', () => { startDia(); rr(); window.scrollTo({ top: 0 }); });
  }

  // --- construir frases
  function startBuild() {
    const ids = learnedIds().filter((id) => canBuild(ITEMS[id]));
    const weak = SRS.weakest().filter((id) => ids.includes(id)).slice(0, 20);
    const chosen = sample(weak, 6); sample(ids.filter((id) => !chosen.includes(id)), 10 - chosen.length).forEach((id) => chosen.push(id));
    build = newRun(shuffle(chosen).map((id) => makeExercise(id, 'build', 'prod')), 'end');
  }
  function buildBody() {
    const avail = learnedIds().filter((id) => canBuild(ITEMS[id])).length;
    if (avail < 2) return `<div class="card center">${stamp('組')}<h2>Aún no hay frases para construir</h2><p class="muted">Aprende unas cuantas frases en el reto de Hoy y vuelve aquí para montarlas pieza a pieza.</p><a class="btn primary" href="#/hoy">Ir al reto de hoy</a></div>`;
    if (build && !build.queue.length) return endHTML(build, build.missed.length ? 'Las falladas volverán antes a tu repaso.' : '¡Perfecto!', '<button class="btn primary" data-act="bstart">Otra ronda</button>', missedRows(build));
    return `
      <div class="card center">
        ${stamp('組')}<h2>Construir frases</h2>
        <p class="muted">Ves el español y montas la frase japonesa con las piezas. Así se te queda el orden de las palabras. Las que falles volverán antes en tu repaso.</p>
        <button class="btn primary wide" data-act="bstart">Empezar (${Math.min(10, avail)} frases)</button>
      </div>${myWords()}`;
  }
  function bindBuild() {
    on('[data-act="bstart"]', () => { startBuild(); rr(); window.scrollTo({ top: 0 }); });
  }

  // --- práctica libre (fuera de calendario: fallar adelanta el repaso, acertar no cambia nada)
  const LIBRE_SRC = { weak: ['trend', 'Las que más fallo'], recent: ['clock', 'Recientes (7 días)'], random: ['shuffle', 'Al azar'] };
  function libreKey(id) { const e = S().srs[id]; return SRS.key(id, e && e.p && Math.random() < 0.5 ? 'p' : 'r'); }
  function startLibre(src, unit) {
    const all = learnedIds();
    const ids = src === 'weak' ? SRS.weakest().filter((id) => ITEMS[id]).slice(0, 15)
      : src === 'recent' ? shuffle(SRS.recent(7).filter((id) => ITEMS[id])).slice(0, 15)
      : src === 'unit' ? shuffle(all.filter((id) => ITEMS[id].unit === unit)).slice(0, 15)
      : Array.isArray(src) ? src
      : sample(all, 15);
    if (!ids.length) { toast('No hay frases en ese grupo'); return; }
    libre = { ...newRun(shuffle(ids).map((id) => reviewExercise(libreKey(id)))), src, unit };
  }
  function libreBody() {
    const all = learnedIds();
    if (!all.length) return `<div class="card center">${stamp('始')}<h2>Aún no has aprendido nada</h2><p class="muted">Haz el reto de hoy y aquí podrás repasar cuando quieras.</p><a class="btn primary" href="#/hoy">Ir al reto de hoy</a></div>`;
    if (libre && !libre.queue.length) return endHTML(libre, libre.missed.length ? `${libre.missed.length} volverán antes a tu repaso.` : '¡Las dominas!',
      `${libre.missed.length ? '<button class="btn primary" data-act="lretry">Repetir las falladas</button>' : ''}<button class="btn ghost" data-act="lnew">Nueva sesión</button>`, missedRows(libre));
    const units = UNITS.filter((u) => u.items.some((i) => S().srs[i.id]) && unitVisible(u));
    return `
      <div class="card">
        <h2 class="h2-sm">Práctica libre</h2>
        <p class="muted small">Tests de lo aprendido cuando quieras, aunque no toque. Si fallas una, se adelanta su repaso; si aciertas, no cambia nada.</p>
        <div class="stack-btns">${Object.entries(LIBRE_SRC).map(([k, [i, l]]) => `<button class="btn ghost" data-libre="${k}">${ic(i)} ${l}</button>`).join('')}</div>
        <p class="muted small" style="margin-top:14px">Por unidad:</p>
        <div class="unit-chips">${units.map((u) => `<button class="cat" data-lunit="${u.id}">${seal(u, 'seal-sm')} ${esc(u.name)}</button>`).join('')}</div>
      </div>
      ${myWords()}`;
  }
  function bindLibre() {
    const go = () => { rr(); window.scrollTo({ top: 0 }); };
    view.querySelectorAll('[data-libre]').forEach((b) => b.addEventListener('click', () => { startLibre(b.dataset.libre); go(); }));
    view.querySelectorAll('[data-lunit]').forEach((b) => b.addEventListener('click', () => { startLibre('unit', b.dataset.lunit); go(); }));
    on('[data-act="lnew"]', () => { libre = null; rr(); });
    on('[data-act="lretry"]', () => { startLibre([...libre.missed]); go(); });
  }

  // --- mis frases
  const FILTERS = [['all', 'Todas'], ['hard', 'Difíciles'], ['aprendiendo', 'Aprendiendo'], ['madura', 'Madura'], ['dominada', 'Dominadas']];
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
        ${list.length ? list.map(({ it, c }) => miniRow(it, `<small class="lvl lvl-${c.level}">${c.hard ? 'difícil · ' : ''}${c.level}${c.hasP ? ' · producir' : ''} · ${c.due - t <= 0 ? 'hoy' : SRS.label(c.due - t)}</small>`)).join('') : '<p class="muted center small">Nada por aquí.</p>'}
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
  // Practicas el tema que quieras, en rondas: los conjuntos pequeños salen enteros y sin repetir (0-10 = 11 preguntas);
  // los grandes, 10 preguntas distintas. Las falladas vuelven al final de la ronda.
  const N = Numbers;
  const NUM_TYPES = [['oir', 'Oír', 'headphones'], ['leer', 'Leer', 'eye'], ['decir', 'Decir', 'pencil']];
  const NUM_GROUPS = [['base', 'Números'], ['dia', 'Día a día'], ['ctr', 'Contadores']];
  const NUM_ROUND = 10;
  const numUI = { tab: 'aprender', topic: 'd10', type: 'oir', run: null, decks: {} };
  const topicOf = (id) => (id === 'mix' ? N.MIX : N.topic(id));
  function topicPct(id) { const e = (S().nums || {})[id]; return e && e.h && e.h.length ? Quiz.pct(e.h) : null; }
  function numAvg() { const v = N.TOPICS.map((t) => topicPct(t.id)).filter((x) => x != null); return v.length ? Math.round(v.reduce((a, x) => a + x, 0) / v.length) : null; }
  const roundSize = (t) => (t.items && t.items().length <= 12 ? t.items().length : NUM_ROUND);

  function numQ(tid, type, v) {
    const t = N.topic(tid);
    const q = { tid, type, v, read: t.read(v), show: t.show(v), sub: t.sub ? t.sub(v) : '', input: '', ans: null, ok: null };
    if (type === 'leer') q.opts = N.options(t, v);
    else if (type === 'oir' && !t.keypad) q.opts = N.labelOptions(t, v);
    else if (type === 'decir') q.w = {};
    return q;
  }
  function roundValues(t) {
    if (t.items) {
      const all = t.items();
      const deck = numUI.decks[t.id] || (numUI.decks[t.id] = Quiz.makeDeck(all));
      return deck.take(all.length <= 12 ? all.length : NUM_ROUND);
    }
    return Quiz.uniqueDraw(t.gen, NUM_ROUND);
  }
  // pairs: [[tema, valor]…] para repetir las falladas
  function startNumRun(tid, type, pairs) {
    if (!pairs) {
      if (tid === 'mix') pairs = Quiz.uniqueDraw(() => { const t = pick(N.TOPICS); return [t.id, N.draw(t)]; }, NUM_ROUND, (p) => p.join(':'));
      else pairs = roundValues(N.topic(tid)).map((v) => [tid, v]);
    }
    numUI.run = { tid, type, queue: pairs.map(([a, v]) => numQ(a, type, v)), total: pairs.length, passed: 0, firstOk: 0, missed: [], done: false };
  }

  function renderNumeros() {
    const r = numUI.run;
    if (r && !r.done && r.queue.length) {
      const x = numQHTML(r.queue[0]);
      paint(focusHTML({ done: r.passed, total: r.total, label: x.label, body: x.body, foot: x.foot }), true);
      bindNumQ(r.queue[0]);
      return;
    }
    const avg = numAvg();
    const tabs = `<div class="seg wide">${[['aprender', `${ic('book')} Aprender`], ['practicar', `${ic('target')} Practicar`]].map(([id, l]) => `<button class="${numUI.tab === id ? 'on' : ''}" data-ntab="${id}">${l}</button>`).join('')}</div>`;
    paint(`
      ${header('数 <span class="h-es">Números</span>', avg != null ? `Dominio medio: ${avg}% (últimas 20 por tema)` : 'Precios, horas, fechas y cantidades')}
      ${tabs}
      ${numUI.tab === 'aprender' ? numLearn() : numPracticeMenu()}`);
    const start = (id) => { numUI.topic = id; startNumRun(id, numUI.type); renderNumeros(); window.scrollTo({ top: 0 }); };
    view.querySelectorAll('[data-ntab]').forEach((b) => b.addEventListener('click', () => { numUI.tab = b.dataset.ntab; if (numUI.run && numUI.run.done) numUI.run = null; renderNumeros(); }));
    view.querySelectorAll('[data-ngo]').forEach((b) => b.addEventListener('click', () => start(b.dataset.ngo)));
    view.querySelectorAll('[data-ntopic]').forEach((b) => b.addEventListener('click', () => { numUI.topic = b.dataset.ntopic; renderNumeros(); }));
    view.querySelectorAll('[data-ntype]').forEach((b) => b.addEventListener('click', () => { numUI.type = b.dataset.ntype; renderNumeros(); }));
    on('[data-act="nstart"]', () => start(numUI.topic));
    on('[data-act="nagain"]', () => start(numUI.run.tid));
    on('[data-act="nretry"]', () => { const r0 = numUI.run; startNumRun(r0.tid, r0.type, r0.missed); renderNumeros(); window.scrollTo({ top: 0 }); });
  }

  function numPracticeMenu() {
    const topicBtn = (x) => {
      const p = x.id === 'mix' ? null : topicPct(x.id);
      const cls = p == null ? '' : p >= 90 ? 'good' : p < 60 ? 'bad' : '';
      return `<button class="topic ${numUI.topic === x.id ? 'on' : ''}" data-ntopic="${x.id}"><span>${esc(x.name)}</span><small class="${cls}">${x.id === 'mix' ? 'azar' : p == null ? 'nuevo' : p + '%'}</small></button>`;
    };
    const cur = topicOf(numUI.topic);
    const r = numUI.run;
    return `
      ${r && r.done ? numEndHTML(r) : ''}
      ${NUM_GROUPS.map(([g, l]) => `<p class="topic-group">${l}</p><div class="topic-grid">${N.TOPICS.filter((x) => x.group === g).map(topicBtn).join('')}${g === 'ctr' ? topicBtn(N.MIX) : ''}</div>`).join('')}
      <p class="muted small center">El % es tu acierto en las últimas 20 preguntas de cada tema.</p>
      <div class="start-bar ${r && r.done ? 'static' : ''}">
        <div class="seg wide">${NUM_TYPES.map(([k, l, i]) => `<button class="${numUI.type === k ? 'on' : ''}" data-ntype="${k}">${ic(i)} ${l}</button>`).join('')}</div>
        <button class="btn primary wide" data-act="nstart">Empezar · ${esc(cur.name)} (${cur.id === 'mix' ? NUM_ROUND : roundSize(cur)})</button>
      </div>`;
  }
  function numEndHTML(r) {
    const rows = r.missed.map(([tid, v]) => { const t = N.topic(tid); const rd = t.read(v); return `<div class="nrow">${sayBtn(rd.kana, 'say-sm')}<b class="nnum">${esc(t.show(v))}</b><span lang="ja" class="nkana">${esc(rd.kana)}</span><span class="romaji">${esc(rd.romaji)}</span></div>`; }).join('');
    return endHTML(r, `${esc(topicOf(r.tid).name)} · ${NUM_TYPES.find(([k]) => k === r.type)[1]}`,
      `${r.missed.length ? '<button class="btn primary" data-act="nretry">Repetir las falladas</button>' : ''}<button class="btn ${r.missed.length ? 'ghost' : 'primary'}" data-act="nagain">Otra ronda</button>`,
      rows ? `<div class="nlist">${rows}</div>` : '');
  }

  // --- pregunta
  const NUM_PROMPT = { oir: 'Escucha: ¿qué número es?', oirOpt: 'Escucha: ¿qué has oído?', leer: '¿Cómo se dice?', decir: 'Escribe cómo se dice (en romaji)' };
  function numQHTML(q) {
    const t = N.topic(q.tid); const answered = q.ans != null;
    const prompt = NUM_PROMPT[q.type === 'oir' && !t.keypad ? 'oirOpt' : q.type];
    const label = numUI.run.tid === 'mix' ? `${esc(t.name)} · ${prompt}` : prompt;
    const readLine = `<div class="num-read"><span lang="ja">${esc(q.read.kana)}</span> <span class="romaji">${esc(q.read.romaji)}</span></div>`;
    const showBlock = `<div class="num-show">${esc(q.show)}</div>${q.sub ? `<div class="muted" lang="ja">${esc(q.sub)}</div>` : ''}`;
    const optsHTML = (render) => `<div class="options grid2">${q.opts.map((o, i) => {
      let cls = ''; if (answered) { if (o.v === q.v) cls = 'correct'; else if (i === q.ans) cls = 'wrong'; }
      return `<button class="opt ${cls}" data-nopt="${i}" ${answered ? 'disabled' : ''}>${render(o)}</button>`;
    }).join('')}</div>`;
    const idk = '<button class="btn ghost" data-act="nidk">No lo sé</button>';
    let body, foot = answered ? nextBtn('nnext') : idk;
    if (q.type === 'oir' && t.keypad) {
      const pre = t.id === 'precios' ? '¥' : '';
      body = `
        <article class="card center kquiz">
          <div class="listen-big">${sayBtn(q.read.kana, 'say-xl')}</div>
          <div class="num-input ${answered ? (q.ok ? 'ok' : 'ko') : ''}">${q.input ? pre + esc(N.fmt(+q.input)) : '…'}</div>
          ${answered && !q.ok ? `<div class="num-correct">${pre}${esc(N.fmt(t.num(q.v)))}</div>` : ''}
          ${answered ? readLine : ''}
        </article>
        ${answered ? '' : `<div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].map((k) => `<button class="key ${k === '✓' ? 'go' : ''}" data-key="${k}">${k}</button>`).join('')}</div>`}`;
    } else if (q.type === 'oir') {
      body = `
        <article class="card center kquiz">
          <div class="listen-big">${sayBtn(q.read.kana, 'say-xl')}</div>
          ${answered ? readLine : ''}
        </article>
        ${optsHTML((o) => `<span class="opt-big">${esc(o.label)}</span>`)}`;
    } else if (q.type === 'leer') {
      body = `<article class="card center kquiz">${showBlock}</article>
        ${optsHTML((o) => `<span lang="ja" class="opt-jp">${esc(o.kana)}</span><small class="romaji">${esc(o.romaji)}</small>`)}`;
    } else {
      body = `<article class="card center kquiz">${showBlock}</article>${answered ? writeResultHTML(q.w, q.read) : writeBoxHTML(q.w)}`;
      foot = answered ? nextBtn('nnext') : writeFoot();
    }
    return { label, body, foot };
  }
  function recordNum(q, ok) {
    if (q.retry) return;
    S().nums = S().nums || {};
    const e = S().nums[q.tid] && S().nums[q.tid].h ? S().nums[q.tid] : { h: [] };
    e.h = Quiz.rolling(e.h, ok); S().nums[q.tid] = e;
  }
  function numAnswer(ok, ans, near = false) {
    const q = numUI.run.queue[0]; if (q.ans != null) return;
    q.ans = ans; q.ok = ok; q.near = near && !ok;
    recordNum(q, ok);
    Store.logDay('reviews'); Store.save(); haptic();
    Speech.speak(q.read.kana); renderNumeros();
    if (ok) autoAdvance(numNext);
  }
  function numNext() {
    clearAdvance();
    const r = numUI.run; const cur = r.queue.shift();
    if (!cur.ok && !cur.near) {
      if (!r.missed.some(([a, v]) => a === cur.tid && v === cur.v)) r.missed.push([cur.tid, cur.v]);
      const n = numQ(cur.tid, cur.type, cur.v); n.retry = true; r.queue.push(n);
    } else { r.passed++; if (cur.ok && !cur.retry) r.firstOk++; }
    if (!r.queue.length) { r.done = true; numUI.tab = 'practicar'; }
    renderNumeros(); window.scrollTo({ top: 0 });
  }
  function bindNumQ(q) {
    const t = N.topic(q.tid);
    if (q.type === 'oir' && !q.spoken) { q.spoken = true; Speech.speak(q.read.kana); }
    on('[data-act="qz-quit"]', () => { clearAdvance(); numUI.run = null; renderNumeros(); window.scrollTo({ top: 0 }); });
    view.querySelectorAll('[data-key]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.key;
      if (k === '⌫') q.input = q.input.slice(0, -1);
      else if (k === '✓') { if (q.input) return numAnswer(+q.input === t.num(q.v), q.input); }
      else if (q.input.length < 9) q.input = (q.input + k).replace(/^0+(?=\d)/, '');
      renderNumeros();
    }));
    view.querySelectorAll('[data-nopt]').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.nopt; numAnswer(q.opts[i].v === q.v, i); }));
    on('[data-act="nidk"]', () => numAnswer(false, 'idk'));
    if (q.type === 'decir') {
      bindWrite(q.w, q.read, (c) => numAnswer(c.res === 'ok', true, c.res === 'near'), renderNumeros,
        () => { q.ok = true; q.near = false; const e = S().nums[q.tid]; if (!q.retry && e && e.h.length) { e.h[e.h.length - 1] = 1; Store.save(); } },
        (input) => N.checkSaid(t, q.v, input, Romaji.check));
    }
    on('[data-act="nnext"]', numNext);
  }

  // --- aprender
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
    const ctrSamples = { tsu: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nin: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], en: [1, 4, 5, 10, 100, 500, 1000, 4000, 10000], ji: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], fun: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30], sai: [1, 3, 8, 10, 11, 18, 20, 21, 30], kai: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], gatsu: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], nichi: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 17, 19, 20, 24, 30] };
    const ctrTopic = { tsu: 'tsu', nin: 'nin', en: 'precios', ji: 'horas', fun: 'minutos', sai: 'sai', kai: 'kai', gatsu: 'gatsu', nichi: 'nichi' };
    const plainOf = { tsu: null, nin: 'にん', en: 'えん', ji: 'じ', fun: 'ふん', sai: 'さい', kai: 'かい', gatsu: 'がつ', nichi: 'にち' };
    const naive = (c, n) => { const r = C[c].read(n).kana; const plain = plainOf[c]; return plain && N.toJa(n).kana + plain !== r; };
    const goBtns = (ids) => `<div class="sec-go">${ids.map((id) => `<button class="btn ghost" data-ngo="${id}">${ic('target')} Practicar ${esc(N.topic(id).name)}</button>`).join('')}</div>`;
    const sec = (title, inner, ids, open) => `<details class="card nsec" ${open ? 'open' : ''}><summary>${title}</summary>${inner}${goBtns(ids)}</details>`;
    return `
      <div class="tip">${ic('bulb')} Para hablar, lo que más vas a usar son <b>precios</b> (円), <b>horas</b> (時・分), <b>fechas</b> (月・日), <b>personas</b> (人) y <b>cantidades</b> (〜つ). Cada sección tiene su botón para practicarla.</div>
      ${sec('0 – 10: la base', `
        <p class="muted small">4, 7 y 9 tienen dos lecturas. En general usa <b>よん, なな, きゅう</b> (し suena a "muerte", く a "sufrimiento"). Pero en las horas y meses se usan las otras: よじ, しちじ, くじ.</p>
        <div class="nlist">${basic.map((n) => numRow(n, N.toJa(n), `${n} <small lang="ja">${N.toKanji(n)}</small>`)).join('')}</div>`, ['d10'], true)}
      ${sec('11 – 99: se construyen solos', `
        <p class="muted small">Como un puzle: 11 = 10+1 = じゅう いち · 20 = 2×10 = に じゅう · 37 = 3×10+7 = さんじゅう なな.</p>
        <div class="nlist">${tens.map((n) => numRow(n, N.toJa(n), `${n} <small lang="ja">${N.toKanji(n)}</small>`)).join('')}</div>`, ['d99'])}
      ${sec('Centenas y millares (con trampas)', `
        <p class="muted small">Los marcados cambian de sonido: さん<b>び</b>ゃく, ろっ<b>ぴ</b>ゃく, はっ<b>ぴ</b>ゃく, さん<b>ぜ</b>ん, はっ<b>せ</b>ん. 100 y 1000 se dicen sin "uno": ひゃく, せん.</p>
        <div class="nlist">${huns.map((n) => numRow(n, N.toJa(n), N.fmt(n), irrH.includes(n))).join('')}</div>
        <div class="nlist" style="margin-top:8px">${ths.map((n) => numRow(n, N.toJa(n), N.fmt(n), irrT.includes(n))).join('')}</div>`, ['d999', 'd9999'])}
      ${sec('El truco del 万 (10.000)', `
        <p class="muted small">En japonés se agrupa de <b>4 en 4 cifras</b>, no de 3. 10.000 tiene nombre propio: <b>万 (man)</b>. Así que 100.000 = 10 × 万 = じゅうまん, y 1 millón = 100 × 万 = ひゃくまん. Truco: tapa las 4 últimas cifras y lee lo que queda + まん.</p>
        <div class="nlist">${big.map((n) => numRow(n, N.toJa(n), N.fmt(n), false)).join('')}</div>`, ['man'])}
      ${Object.entries(C).map(([k, c]) => sec(`${c.name}`, `
        <p class="muted small">${esc(c.hint)}</p>
        <div class="nlist">${ctrSamples[k].map((n) => numRow(n, c.read(n), `${esc(c.jp(n))} <small>${esc(c.es(n))}</small>`, naive(k, n))).join('')}</div>`, [ctrTopic[k]])).join('')}
      ${sec('Días de la semana', `
        <p class="muted small">Todos acaban en 曜日 (youbi). Cada uno es un elemento: luna, fuego, agua, árbol, oro, tierra, sol.</p>
        <div class="nlist">${N.WEEKDAYS.map(([jp, kana, ro, es, el]) => `<div class="nrow">${sayBtn(kana, 'say-sm')}<b class="nnum" lang="ja">${jp}</b><span lang="ja" class="nkana">${kana}</span><span class="romaji">${ro}</span><small class="muted">${es} (${el})</small></div>`).join('')}</div>`, ['youbi'])}
      <p class="legend"><span class="irr-dot"></span> lectura irregular: ¡la que más hay que practicar!</p>`;
  }

  // ---------- KANA ----------
  // Método: 1) cada kana nuevo se presenta (sonido + truco) justo antes de preguntarlo; 2) rondas de 10 mezclando
  // leer (あ→a), reconocer (a→あ) y oír (audio→あ); 3) las opciones incorrectas son los kana con los que de verdad se
  // confunde (シ/ツ, ぬ/め…); 4) la nota FSRS tiene en cuenta la rapidez (leer kana tiene que ser automático);
  // 5) cuando dominas tus filas, te propone la siguiente; 6) "Leer palabras" solo usa palabras con kana que ya conoces.
  const KANA_DONE_S = 7;     // dominado: lo recuerdas a más de una semana vista
  const KANA_KNOWN_S = 2;    // aprendido: ya aguanta un par de días (para proponer la fila siguiente)
  const KANA_ROUND = 10;
  const KANA_SLOW_MS = 4000; // acertar tardando más = "Difícil"
  const KANA_MODES = [['mix', 'Mixto'], ['k2r', 'あ → a'], ['r2k', 'a → あ'], ...(canSpeak ? [['oir', 'Oír']] : [])];
  const kanaUI = { script: 'h', tab: 'tabla', mode: 'mix', readMode: 'elegir', run: null, detail: null };
  function kanaStat(key) { return S().kana[key] || { c: 0, w: 0, s: 0 }; }
  const kanaMem = (key) => (S().kana[key] || {}).f || null;
  const kanaDone = (key) => { const f = kanaMem(key); return !!(f && f.s >= KANA_DONE_S); };
  const kanaKnown = (key) => { const f = kanaMem(key); return !!(f && f.s >= KANA_KNOWN_S); };
  const kanaDueList = (sc) => allKana(sc).filter((k) => { const f = kanaMem(k.key); return f && f.due <= Store.today(); });
  const kanaMnemo = (sc, ch) => KANA_MNEMO[sc][ch] || (ch.length > 1 ? 'Combinación: la pequeña ゃ/ゅ/ょ se pega a la anterior y suenan como una sola sílaba.' : 'Es su kana "base" con ゛ (sonido sonoro: k→g, s→z, t→d, h→b) o con ゜ (h→p).');
  function kanaClass(key) {
    const k = S().kana[key]; if (!k) return '';
    return kanaDone(key) ? 'm-done' : k.c + k.w > 0 ? 'm-learn' : '';
  }
  function selectedRows() {
    S().kanaSel = S().kanaSel || { h: ['a'], k: ['a'] };
    return S().kanaSel[kanaUI.script];
  }
  const ALL_ROWS = () => [...KANA_ROWS, ...KANA_COMBOS];
  const rowLabel = (sc, row) => (sc === 'k' ? toKatakana(row.kana[0]) : row.kana[0]);
  function rowShare(sc, rowId, test) {
    const ks = allKana(sc).filter((k) => k.row === rowId);
    return ks.length ? ks.filter((k) => test(k.key)).length / ks.length : 0;
  }
  // Fila recomendada: cuando ya te sabes (≥ 80 %) todas las elegidas, la siguiente en orden
  function nextRow(sc) {
    const sel = selectedRows();
    if (!sel.every((id) => rowShare(sc, id, kanaKnown) >= 0.8)) return null;
    return ALL_ROWS().find((r) => !sel.includes(r.id)) || null;
  }

  function renderKana() {
    const sc = kanaUI.script;
    const r = kanaUI.run;
    if (r && (r.intro.length || r.queue.length)) {
      const x = kanaQHTML(r, sc);
      paint(focusHTML({ done: r.passed, total: r.total, label: x.label, body: x.body, foot: x.foot }), true);
      bindKanaQ(r, sc);
      return;
    }
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
    else body = kanaReadMenu(sc);

    paint(`
      ${header('かな <span class="h-es">Kana</span>', `${mastered}/${all.length} dominados`, `<div class="ring" style="--p:${(mastered / all.length) * 100}"><span>${Math.round((mastered / all.length) * 100)}%</span></div>`)}
      ${tabs}${body}`);

    view.querySelectorAll('[data-script]').forEach((b) => b.addEventListener('click', () => { kanaUI.script = b.dataset.script; kanaUI.run = null; kanaUI.detail = null; renderKana(); }));
    view.querySelectorAll('[data-ktab]').forEach((b) => b.addEventListener('click', () => { kanaUI.tab = b.dataset.ktab; kanaUI.run = null; renderKana(); }));
    bindKana();
  }

  function kanaTable(sc) {
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
    const st = det ? kanaStat(sc + ':' + det.ch) : null;
    return `
      ${!Object.keys(S().kana).length ? `
        <div class="tip">
          <b>¿Por dónde empiezo?</b><br>
          1. Empieza por <b>hiragana</b> (se usa en todo). 2. Ve a <b>Practicar</b>: cada kana nuevo se te presenta con su sonido y un truco antes de preguntártelo. 3. Cuando te sepas la fila, la app te propone la siguiente.<br>
          Con 10-15 min al día lo tienes en 2-3 semanas. Después, katakana (palabras extranjeras como コーヒー = café).
        </div>` : ''}
      ${det ? `
        <div class="card kdetail">
          <div class="kd-char" lang="ja">${esc(det.ch)}</div>
          <div class="kd-info">
            <div class="kd-r">${esc(det.r)} ${sayBtn(det.ch, 'say-sm')}</div>
            <p>${esc(kanaMnemo(sc, det.ch))}</p>
            ${st.c + st.w ? `<small class="muted">${st.c} aciertos · ${st.w} fallos</small>` : ''}
          </div>
        </div>` : '<p class="muted small center">Toca una letra para oírla y ver el truco para recordarla.</p>'}
      <div class="kgrid">
        <div class="kgrid-label">Básicos</div>${rows(KANA_ROWS.filter((r) => !r.extra))}
        <div class="kgrid-label">Con ゛ y ゜ (dakuten)</div>${rows(KANA_ROWS.filter((r) => r.extra))}
        <div class="kgrid-label">Combinaciones (きゃ, しゅ…)</div>${rows(KANA_COMBOS)}
      </div>
      <div class="legend"><span class="m-learn"></span> practicando <span class="m-done"></span> dominado (lo recuerdas a más de una semana vista)</div>`;
  }

  const kanaEnd = (r, btn) => endHTML(r, '', btn, r.missed.length ? `<div class="kmissed">${r.missed.map((m) => `<span lang="ja">${esc(m)}</span>`).join('')}</div>` : '');
  function kanaPractice(sc) {
    const sel = selectedRows();
    const dueList = kanaDueList(sc);
    const pool = allKana(sc).filter((k) => sel.includes(k.row));
    const chips = ALL_ROWS().map((row) => {
      const p = rowShare(sc, row.id, kanaDone);
      return `<button class="rchip ${sel.includes(row.id) ? 'on' : ''} ${p === 1 ? 'full' : ''}" data-row="${row.id}" style="--p:${p * 100}%"><span lang="ja">${rowLabel(sc, row)}</span></button>`;
    }).join('');
    const nr = nextRow(sc);
    const r = kanaUI.run;
    const fresh = pool.filter((k) => !S().kana[k.key]).length;
    return `
      ${r && !r.queue.length && !r.read ? kanaEnd(r, '<button class="btn primary" data-act="kagain">Otra ronda</button>') : ''}
      ${dueList.length ? `<button class="btn primary wide" data-act="kdue">${ic('repeat')} Repasar ${dueList.length} pendiente${dueList.length > 1 ? 's' : ''}</button>` : ''}
      ${nr ? `<div class="card next-row">
        <div><b>Ya te sabes tus filas.</b><p class="muted small">Siguiente: <span lang="ja" class="nr-kana">${(Array.isArray(nr.kana) ? nr.kana : [...nr.kana]).filter((c) => c !== '・').map((c) => (sc === 'k' ? toKatakana(c) : c)).join(' ')}</span></p></div>
        <button class="btn primary" data-addrow="${nr.id}">${ic('plus')} Añadir</button>
      </div>` : ''}
      <p class="muted small">Filas que practicas${fresh ? ` · <b>${fresh}</b> kana nuevos se te presentarán antes de preguntarlos` : ''}:</p>
      <div class="rchips">${chips}</div>
      <div class="start-bar ${r && !r.queue.length && !r.read ? 'static' : ''}">
        <div class="seg wide">${KANA_MODES.map(([k, l]) => `<button class="${kanaUI.mode === k ? 'on' : ''}" data-kmode="${k}">${k === 'oir' ? ic('headphones') + ' ' : ''}${sc === 'k' ? l.replace('あ', 'ア') : l}</button>`).join('')}</div>
        <button class="btn primary wide" data-act="kstart" ${pool.length ? '' : 'disabled'}>Empezar (${KANA_ROUND})</button>
      </div>`;
  }
  // Ronda: los nuevos y los que se te están olvidando salen más; en filas pequeñas se repiten sin seguir
  function kanaWeight(k) {
    const f = kanaMem(k.key); const t = Store.today();
    return !f ? 4 : 1 + Math.round((1 - FSRS.retrievability(t - f.last, f.s)) * 8) + (f.due <= t ? 3 : 0);
  }
  function kanaRound(pool) {
    if (pool.length >= KANA_ROUND) {
      return pool.map((k) => ({ k, w: Math.random() * kanaWeight(k) })).sort((a, b) => b.w - a.w).slice(0, KANA_ROUND).map((x) => x.k);
    }
    const deck = Quiz.makeDeck(pool, { key: (k) => k.key });
    return Array.from({ length: KANA_ROUND }, () => deck.next());
  }
  // Tipo de pregunta: los nuevos se leen (あ→a); los ya vistos, mezclados con reconocer y oír
  function kanaType(k) {
    if (kanaUI.mode !== 'mix') return kanaUI.mode;
    if (!kanaMem(k.key)) return 'k2r';
    const r = Math.random();
    return r < 0.4 ? 'k2r' : r < 0.7 || !canSpeak ? 'r2k' : 'oir';
  }
  // Opciones: primero los kana con los que se confunde (si ya los has visto o están en la ronda), luego el resto
  function kanaOptions(k, pool, sc) {
    const all = allKana(sc);
    const ok = (x) => x && x.key !== k.key && x.r !== k.r;
    const conf = shuffle(kanaConfusables(k.ch, sc).map((ch) => all.find((x) => x.ch === ch)).filter((x) => ok(x) && (pool.includes(x) || S().kana[x.key])));
    const rest = shuffle((pool.length >= 4 ? pool : all).filter(ok));
    const out = [];
    [...conf, ...rest].forEach((x) => { if (out.length < 3 && !out.some((u) => u.r === x.r)) out.push(x); });
    return shuffle([k, ...out]);
  }
  const kanaQ = (k, pool, sc) => ({ k, type: kanaType(k), opts: kanaOptions(k, pool, sc), ans: null });
  function startKana(sc, list) {
    const pool = list || allKana(sc).filter((k) => selectedRows().includes(k.row));
    const ks = list ? shuffle(list).slice(0, 20) : kanaRound(pool);
    const intro = [...new Map(ks.filter((k) => !S().kana[k.key]).map((k) => [k.key, k])).values()].slice(0, 5);
    kanaUI.run = { queue: ks.map((k) => kanaQ(k, pool, sc)), pool, intro, introTotal: intro.length, total: ks.length, passed: 0, firstOk: 0, missed: [] };
  }

  // --- leer palabras (solo las que puedes leer con los kana que ya has practicado)
  const isHira = (s) => /^[ぁ-ゖー\s、。！？]+$/.test(s);
  function knownKanaSet(sc) {
    return new Set(allKana(sc).filter((k) => S().kana[k.key] && k.ch.length === 1).map((k) => k.ch));
  }
  function readPool(sc, all = false) {
    const words = sc === 'k'
      ? KATAKANA_WORDS.map(([jp, r, es, note]) => ({ jp, r, es, note: note || '' }))
      : [...new Map(ITEMS_LIST.filter((v) => isHira(v.kana) && [...v.kana].length >= 2 && [...v.kana].length <= 9 && unitVisible(UNIT[v.unit]))
        .map((v) => [v.kana, { jp: v.kana, r: v.romaji, es: v.es, note: '' }])).values()];
    if (all) return words;
    const known = knownKanaSet(sc);
    return words.filter((w) => kanaReadable(w.jp, known));
  }
  // Distractores parecidos: de longitud similar y que compartan kana (así hay que leer la palabra entera)
  function wordOptions(w, pool) {
    const chars = new Set(w.jp);
    const scored = pool.filter((x) => x.r !== w.r).map((x) => ({ x, s: [...x.jp].filter((c) => chars.has(c)).length * 2 - Math.abs([...x.jp].length - [...w.jp].length) + Math.random() * 2 }));
    return shuffle([w, ...scored.sort((a, b) => b.s - a.s).slice(0, 3).map((o) => o.x)]);
  }
  const READ_MIN = 6;
  function startRead(sc) {
    const pool = readPool(sc);
    const ws = Quiz.makeDeck(pool, { key: (w) => w.r }).take(KANA_ROUND);
    kanaUI.run = { read: true, intro: [], queue: ws.map((w) => ({ w, type: kanaUI.readMode, opts: wordOptions(w, pool), ans: null, wr: {} })), total: ws.length, passed: 0, firstOk: 0, missed: [] };
  }
  function kanaReadMenu(sc) {
    const r = kanaUI.run;
    const can = readPool(sc).length, total = readPool(sc, true).length;
    return `
      ${r && !r.queue.length && r.read ? kanaEnd(r, '<button class="btn primary" data-act="ragain">Otra ronda</button>') : ''}
      <div class="card center">
        ${stamp('読')}
        <h2>Leer palabras</h2>
        <p class="muted">${sc === 'h' ? 'Palabras y frases de tu curso escritas en hiragana.' : 'Préstamos que vas a ver a diario en Japón. ー alarga la vocal y ッ dobla la consonante.'}</p>
        <p class="small"><b>${can}</b> de ${total} palabras se pueden leer con los kana que ya has practicado.</p>
        ${can >= READ_MIN ? `
          <div class="seg wide small-seg">${[['elegir', 'Elegir'], ['escribir', 'Escribir']].map(([k, l]) => `<button class="${kanaUI.readMode === k ? 'on' : ''}" data-rmode="${k}">${k === 'escribir' ? ic('pencil') + ' ' : ''}${l}</button>`).join('')}</div>
          <button class="btn primary wide" data-act="rstart">Empezar (${Math.min(KANA_ROUND, can)})</button>`
        : `<p class="muted small">Practica unas cuantas filas más en <b>Practicar</b> para desbloquear palabras.</p>
          <button class="btn ghost wide" data-ktab="practica">Ir a Practicar</button>`}
      </div>`;
  }

  // --- pantalla de cada pregunta (presentación, kana o palabra)
  function kanaQHTML(r, sc) {
    if (r.intro.length) {
      const k = r.intro[0]; const n = r.introTotal - r.intro.length + 1;
      return {
        label: `Kana nuevo · ${n} de ${r.introTotal}`,
        body: `
          <article class="card center kquiz kintro">
            <div class="kq-big" lang="ja">${k.ch}</div>
            <div class="kintro-r">${esc(k.r)} ${sayBtn(k.ch, 'say-lg')}</div>
            <p class="kintro-tip">${esc(kanaMnemo(sc, k.ch))}</p>
          </article>
          <p class="muted small center">Escúchalo, dilo en voz alta y trázalo con el dedo en el aire.</p>`,
        foot: `<button class="btn primary" data-act="kintro">${r.intro.length > 1 ? 'Siguiente kana' : 'Empezar el test'} →</button>`,
      };
    }
    const q = r.queue[0]; const answered = q.ans != null;
    const foot = answered ? nextBtn('knext') : '<button class="btn ghost" data-act="kidk">No lo sé</button>';
    if (r.read) {
      const meaning = answered ? `<div class="meaning">${esc(q.w.es)} ${sayBtn(q.w.jp, 'say-sm')}</div>${q.w.note ? `<p class="note-mini">${ic('bulb')} ${esc(q.w.note)}</p>` : ''}` : '';
      if (q.type === 'escribir') {
        return {
          label: 'Lee la palabra y escribe cómo suena',
          body: `<article class="card center kquiz"><div class="kq-word" lang="ja">${esc(q.w.jp)}</div>${meaning}</article>${answered ? writeResultHTML(q.wr, { kana: q.w.jp, romaji: q.w.r }) : writeBoxHTML(q.wr)}`,
          foot: answered ? nextBtn('knext') : writeFoot(),
        };
      }
      return {
        label: 'Lee la palabra: ¿cómo suena?',
        body: `
          <article class="card center kquiz"><div class="kq-word" lang="ja">${esc(q.w.jp)}</div>${meaning}</article>
          <div class="options grid2">${q.opts.map((o, i) => {
            let cls = ''; if (answered) { if (o.r === q.w.r) cls = 'correct'; else if (i === q.ans) cls = 'wrong'; }
            return `<button class="opt ${cls}" data-ropt="${i}" ${answered ? 'disabled' : ''}>${esc(o.r)}</button>`;
          }).join('')}</div>`,
        foot,
      };
    }
    const wrong = answered && (q.ans === 'idk' || q.opts[q.ans].key !== q.k.key);
    const showKana = q.type === 'k2r';
    const front = q.type === 'k2r' ? `<div class="kq-big" lang="ja">${q.k.ch}</div>`
      : q.type === 'r2k' ? `<div class="kq-big roma">${q.k.r}</div>`
      : `<div class="listen-big">${sayBtn(q.k.ch, 'say-xl')}</div>${answered ? `<div class="kq-mid" lang="ja">${q.k.ch} <span class="romaji">${q.k.r}</span></div>` : ''}`;
    return {
      label: { k2r: '¿Cómo se lee?', r2k: '¿Cuál es?', oir: '¿Qué kana has oído?' }[q.type],
      body: `
        <article class="card center kquiz">
          ${front}
          ${wrong ? `<p class="note-mini"><b lang="ja">${q.k.ch}</b> = <b>${q.k.r}</b> · ${esc(kanaMnemo(sc, q.k.ch))}</p>` : ''}
        </article>
        <div class="options grid2">${q.opts.map((o, i) => {
          let cls = ''; if (answered) { if (o.key === q.k.key) cls = 'correct'; else if (i === q.ans) cls = 'wrong'; }
          return `<button class="opt big ${cls}" data-kopt="${i}" ${answered ? 'disabled' : ''} ${showKana ? '' : 'lang="ja"'}>${showKana ? o.r : o.ch}</button>`;
        }).join('')}</div>`,
      foot,
    };
  }
  function kanaNext() {
    clearAdvance();
    const r = kanaUI.run; const cur = r.queue.shift();
    if (!cur.ok && !cur.near) {
      const label = r.read ? cur.w.jp : cur.k.ch;
      if (!r.missed.includes(label)) r.missed.push(label);
      const again = r.read ? { ...cur, ans: null, ok: null, near: false, wr: {}, opts: shuffle(cur.opts), retry: true } : { ...kanaQ(cur.k, r.pool, kanaUI.script), retry: true };
      r.queue.push(again);
    } else { r.passed++; if (cur.ok && !cur.retry) r.firstOk++; }
    renderKana(); window.scrollTo({ top: 0 });
  }
  // Memoria FSRS del kana: fallo = Otra vez · acierto lento = Difícil · acierto = Bien
  function gradeKana(k, ok, ms) {
    const st = { ...kanaStat(k.key) };
    if (ok) { st.c++; st.s++; } else { st.w++; st.s = 0; }
    const t = Store.today();
    st.f = FSRS.options(st.f || { s: null, d: null }, t, S().settings.retention || 0.9)[!ok ? 0 : ms > KANA_SLOW_MS ? 1 : 2];
    st.f.due = t + st.f.ivl;
    S().kana[k.key] = st; Store.logDay(ok ? 'ok' : 'fail'); Store.save();
  }
  function bindKanaQ(r, sc) {
    on('[data-act="qz-quit"]', () => { clearAdvance(); kanaUI.run = null; renderKana(); window.scrollTo({ top: 0 }); });
    if (r.intro.length) {
      const k = r.intro[0];
      if (r.spokenIntro !== k.key) { r.spokenIntro = k.key; Speech.speak(k.ch); }
      on('[data-act="kintro"]', () => { r.intro.shift(); renderKana(); window.scrollTo({ top: 0 }); });
      return;
    }
    const q = r.queue[0];
    if (!q.t0) q.t0 = Date.now();
    if (!r.read && q.type === 'oir' && !q.spoken) { q.spoken = true; Speech.speak(q.k.ch); }
    const finish = (ok, ans, sound, near = false) => {
      if (q.ans != null) return;
      q.ans = ans; q.ok = ok; q.near = near && !ok; haptic(); Speech.speak(sound);
      if (!r.read && !q.retry) gradeKana(q.k, ok, Date.now() - q.t0);
      renderKana();
      if (ok) autoAdvance(kanaNext);
    };
    view.querySelectorAll('[data-kopt]').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.kopt; finish(q.opts[i].key === q.k.key, i, q.k.ch); }));
    view.querySelectorAll('[data-ropt]').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.ropt; finish(q.opts[i].r === q.w.r, i, q.w.jp); }));
    on('[data-act="kidk"]', () => finish(false, 'idk', r.read ? q.w.jp : q.k.ch));
    if (r.read && q.type === 'escribir') {
      bindWrite(q.wr, { kana: q.w.jp, romaji: q.w.r }, (c) => finish(c.res === 'ok', true, q.w.jp, c.res === 'near'), renderKana, () => { q.ok = true; q.near = false; });
    }
    on('[data-act="knext"]', kanaNext);
  }

  function bindKana() {
    const go = () => { renderKana(); window.scrollTo({ top: 0 }); };
    view.querySelectorAll('[data-kc]').forEach((b) => b.addEventListener('click', () => {
      kanaUI.detail = { ch: b.dataset.kc, r: b.dataset.kr };
      Speech.speak(b.dataset.kc); renderKana();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
    view.querySelectorAll('[data-row]').forEach((b) => b.addEventListener('click', () => {
      const sel = selectedRows(); const id = b.dataset.row;
      const i = sel.indexOf(id);
      if (i >= 0) { if (sel.length > 1) sel.splice(i, 1); } else sel.push(id);
      Store.save(); renderKana();
    }));
    view.querySelectorAll('[data-addrow]').forEach((b) => b.addEventListener('click', () => { selectedRows().push(b.dataset.addrow); Store.save(); renderKana(); }));
    view.querySelectorAll('[data-kmode]').forEach((b) => b.addEventListener('click', () => { kanaUI.mode = b.dataset.kmode; renderKana(); }));
    view.querySelectorAll('[data-rmode]').forEach((b) => b.addEventListener('click', () => { kanaUI.readMode = b.dataset.rmode; renderKana(); }));
    on('[data-act="kstart"]', () => { startKana(kanaUI.script); go(); });
    on('[data-act="kagain"]', () => { startKana(kanaUI.script); go(); });
    on('[data-act="kdue"]', () => { startKana(kanaUI.script, kanaDueList(kanaUI.script)); go(); });
    on('[data-act="rstart"]', () => { startRead(kanaUI.script); go(); });
    on('[data-act="ragain"]', () => { startRead(kanaUI.script); go(); });
  }

  // ---------- FRASES (biblioteca) ----------
  const fr = { cat: 'saludos', q: '', learned: false };
  function renderFrases() {
    const units = UNITS.filter(unitVisible);
    if (fr.cat !== 'all' && !units.some((u) => u.id === fr.cat)) fr.cat = 'saludos';
    const cats = [{ id: 'all', name: 'Todas', icon: '全', iconRead: 'ぜんぶ (全部) = todo' }, ...units];
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
      <div class="cats">${cats.map((x) => `<button class="cat ${fr.cat === x.id ? 'on' : ''} cat-${x.kind || ''}" data-cat="${x.id}">${seal(x, 'seal-sm')} ${esc(x.name)}</button>`).join('')}</div>
      ${u ? `<p class="cat-desc">${u.iconRead ? `<span class="seal-read">${seal(u, 'seal-sm')} <span lang="ja">${esc(u.iconRead)}</span></span>` : ''}${esc(u.desc)}</p>` : ''}
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
          ${it.note ? `<div class="pc-note">${ic('bulb')} ${esc(it.note)}</div>` : ''}
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
    const numPct = numAvg();
    const days = [...Array(7)].map((_, i) => t - 6 + i);
    const maxAct = Math.max(1, ...days.map((d) => (s.log[d] ? s.log[d].learned + s.log[d].reviews : 0)));
    const dn = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    view.innerHTML = `
      ${header('私 <span class="h-es">Perfil</span>', 'Tu progreso y ajustes')}
      <div class="stats">
        <div class="stat fire"><b>${ic('flame')} ${streakNow()}</b><span>racha (mejor ${s.streak.best || 0})</span></div>
        <div class="stat"><b>${cards.length}</b><span>de ${total} aprendidas</span></div>
        <div class="stat"><b>${masteredW}</b><span>dominadas</span></div>
        <div class="stat"><b>${SRS.due().length}</b><span>por repasar</span></div>
        <div class="stat"><b>${retPct}</b><span>recuerdas (30 días, objetivo ${Math.round((set.retention || 0.9) * 100)}%)</span></div>
        <div class="stat"><b>${ic('hash')} ${numPct != null ? numPct + '%' : '—'}</b><span>números (acierto reciente por tema)</span></div>
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
        <label class="set"><span>Escribir al producir<small>En las frases que ya recuerdas bien, las escribes en romaji y la app lo corrige. Si lo quitas, las construyes con piezas.</small></span>
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

      <h3 class="section-title">${ic('cloud')} Guardar en la nube</h3>
      <div class="card">
        ${Sync.code ? `
          <p class="small"><b>Activada</b> · <span class="sync-st st-${Sync.status.state}">${syncLabel()}</span></p>
          <p class="muted small">Tu progreso se guarda solo en internet. Para usarlo en otro móvil o recuperarlo, pon este código en "Tengo un código":</p>
          <div class="code-box">${Sync.code.match(/.{1,4}/g).join('-')}</div>
          <div class="row-btns">
            <button class="btn ghost" data-act="copy-code">${ic('copy')} Copiar</button>
            <button class="btn ghost" data-act="sync-now">${ic('repeat')} Sincronizar</button>
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

      <h3 class="section-title">${ic('phone')} Instalar en el iPhone</h3>
      <div class="card tip-plain">En <b>Safari</b>: botón <b>Compartir</b> (□↑) → <b>Añadir a pantalla de inicio</b>. Se abrirá como una app, a pantalla completa y funcionará sin conexión.</div>

      <h3 class="section-title">Copia de seguridad</h3>
      <div class="card">
        <p class="muted small">Tu progreso se guarda en este dispositivo. Exporta una copia de vez en cuando (guárdala en Archivos, iCloud o mándatela por WhatsApp). Si cambias de móvil o se borra, la importas y sigues donde lo dejaste.</p>
        <p class="small"><b>Última copia:</b> ${daysSinceBackup() === null ? 'nunca' : daysSinceBackup() === 0 ? 'hoy ✓' : 'hace ' + daysSinceBackup() + ' días'}</p>
        <div class="row-btns">
          <button class="btn ghost" data-act="export">${ic('download')} Exportar</button>
          <label class="btn ghost">${ic('upload')} Importar<input type="file" id="import" accept="application/json,.json" hidden></label>
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
    const resetDaily = () => { const d = s.daily; if (d && d.step === 'learn' && d.idx === 0 && !d.seenAll && !d.learned) s.daily = null; };
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
  function resetSessions() { rev = null; quiz = null; hoyRev = null; build = null; libre = null; numUI.run = null; kanaUI.run = null; }

  // ---------- nube ----------
  function syncLabel() {
    const st = Sync.status, last = S().sync && S().sync.last;
    if (st.state === 'syncing') return 'sincronizando…';
    if (st.state === 'error' || st.state === 'unconfigured') return 'Error: ' + st.msg;
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
    clearAdvance(); document.body.classList.remove('quizzing');
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
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.target.matches('input, textarea, select')) return;
    const b = view.querySelector('[data-act="exnext"], [data-act="nnext"], [data-act="knext"]');
    if (b) { e.preventDefault(); b.click(); }
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applySettings);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { route(); syncNow(); } });

  function confetti() {
    const box = document.createElement('div'); box.className = 'confetti';
    const tones = ['p1', 'p2', 'p3'];
    for (let i = 0; i < 28; i++) {
      const s = document.createElement('span');
      s.className = 'petal ' + tones[i % tones.length];
      s.style.left = Math.random() * 100 + '%';
      s.style.animationDelay = Math.random() * 0.6 + 's';
      s.style.setProperty('--sz', 8 + Math.random() * 10 + 'px');
      box.appendChild(s);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 3000);
  }


  applySettings();
  route();
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  syncNow();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
