import { readFileSync, readdirSync } from 'fs';
import path from 'path';

const cssFiles = readdirSync('.', { recursive:true })
  .filter(f => f.endsWith('.css') && !f.includes('vendor'));

const tokens = [
  '--clr-bg','--clr-surface','--clr-primary','--clr-primary-2',
  '--clr-accent','--clr-text','--page-max','--radius','--t-fast','--t-med'
];

let violations = [];

for (const file of cssFiles) {
  const txt = readFileSync(file,'utf8');
  const lines = txt.split(/\n/).map((l,i)=>[i+1,l]);
  for (const [num,line] of lines) {
    const m = line.match(/#[0-9a-f]{3,6}|rgba?\([^)]*\)/gi);
    if (m && !tokens.some(t=>line.includes(`var(${t}`)))
      violations.push(`${file}:${num}  ${m.join(', ')}`);
  }
}
if (violations.length) {
  console.error('Design‑token violations:\n'+violations.join('\n'));
  process.exit(1);
}