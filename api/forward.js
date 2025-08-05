export default async function handler(req, res) {
  const url = req.query.url;

  if (!url) {
    res.status(400).json({ error: 'Missing target URL' });
    return;
  }

  try {
    const targetUrl = decodeURIComponent(url);

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && {
          Authorization: req.headers.authorization,
        }),
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.text(); // 如果返回 JSON，可以用 response.json()
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
}
