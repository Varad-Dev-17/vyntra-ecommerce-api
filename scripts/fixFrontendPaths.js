import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Handle single quotes
  content = content.replaceAll("import.meta.env.VITE_API_URL || 'http://localhost:8000'", "(import.meta.env.PROD ? '' : 'http://localhost:8000')");
  // Handle double quotes
  content = content.replaceAll('import.meta.env.VITE_API_URL || "http://localhost:8000"', '(import.meta.env.PROD ? "" : "http://localhost:8000")');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    changed++;
  }
});

console.log(`Updated ${changed} files with dynamic production URLs.`);
