// Vercel Serverless Function: guarda/lee el progreso en Upstash Redis.
//   GET  /api/progress?code=XXXX           -> { updatedAt, data } | 404
//   PUT  /api/progress?code=XXXX  {updatedAt, data}
// Variables de entorno (las crea la integración "Upstash for Redis" del Marketplace de Vercel):
//   KV_REST_API_URL + KV_REST_API_TOKEN   (o UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const MAX_BYTES = 512 * 1024;

async function redis(command) {
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  if (!r.ok) throw new Error('Redis ' + r.status);
  return (await r.json()).result;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_ || !TOKEN) return res.status(503).json({ error: 'not-configured' });

  const code = String((req.query && req.query.code) || '');
  if (!/^[a-z0-9]{16,64}$/.test(code)) return res.status(400).json({ error: 'bad-code' });
  const key = 'nihongo:progress:' + code;

  try {
    if (req.method === 'GET') {
      const raw = await redis(['GET', key]);
      if (!raw) return res.status(404).json({ error: 'not-found' });
      return res.status(200).send(raw);
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || typeof body.updatedAt !== 'number' || typeof body.data !== 'object') {
        return res.status(400).json({ error: 'bad-body' });
      }
      const raw = JSON.stringify({ updatedAt: body.updatedAt, data: body.data });
      if (raw.length > MAX_BYTES) return res.status(413).json({ error: 'too-large' });
      await redis(['SET', key, raw]);
      return res.status(200).json({ ok: true, updatedAt: body.updatedAt });
    }
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'method' });
  } catch (e) {
    return res.status(500).json({ error: 'server' });
  }
};
