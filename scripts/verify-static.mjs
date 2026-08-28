import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', 'about/index.html', 'resume/index.html', 'contact/index.html', 'cv/index.html'];
const problems = [];

pages.forEach((page) => {
  const filePath = path.join(root, page);
  if (!fs.existsSync(filePath)) return problems.push(`Missing page: ${page}`);
  const html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('{{') || html.includes('@foreach') || html.includes('@php')) problems.push(`Blade syntax remains in ${page}`);
  for (const match of html.matchAll(/(?:src|href)="(\/[^"?#]+)"/g)) {
    const localPath = match[1].endsWith('/') ? path.join(root, match[1], 'index.html') : path.join(root, match[1]);
    if (!fs.existsSync(localPath)) problems.push(`${page} references missing ${match[1]}`);
  }
});

const data = JSON.parse(fs.readFileSync(path.join(root, 'data/resume.json'), 'utf8'));
const projectCount = data.experiences.reduce((total, experience) => total + experience.projects.length, 0);
if (data.experiences.length !== 3 || projectCount !== 34) problems.push('Fallback data counts do not match Laravel');
data.experiences.forEach((experience) => {
  const bulletCount = String(experience.description || '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean).length;
  if (bulletCount < 5 || bulletCount > 6) {
    problems.push(`Experience ${experience.id} must contain 5–6 CV description bullets; received ${bulletCount}`);
  }
});

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('Static frontend verified: 5 pages, 3 experiences, 34 projects.');
