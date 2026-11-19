# Nihongo Diario 日本語

Web para aprender japonés útil desde cero: una Ruta de frases del día a día ordenadas por utilidad (con desglose palabra a palabra), repaso espaciado con 3 modos (del día, construir frases y práctica libre), números con contadores, hiragana/katakana y frases para ligar, picantes (+18) y palabrotas.

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
- Frases y palabras: `data/content.js` (unidades en orden de utilidad) · Kana: `data/kana.js` · Números: `js/numbers.js`
- El id de cada frase es su texto japonés: puedes reordenar o añadir donde quieras, pero **no cambies el japonés** de una frase existente (perdería su progreso).
- Desglose opcional (6º campo): `'また=otra vez|後で=luego'`, en el orden de la frase.
- `data/legacy-map.js` traduce el progreso de la versión antigua (ids por posición). No editar.
- Tras cambiar archivos, sube `VERSION` en `sw.js` (p. ej. `nihongo-v7`) para que el iPhone coja la versión nueva.

## Repaso espaciado
`js/fsrs.js` implementa FSRS-6 (el algoritmo de Anki) y `js/srs.js` guarda dos memorias por frase: **reconocer** (leer/oír → español) y **producir** (español → japonés), que se desbloquea cuando ya la reconoces bien.

## Tests
```
node --test "tests/*.test.js"
```

## Plan
La hoja de ruta, con lo hecho y lo pendiente, está en [PLAN.md](PLAN.md).
