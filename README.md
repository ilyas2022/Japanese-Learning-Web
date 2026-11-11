# Nihongo Diario 日本語

Web para aprender japonés desde cero: reto de 5 palabras al día, repaso espaciado, hiragana/katakana y frases (básicas, manga, románticas, ligar, graciosas, insultos).

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

## Añadir contenido
- Palabras: `data/vocab.js` · Frases: `data/phrases.js` · Kana: `data/kana.js`
- Añade siempre **al final** de cada lista (el id depende de la posición; si no, se mezcla el progreso).
- Tras cambiar archivos, sube `VERSION` en `sw.js` (p. ej. `nihongo-v2`) para que el iPhone coja la versión nueva.
