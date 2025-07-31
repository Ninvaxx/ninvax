const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { formatISO } = require('date-fns');
const slugify = require('slugify');

const baseDir = path.join(__dirname, 'content');
const postsDir = path.join(baseDir, 'posts');

const assetDirs = ['images', 'videos', 'audio'];

if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

function processFile(type, filePath) {
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const slug = slugify(base, { lower: true, strict: true });
  const dest = path.join(postsDir, `${slug}.json`);

  if (fs.existsSync(dest)) return;

  let metadata = {
    title: base,
    type,
    tags: [],
    createdAt: formatISO(new Date())
  };

  if (ext === '.md') {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    metadata.title = parsed.data.title || metadata.title;
    metadata.type = parsed.data.type || metadata.type;
    metadata.tags = parsed.data.tags || metadata.tags;
    if (parsed.data.date) {
      metadata.createdAt = formatISO(new Date(parsed.data.date));
    }
  }

  fs.writeFileSync(dest, JSON.stringify(metadata, null, 2));
  console.log(`Created metadata for ${filePath}`);
}

assetDirs.forEach(type => {
  const dir = path.join(baseDir, type);
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isFile()) {
      processFile(type, filePath);
    }
  });
});
