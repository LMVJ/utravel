import fs from 'fs';
import formidable from 'formidable';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false, // 禁用内置body解析器
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Form parsing error' });
      return;
    }

    const file = files.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    try {
      const fileBuffer = fs.readFileSync(file.filepath);

      const fileIoResponse = await fetch('https://file.io/?expires=1w', {
        method: 'POST',
        body: fileBuffer,
        headers: {
          'Content-Type': file.mimetype || 'application/octet-stream',
        },
      });

      const data = await fileIoResponse.json();

      if (!fileIoResponse.ok || !data.success) {
        res
          .status(500)
          .json({ error: data.message || 'File.io upload failed' });
        return;
      }

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
