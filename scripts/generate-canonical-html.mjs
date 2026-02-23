/**
 * Post-build script: generates path-specific HTML files with correct
 * <link rel="canonical"> in the initial document so Google sees the right
 * canonical without relying on JavaScript (fixes "Duplicate, Google chose
 * different canonical than user" in Search Console).
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const baseUrl = 'https://djkurtmaui.com';

const ROUTES = [
  { path: '', file: 'index.html' },      // /
  { path: 'about', file: 'about.html' },
  { path: 'services', file: 'services.html' },
  { path: 'media', file: 'media.html' },
  { path: 'testimonials', file: 'testimonials.html' },
  { path: 'contact', file: 'contact.html' },
  { path: 'book', file: 'book.html' },
];

const indexPath = join(distDir, 'index.html');
let baseHtml = readFileSync(indexPath, 'utf-8');

// Remove any existing canonical so we control it per file
baseHtml = baseHtml.replace(/\s*<link[^>]*rel="canonical"[^>]*>\s*/gi, '');

for (const { path, file } of ROUTES) {
  const canonicalUrl = path ? `${baseUrl}/${path}` : `${baseUrl}/`;
  const canonicalTag = `\n      <link rel="canonical" href="${canonicalUrl}" />`;
  const withCanonical = baseHtml.replace('</head>', `${canonicalTag}\n    </head>`);
  const outPath = join(distDir, file);
  writeFileSync(outPath, withCanonical);
  console.log(`Wrote ${file} with canonical ${canonicalUrl}`);
}

console.log('Canonical HTML generation done.');
