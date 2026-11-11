// Repetición espaciada (SM-2 simplificado).
// Notas: 0 = Otra vez, 1 = Difícil, 2 = Bien, 3 = Fácil
(function () {
  function addItem(id, dueInDays = 1) {
    const s = Store.s;
    if (s.srs[id]) return false;
    const t = Store.today();
    s.srs[id] = { due: t + dueInDays, ivl: dueInDays, ease: 2.5, reps: 1, lapses: 0, added: t };
    return true;
  }

  function preview(card, grade) {
    const c = { ...card };
    if (grade === 0) {
      c.reps = 0; c.lapses += 1; c.ivl = 0; c.ease = Math.max(1.3, c.ease - 0.2);
    } else if (grade === 1) {
      c.ivl = Math.max(1, Math.round(c.ivl * 1.2)); c.ease = Math.max(1.3, c.ease - 0.15); c.reps += 1;
    } else if (grade === 2) {
      c.ivl = c.reps <= 0 ? 1 : c.reps === 1 ? 3 : Math.max(c.ivl + 1, Math.round(c.ivl * c.ease)); c.reps += 1;
    } else {
      c.ivl = c.reps <= 0 ? 3 : c.reps === 1 ? 6 : Math.max(c.ivl + 3, Math.round(c.ivl * c.ease * 1.3)); c.ease += 0.15; c.reps += 1;
    }
    return c;
  }

  function grade(id, g) {
    const s = Store.s;
    const c = preview(s.srs[id], g);
    c.due = Store.today() + c.ivl;
    s.srs[id] = c;
    Store.logDay('reviews');
    return c;
  }

  function due() {
    const t = Store.today();
    return Object.entries(Store.s.srs)
      .filter(([, c]) => c.due <= t)
      .sort((a, b) => a[1].due - b[1].due)
      .map(([id]) => id);
  }

  function label(days) {
    if (days <= 0) return 'hoy';
    if (days === 1) return '1 día';
    if (days < 30) return days + ' días';
    if (days < 365) return Math.round(days / 30) + ' mes' + (Math.round(days / 30) > 1 ? 'es' : '');
    return (days / 365).toFixed(1) + ' años';
  }

  // Nivel de dominio para mostrar
  function level(card) {
    if (!card) return 'nuevo';
    if (card.ivl >= 21) return 'dominada';
    if (card.ivl >= 7) return 'madura';
    return 'aprendiendo';
  }

  window.SRS = { addItem, preview, grade, due, label, level };
})();
