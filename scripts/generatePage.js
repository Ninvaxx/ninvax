const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '..', 'content', 'posts');
const templatesDir = path.join(__dirname, '..', 'templates');
const layout = fs.readFileSync(path.join(templatesDir, 'layout.html'), 'utf8');
const outDir = path.join(__dirname, '..', 'posts');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function buildContent(post) {
  const mediaPath = path.posix.join('content', post.type, post.filename);
  let media = '';
  if (post.type === 'images') {
    media = `<img src="/${mediaPath}" alt="${post.title}" />`;
  } else if (post.type === 'videos') {
    media = `<video controls src="/${mediaPath}"></video>`;
  } else if (post.type === 'audio') {
    media = `<audio controls src="/${mediaPath}"></audio>`;
  }
  const tags = post.tags && post.tags.length ? `<p>Tags: ${post.tags.join(', ')}</p>` : '';
  const desc = post.description ? `<p>${post.description}</p>` : '';
  return `<h1>${post.title}</h1>\n${media}\n${desc}\n${tags}`;
}

fs.readdirSync(postsDir).forEach(file => {
  if (!file.endsWith('.json')) return;
  const post = JSON.parse(fs.readFileSync(path.join(postsDir, file), 'utf8'));
  const content = buildContent(post);
  const page = layout.replace('{{title}}', post.title).replace('{{content}}', content);
  const dest = path.join(outDir, file.replace('.json', '.html'));
  fs.writeFileSync(dest, page);
  console.log(`Generated page ${dest}`);
});
