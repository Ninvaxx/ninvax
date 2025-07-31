const fs = require('fs');
const path = require('path');
const { formatISO } = require('date-fns');
const slugify = require('slugify');

const baseDir = path.join(__dirname, '..', 'content');
const postsDir = path.join(baseDir, 'posts');
const assetDirs = ['images', 'videos', 'audio'];

if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

function inferTags(name) {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(s => s.toLowerCase());
}

function readDescription(dir, base) {
  const variants = [
    `${base}.description.txt`,
    `${base}.meta`,
    `${base}.txt`,
  ];
  for (const f of variants) {
    const p = path.join(dir, f);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      return fs.readFileSync(p, 'utf8').trim();
    }
  }
  return '';
}

assetDirs.forEach(type => {
  const dir = path.join(baseDir, type);
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    if (file.startsWith('.')) return;
    const filePath = path.join(dir, file);
    if (!fs.statSync(filePath).isFile()) return;

    const ext = path.extname(file);
    const base = path.basename(file, ext);
    const slug = slugify(base, { lower: true, strict: true });
    const dest = path.join(postsDir, `${slug}.json`);

    const stat = fs.statSync(filePath);

    const metadata = {
      filename: file,
      extension: ext,
      type,
      title: base.replace(/[-_]/g, ' '),
      tags: inferTags(base),
      createdAt: formatISO(stat.birthtime || stat.mtime),
      description: readDescription(dir, base)
    };

    fs.writeFileSync(dest, JSON.stringify(metadata, null, 2));
    console.log(`Created metadata for ${file}`);
  });
});
