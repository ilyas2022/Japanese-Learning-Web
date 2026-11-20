# Plan de Nihongo Diario 日本語

Objetivo: **hablar y entender japonés de la vida diaria**, reteniendo a largo plazo.
Principios: recuperar antes que releer · espaciar (FSRS) · producir, no solo reconocer · escuchar mucho · intercalar.
Leyenda: [x] hecho · [ ] pendiente · (🔬) basado en evidencia

## ✅ Lo que ya tenemos
### Contenido
- [x] 518 frases completas en 24 unidades ordenadas por utilidad (18 principales, 4 divertidas, 2 +18): sin plantillas con 〜 ni palabras sueltas, tampoco en las divertidas y +18
- [x] Desglose palabra a palabra en todas las frases de 2+ palabras, y notas de uso
- [x] Universidad y clase, y Médico y farmacia
- [x] Frases "solo para entender" (いらっしゃいませ, 温めますか？…): se practican de oído, nunca se piden producir
- [x] Números: 0-10, decenas, centenas, 万, 9 contadores (con días del mes), días de la semana, y práctica por tema
- [x] Hiragana y katakana con trucos para recordarlos, combinaciones y dakuten
### Aprendizaje
- [x] Reto diario con pestañas Repaso · Nuevas · Test: vas y vuelves cuando quieras sin perder por dónde ibas
- [x] Repaso espaciado tipo test con nota automática (antes: 4 botones de nota a mano)
- [x] Repaso en modos mixto, JP→ES, ES→JP y de oído
- [x] Construir frases con fichas (romaji)
- [x] Práctica libre (más falladas, recientes, al azar, por unidad)
- [x] Números: 15 temas a elegir × 3 tipos de test (oír, leer, decir), en rondas sin repetir y con % de las últimas 20
- [x] Kana: tabla, práctica por filas en ambos sentidos y leer palabras
- [x] Biblioteca (Frases) con filtros por memoria: aprendidas, difíciles, aprendiendo, maduras, dominadas; nivel y próximo repaso en cada frase
### Plataforma
- [x] PWA instalable y sin conexión (service worker)
- [x] Voz japonesa del sistema con velocidad ajustable
- [x] Nube con código secreto (Vercel + Upstash) y exportar/importar
- [x] Sin migraciones: el progreso de las frases que cambian o desaparecen se borra al cargar
- [x] Tema claro/oscuro, romaji opcional, contenido divertido y +18 opcional
- [x] Avisos para instalar en iOS y para hacer copia de seguridad

## Fase 0 · Base
- [x] Hacer commit de los cambios pendientes (content.js, numbers.js, refactor de app.js)
- [x] Crear `tests/` con `node --test` (sin dependencias): FSRS, SRS, migración y romaji → `node --test "tests/*.test.js"`
- [ ] Separar app.js en archivos por vista (`js/views/hoy.js`, `repaso.js`, `numeros.js`, `kana.js`, `frases.js`, `perfil.js`) sin build — *aplazado: mejor hacerlo antes de la Fase 3, cuando app.js crezca*

## Fase 1 · Motor de memoria (🔬 espaciado) ✅
- [x] `js/fsrs.js`: FSRS-6 (estabilidad, dificultad, probabilidad de recordar), pesos por defecto oficiales y retención objetivo del 90 %
- [x] Estado v3: cada frase con memoria separada para **reconocer** (JP/audio→ES) y **producir** (ES→JP)
- [x] Producir se desbloquea cuando reconocer llega a ≥ 3 días de estabilidad
- [x] Migración v2→v3: SM-2 (ivl, ease) → FSRS (S≈ivl, D según ease); producir empieza con S = ivl/2, repartido en varios días
- [x] El día empieza a las 4:00, no a medianoche
- [x] Fuzz en los intervalos (±5 %) para que no se acumulen los repasos el mismo día
- [x] Nuevas en pausa si hay más de 60 repasos pendientes (con botón "aprender igualmente")
- [x] Registrar aciertos y fallos por día (`log[d].ok / fail`) para medir la retención real
- [x] Ajuste "retención objetivo" en Perfil (85 / 90 / 95 %)
- [x] Repaso con modos Mixto / 👁️ Reconocer / 🗣️ Producir / 🎧 Oído y etiqueta del tipo de memoria en cada tarjeta

## Fase 2 · Recuperación de verdad (🔬 testing effect, producción) ✅
- [x] `js/romaji.js`: conversor romaji→kana (っ, ん, ー, wo/o, wa/ha, ou/oo, macrones) con vista previa en kana mientras escribes. Acepta las 541 frases escribiendo su romaji
- [x] Ejercicio "Escribe en japonés" (ES→JP) con corrección tolerante: vocal larga/っ o 1 letra = "casi", con botón "era un despiste"; si fallas pero tu traducción también vale, "mi respuesta también es correcta"
- [x] En Repaso (y Práctica libre), las tarjetas de producir se responden escribiendo; la nota sugerida se resalta (fallo → Otra vez · casi → Difícil · bien → Bien · bien y rápido → Fácil). Opción "prefiero decirlo en voz alta" y ajuste para desactivar la escritura
- [x] Test de Hoy en 2 rondas: 👁️ reconocer (opción múltiple) y después 🗣️ producir (escribir o construir) para cada frase
- [x] Lo fallado vuelve más tarde en la misma sesión (al final en Hoy, a 4 tarjetas en Repaso y Libre)
- [x] Construir frases con fichas en **japonés** cuando la frase tiene desglose (`parts`); el resto, en romaji
- [x] Kana en FSRS: cada kana es una tarjeta; "dominado" = estabilidad ≥ 7 días; botón "Repasar pendientes"; los dominados antiguos se conservan
- [x] La racha cuenta si completas el repaso del día, aunque no hagas nuevas

## Fase 2b · Todo es un test ✅
- [x] `js/quiz.js`: barajas sin repetición, nota FSRS automática, distractores no ambiguos, acierto reciente (con tests)
- [x] Repaso del día, Libre y calentamiento de Hoy: tests (opción múltiple, oído, construir, escribir) en vez de "mostrar respuesta" + nota a mano
- [x] Dificultad progresiva por memoria: reconocer (s < 3) → 50 % de oído → producir eligiendo/construyendo (s < 7) → escribir
- [x] Pantalla de test en modo enfoque: sin cabecera ni barra, botón fijo abajo, cabe a 360×640; al acertar pasa sola; sin textos "¡Correcto!/Era:" (solo verde/rojo)
- [x] Rondas con resumen ("8 de 10 a la primera") y "Repetir las falladas" en Repaso, Números y Kana
- [x] Contenido v4: plantillas 〜 → frases completas, palabras sueltas → frases que las contienen

## Fase 2c · Kana y diseño ✅
- [x] Presentación de cada kana nuevo antes de preguntarlo; rondas mixtas (leer, reconocer, oír)
- [x] Distractores de kana confundibles (シ/ツ, ソ/ン, ぬ/め, ね/れ/わ…) y nota FSRS según rapidez (> 4 s = Difícil)
- [x] Fila siguiente recomendada cuando dominas (≥ 80 %, 2 días) las elegidas
- [x] Leer palabras: solo con kana ya practicados, distractores parecidos y modo Escribir; 54 préstamos útiles (konbini, レジ, ゼミ, マンション…) con falsos amigos
- [x] Trucos en español (fuera los que dependían del inglés: key, toe, nun, axe…)
- [x] Sin emojis: iconos SVG de línea, kanji como sello de cada unidad (挨, 食, 駅…), hanko para resultados (優 良 練 完 済 始) y confeti de pétalos

## Fase 2d · Hoy navegable ✅
- [x] Pestañas Repaso / Nuevas / Test que se pueden pulsar; cada una guarda su avance (salir con ✕ no lo pierde)
- [x] El test se puede hacer antes de ver todas las nuevas; tras el reto, Test es una ronda de práctica (no vuelve a añadir las frases)
- [x] Sin frases a medias en ninguna unidad (test que rechaza 〜, ~ y huecos en japonés, romaji y español)

## Fase 2e · Auditoría de contenido ✅
- [x] Las 37 palabras sueltas que quedaban (picante, palabrotas, slang, manga, resaca) son frases completas que las contienen; se mantiene todo el contenido +18 y los insultos
- [x] Sin significados repetidos en español (今どこ？ / どこにいる？, 行こう！ / 行くぞ！) y sin frases con el mismo audio (すみません / すみません！)
- [x] Desglose en las 170 frases que no lo tenían: "Construir" usa fichas en japonés en todas
- [x] Campo `'oir'` para frases que solo se oyen: sin memoria de producir, el test de Hoy las repite de oído y no salen en Construir
- [x] Unidades nuevas: Universidad y clase (20) y Médico y farmacia (12)
- [x] Fuera frases redundantes o de poco uso: どこにいる？ (= 今どこ？), 待って！, もう一回, おけ, 学生です, 暇, 免税できますか, なに？！, 一緒に行こう！, 笑
- [x] Fuera las migraciones (`legacy-map.js`, `renamed.js`): más simple; el progreso de lo que cambia se pierde
- [x] "Mis frases" sale de Repaso (estaba duplicada) y sus filtros pasan a la biblioteca
- [x] Tests: español único, desglose obligatorio y que coincide con la frase, palabras sueltas prohibidas, borrado del progreso huérfano

## Fase 3 · Escuchar y hablar (🔬 HVPT, shadowing)
- [ ] Repetir el audio lento/normal y alternar la voz (Kyoko/Otoya) si están disponibles
- [ ] Tarjetas "solo oído" para las frases maduras (dictado: escribe lo que oyes en romaji→kana)
- [ ] Modo sombra: oír → grabarte (MediaRecorder) → escuchar los dos seguidos
- [ ] Comprobación oral opcional con SpeechRecognition `ja-JP` si el navegador la soporta
- [ ] Mini diálogos por unidad (4-6 líneas) con preguntas de comprensión

## Fase 4 · Comprensión y contexto (🔬 elaboración, generación)
- [ ] Furigana (`<ruby>`) sobre los kanji en lugar de una línea de kana aparte
- [ ] Pretest en las nuevas: "¿qué crees que significa?" con el desglose antes de la respuesta
- [ ] Frases difíciles (≥ 4 fallos): pedir tu propio truco, guardarlo y mostrarlo en el reverso
- [ ] Moldes: ejercicios de sustitución (〜たい, 〜が好き, 〜てもいい) con palabras ya aprendidas
- [ ] Romaji gradual: ocultarlo cuando domines el 80 % del hiragana (con opción de verlo tocando)

## Fase 5 · Motivación y datos
- [x] Perfil: retención real de 30 días (frente al objetivo)
- [ ] Perfil: previsión de repasos a 7 días y calendario de actividad
- [ ] Meta diaria en minutos o tarjetas y aviso de "repaso pendiente" al abrir
- [ ] Sincronización con fusión por tarjeta (gana la más reciente por `t`), no por estado entero
- [ ] Comprobar que el payload de sync sigue por debajo de 512 KB con el log nuevo

## Fase 6 · Contenido
- [x] Desglose en las frases que no lo tienen (preguntas, compras, transporte, emergencias, romántico…)
- [ ] Contadores y números irregulares como tarjetas FSRS ("3 personas = さんにん"); hoy van por temas con % reciente
- [x] Más unidades útiles: universidad, médico/farmacia
- [ ] Más unidades: trabajo, casa/alquiler, teléfono, ayuntamiento (en Japón: 区役所, 在留カード)
- [ ] Revisar con un nativo las notas de uso de las unidades divertidas y +18

## Ideas para más adelante
- [ ] Acento tonal (pitch accent) en las palabras clave
- [ ] Optimizar los pesos de FSRS con tu propio historial
- [ ] Notificaciones push de repaso (PWA)

## Evidencia en la que se basa
| Método | Evidencia | En la app |
|---|---|---|
| Práctica de recuperación | Utilidad alta (Dunlosky et al., 2013) | Recordar escribiendo o en voz alta, no releer |
| Práctica espaciada | Utilidad alta (Dunlosky et al., 2013) | FSRS con retención objetivo del 90 % |
| FSRS frente a SM-2 | Benchmark open-spaced-repetition (~10k colecciones de Anki): predice mejor para ~99 % de los usuarios | Sustituye a SM-2 |
| Producir frente a reconocer | Nakata 2015; Schmitt: producir se adquiere después y es más difícil | Memoria separada para reconocer y producir |
| Intercalar | Utilidad moderada (Dunlosky) | Sesiones mezcladas |
| Elaboración y pretest | Utilidad moderada (Dunlosky); Kornell et al. 2009 | Trucos propios y "adivina antes" |
| Escucha con varias voces (HVPT) | Metaanálisis de 79 estudios, efecto medio-grande (Uchihara et al., SSLA 2025) | Dos voces y dos velocidades |
| Shadowing | Estudios pequeños y positivos (sobre todo escucha); sin metaanálisis | Modo sombra con grabación |
| Releer / subrayar | Utilidad baja (Dunlosky) | La biblioteca es solo de consulta |

## Registro de cambios
- 2026-11-19 · Auditoría, investigación y creación de este plan.
- 2026-11-19 · Fase 1: FSRS-6, memorias de reconocer/producir, migración v3, día a las 4:00, fuzz, pausa de nuevas, retención real, racha por repaso. Tests de FSRS/SRS/migración. SW `nihongo-v6`.
- 2026-11-19 · Fase 2: escribir en romaji→kana con corrección tolerante, nota sugerida, test de Hoy en 2 rondas (reconocer → producir), construir con fichas en japonés, kana con FSRS y pendientes. 19 tests. SW `nihongo-v7`.
- 2026-11-20 · Fase 2b: todo tipo test con nota automática y dificultad progresiva, pantalla de test sin scroll, números por temas (0-10 sin repetir, meses, días del mes, días de la semana…) con % de las últimas 20, contenido sin plantillas ni palabras sueltas (migración v4). 37 tests. SW `nihongo-v8`.
- 2026-11-20 · Fase 2c: método de kana revisado (presentación, oído, confundibles, rapidez, fila siguiente, palabras legibles) e interfaz sin emojis (iconos SVG, sellos kanji, hanko). 41 tests. SW `nihongo-v9`.
- 2026-11-20 · Fase 2e: auditoría de contenido (palabras sueltas → frases, duplicados, desglose completo, frases solo de oído, universidad y médico, fuera frases redundantes), sin migraciones y biblioteca con filtros por memoria. 47 tests. SW `nihongo-v11`.
- 2026-11-20 · Fase 2d: pestañas navegables en Hoy, práctica tras el reto, traducciones sin puntos suspensivos y test de contenido para todas las unidades. 42 tests. SW `nihongo-v10`.
