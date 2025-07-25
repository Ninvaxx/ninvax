import fs from 'fs';
import path from 'path';

const postsDir = path.join(process.cwd(), 'frontend', 'posts');

export function getAllPosts() {
  const files = fs.readdirSync(postsDir);
  return files.map((file) => {
    const fullPath = path.join(postsDir, file);
    const post = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    return post;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPostBySlug(slug) {
  const fullPath = path.join(postsDir, `${slug}.json`);
  const data = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(data);
}
