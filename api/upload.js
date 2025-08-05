import formidable from 'formidable';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm({
    fileWriteStreamHandler: () => null, // 不写入硬盘
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Form parse error' });
    }

    const file = files.file;
    if (!file || !file[0]) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const buffer = await file[0].toBuffer();

      const fileIoResponse = await fetch('https://file.io/?expires=1w', {
        method: 'POST',
        body: buffer,
        headers: {
          'Content-Type': file[0].mimetype || 'application/octet-stream',
        },
      });

      const data = await fileIoResponse.json();

      if (!fileIoResponse.ok || !data.success) {
        console.error('Upload to file.io failed:', data);
        return res.status(500).json({ error: 'Upload to file.io failed' });
      }

      res.status(200).json(data);
    } catch (e) {
      console.error('Upload handler error:', e);
      res.status(500).json({ error: e.message });
    }
  });
}
