// Pronunciación con la voz japonesa del sistema (en iPhone: Kyoko / Otoya).
(function () {
  let voice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = speechSynthesis.getVoices();
    const ja = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('ja'));
    voice = ja.find((v) => /kyoko|otoya|o-ren|google/i.test(v.name)) || ja[0] || null;
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }

  function speak(text) {
    if (!('speechSynthesis' in window) || !text) return;
    // quitar marcas que no se deben leer
    const clean = String(text).replace(/[〜~（）()・]/g, ' ');
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'ja-JP';
    if (voice) u.voice = voice;
    u.rate = (window.Store && Store.s && Store.s.settings.rate) || 0.85;
    speechSynthesis.speak(u);
  }

  window.Speech = { speak, available: () => 'speechSynthesis' in window };
})();
