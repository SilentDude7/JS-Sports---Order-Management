import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();


app.get('/.git/*', (req, res) => {
  try {
    const fileName = req.path.replace(/^\/\.git\//, '');
    const filePath = path.join(process.cwd(), '.git', fileName);

    if (!filePath.startsWith(path.join(process.cwd(), '.git'))) return res.status(403).send('Forbidden');
    if (!fs.existsSync(filePath)) return res.status(404).send('Not found');

    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Demo server running at http://localhost:${PORT}`));
