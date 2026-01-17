import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixEntityImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix ../entity.js to ../entity/index.js
  if (content.includes("from '../entity.js'")) {
    content = content.replace(/from '\.\.\/entity\.js'/g, "from '../entity/index.js'");
    modified = true;
  }

  // Fix ./entity.js to ./entity/index.js
  if (content.includes("from './entity.js'")) {
    content = content.replace(/from '\.\/entity\.js'/g, "from './entity/index.js'");
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function processDirectory(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      count += processDirectory(filePath);
    } else if (file.endsWith('.js')) {
      if (fixEntityImports(filePath)) {
        console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
        count++;
      }
    }
  });

  return count;
}

const srcDir = path.join(__dirname, 'src');
const count = processDirectory(srcDir);
console.log(`\n✅ Total files fixed: ${count}`);
