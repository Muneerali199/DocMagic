import fs from 'fs';
import path from 'path';

const PKG = path.resolve(__dirname, '../package.json');

interface PJ {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const pin = (d?: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(d ?? {}).map(([k, v]) => [k, v.replace(/^[\^~>=<]+/, '')])
  );

const pkg: PJ = JSON.parse(fs.readFileSync(PKG, 'utf8'));
pkg.dependencies = pin(pkg.dependencies);
pkg.devDependencies = pin(pkg.devDependencies);
fs.writeFileSync(PKG, JSON.stringify(pkg, null, 2) + '\n');
console.log('Deps pinned. Run: npm install && git add package.json package-lock.json');
