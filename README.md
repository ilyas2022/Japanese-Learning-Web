# Nihongo Diario 日本語

Web para aprender japonés útil desde cero: una Ruta de frases completas del día a día ordenadas por utilidad (con desglose palabra a palabra), repaso espaciado tipo test (del día, construir frases y práctica libre), números por temas (precios, horas, fechas, contadores…), hiragana/katakana y frases para ligar, picantes (+18) y palabrotas.

HTML + CSS + JS sin dependencias ni build. El progreso se guarda en el navegador del dispositivo (exporta copias desde Perfil).

## Probar en local
```
npx serve .
```
Abre la URL que muestra. Para verlo en el iPhone (misma WiFi): `http://<IP-del-PC>:3000`.

## Publicar en Vercel
```
npx vercel          # primera vez: login + crear proyecto (acepta los valores por defecto)
npx vercel --prod   # publicar a producción
```
O sube la carpeta a GitHub e impórtala en vercel.com (se redespliega con cada push).

En el iPhone: Safari → URL → Compartir → **Añadir a pantalla de inicio**.

## Guardado en la nube (opcional, gratis)
El progreso se guarda en el móvil y, si activas la nube, también en Upstash Redis a través de `api/progress.js`.
1. En Vercel → tu proyecto → **Storage** → **Create Database** → **Upstash for Redis** (plan Free) → conéctala al proyecto.
2. **Redeploy** (Deployments → ⋯ → Redeploy) para que coja las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
3. En la app: Perfil → Guardar en la nube → **Activar**. Guarda el código; en otro móvil usa "Tengo un código".

## Añadir contenido
- Frases: `data/content.js` (unidades en orden de utilidad) · Kana: `data/kana.js` · Números y temas de práctica: `js/numbers.js`
- Solo frases completas que se dirían tal cual: nada de plantillas con 〜 ni palabras sueltas (lo comprueba `tests/content.test.js`). El molde se explica en la nota.
- El id de cada frase es su texto japonés: puedes reordenar o añadir donde quieras. Si cambias el japonés o quitas una frase, su progreso se borra al abrir la app (no hay migraciones).
- Desglose (6º campo): `'また=otra vez|後で=luego'`, en el orden de la frase. **Obligatorio** si el romaji tiene 2 o más palabras, y las piezas juntas tienen que dar la frase (lo comprueba el test). Con él, "Construir" usa fichas en japonés.
- `'oir'` (7º campo, opcional): frases que te dicen pero no vas a decir tú (いらっしゃいませ, 温めますか？). Solo se practica entenderlas: no tienen memoria de producir ni salen en Construir.
- Ningún significado en español puede repetirse: si dos frases dicen lo mismo, aclara el matiz entre paréntesis.
- Tras cambiar archivos, sube `VERSION` en `sw.js` (p. ej. `nihongo-v9`) para que el iPhone coja la versión nueva.

## Kana
Cada kana nuevo se presenta (sonido + truco en español) justo antes de preguntarlo. Las rondas mezclan leer (あ→a), reconocer (a→あ) y oír, con opciones que se confunden de verdad (`KANA_CONFUSE` en `data/kana.js`: シ/ツ, ぬ/め…). Acertar tardando más de 4 s cuenta como "Difícil". Cuando te sabes tus filas, la app propone la siguiente. "Leer palabras" solo usa palabras escritas con kana que ya has practicado (`kanaReadable`), y se puede elegir o escribir la lectura.

## Iconos
Nada de emojis en la interfaz: `js/icons.js` tiene los iconos de línea (SVG en el propio archivo, basados en Lucide) y el sello hanko (判子) con un kanji para resultados y estados. Cada unidad tiene un kanji como sello (`icon` e `iconRead` en `data/content.js`).

## Repaso espaciado
`js/fsrs.js` implementa FSRS-6 (el algoritmo de Anki) y `js/srs.js` guarda dos memorias por frase: **reconocer** (leer/oír → español) y **producir** (español → japonés), que se desbloquea cuando ya la reconoces bien.

Todo el repaso es tipo test y la nota sale sola de la respuesta (`js/quiz.js`: fallo → Otra vez, duda o lento → Difícil, acierto → Bien, escribir bien y rápido → Fácil). La pregunta se endurece con la memoria: reconocer leyendo → de oído → elegir el japonés o construirlo → escribirlo.

## Tests
```
node --test "tests/*.test.js"
```

## Plan
La hoja de ruta, con lo hecho y lo pendiente, está en [PLAN.md](PLAN.md).
