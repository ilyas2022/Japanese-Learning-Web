# Plan de Nihongo Diario 日本語

Objetivo: **hablar y entender japonés de la vida diaria**, reteniendo a largo plazo.
Principios: recuperar antes que releer · espaciar (FSRS) · producir, no solo reconocer · escuchar mucho · intercalar.
Leyenda: [x] hecho · [ ] pendiente · (🔬) basado en evidencia

## ✅ Lo que ya tenemos
### Contenido
- [x] 541 frases y palabras en 22 unidades ordenadas por utilidad (16 principales, 4 divertidas, 2 +18)
- [x] Desglose palabra a palabra (en parte) y notas de uso
- [x] Números: 0-10, decenas, centenas, 万, 8 contadores y días de la semana
- [x] Hiragana y katakana con trucos para recordarlos, combinaciones y dakuten
### Aprendizaje
- [x] Reto diario: repaso → nuevas (con audio) → test (significado, inverso, escucha, construir)
- [x] Repaso espaciado SM-2 con 4 notas (Otra vez / Difícil / Bien / Fácil)
- [x] Repaso en modos mixto, JP→ES, ES→JP y de oído
- [x] Construir frases con fichas (romaji)
- [x] Práctica libre (más falladas, recientes, al azar, por unidad)
- [x] Números: dictado, leer, precios, horas y contadores (con trampas)
- [x] Kana: tabla, práctica por filas en ambos sentidos y leer palabras
- [x] "Mis frases" con filtros por nivel y búsqueda
### Plataforma
- [x] PWA instalable y sin conexión (service worker)
- [x] Voz japonesa del sistema con velocidad ajustable
- [x] Nube con código secreto (Vercel + Upstash) y exportar/importar
- [x] Migración del progreso v1 → v2
- [x] Tema claro/oscuro, romaji opcional, contenido divertido y +18 opcional
- [x] Avisos para instalar en iOS y para hacer copia de seguridad

## Fase 0 · Base
- [ ] Hacer commit de los cambios pendientes (content.js, numbers.js, refactor de app.js)
- [ ] Crear `tests/` con `node --test` (sin dependencias) para srs/fsrs y romaji→kana
- [ ] Separar app.js en archivos por vista (`js/views/hoy.js`, `repaso.js`, `numeros.js`, `kana.js`, `frases.js`, `perfil.js`) sin build

## Fase 1 · Motor de memoria (🔬 espaciado)
- [ ] `js/fsrs.js`: FSRS (estabilidad, dificultad, probabilidad de recordar), pesos por defecto y retención objetivo del 90 %
- [ ] Estado v3: cada frase con memoria separada para **reconocer** (JP/audio→ES) y **producir** (ES→JP)
- [ ] Producir se desbloquea cuando reconocer llega a ≥ 3 días de estabilidad
- [ ] Migración v2→v3: SM-2 (ivl, ease) → FSRS (S≈ivl, D según ease); producir empieza con S = ivl/2
- [ ] El día empieza a las 4:00, no a medianoche
- [ ] Fuzz en los intervalos (±5 %) para que no se acumulen los repasos el mismo día
- [ ] Límite diario de repasos y nuevas automáticas a 0 si hay más de 60 pendientes
- [ ] Registrar aciertos y fallos por día (`log[d].ok / fail`) para medir la retención real
- [ ] Ajuste "retención objetivo" en Perfil (85 / 90 / 95 %)

## Fase 2 · Recuperación de verdad (🔬 testing effect, producción)
- [ ] `js/romaji.js`: conversor romaji→kana (っ, ん, ー, wo/o, wa/ha, ou/oo) con vista previa en kana mientras escribes
- [ ] Ejercicio "Escribe en japonés" (ES→JP) con corrección tolerante (1 error = "casi", con botón "la tenía bien")
- [ ] En Repaso, las tarjetas de producir se responden escribiendo; la nota se sugiere sola (fallo → Otra vez; correcto y rápido → Bien/Fácil)
- [ ] Test de Hoy: al menos 1 ejercicio de producción por frase; opción múltiple solo como primer contacto
- [ ] Repetir al final de la sesión lo que fallaste (espaciado dentro de la sesión)
- [ ] Construir frases con fichas de **kana** (usando el desglose `parts` cuando exista)
- [ ] Kana en FSRS: cada kana es una tarjeta (reconocer y escribir); "dominado" según la estabilidad
- [ ] La racha cuenta si completas el repaso del día, aunque no hagas nuevas

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
- [ ] Perfil: retención real de 30 días, previsión de repasos a 7 días y calendario de actividad
- [ ] Meta diaria en minutos o tarjetas y aviso de "repaso pendiente" al abrir
- [ ] Sincronización con fusión por tarjeta (gana la más reciente por `t`), no por estado entero
- [ ] Comprobar que el payload de sync sigue por debajo de 512 KB con el log nuevo

## Fase 6 · Contenido
- [ ] Desglose en las frases que no lo tienen (preguntas, compras, transporte, emergencias, romántico…)
- [ ] Contadores y números irregulares como tarjetas FSRS ("3 personas = さんにん")
- [ ] Más unidades útiles: médico/farmacia, trabajo, casa/alquiler, teléfono
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
